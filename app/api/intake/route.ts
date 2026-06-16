import { NextRequest } from "next/server";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { intakeSchema } from "@/lib/schemas";
import { notifyNewSubmission } from "@/lib/email";

// Simple in-memory rate limiter: max 5 submissions per IP per 10 minutes
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

  const result = intakeSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: "Validation failed", issues: result.error.flatten() }, { status: 422 });
  }

  const data = result.data;

  // Honeypot check
  if (data._hp) {
    return Response.json({ success: true }); // silent reject
  }

  try {
    await db.insert(submissions).values({
      type: data.type === "contact" ? "CONTACT" : "APPOINTMENT",
      status: "NEW",
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      service: data.service || null,
      preferredDate: data.preferredDate || null,
      message: data.notes || null,
      source: data.source ?? "booking_form",
    });

    await notifyNewSubmission();

    return Response.json({ success: true });
  } catch (err) {
    console.error("[intake] DB error:", err);
    // Never leak DB error details to client
    return Response.json({ error: "Unable to process request" }, { status: 500 });
  }
}
