import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { notifyNewSubmission } from "@/lib/email";

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional().default(""),
  message: z.string().optional(),
  source: z.string().optional(),
});

// Simple in-memory rate limiter: max 5 leads per IP per 10 minutes
const ipTimestamps = new Map<string, number[]>();
const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipTimestamps.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT) return true;
  ipTimestamps.set(ip, [...timestamps, now]);
  return false;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = leadSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: "Validation failed", issues: result.error.flatten() }, { status: 422 });
  }

  const data = result.data;

  try {
    await db.insert(submissions).values({
      type: "CONTACT",
      status: "NEW",
      fullName: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message || null,
      source: data.source ?? "new_patient_offer",
    });

    await notifyNewSubmission();

    return Response.json({ success: true });
  } catch (err) {
    console.error("[lead] DB error:", err);
    return Response.json({ error: "Unable to process request" }, { status: 500 });
  }
}
