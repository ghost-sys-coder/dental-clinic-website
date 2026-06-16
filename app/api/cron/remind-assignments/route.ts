import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assignments, teamMembers } from "@/db/schema";
import { and, isNull, gte, lte, eq } from "drizzle-orm";
import { notifyDoctorReminder } from "@/lib/email";

export const runtime = "nodejs";
// Vercel cron calls are always GET requests
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Target window: appointments 25–35 minutes from now that haven't been reminded yet.
  // Running every minute means each appointment is only inside this window for ~10 ticks,
  // but reminderSentAt ensures only the first tick actually sends the email.
  const windowStart = new Date(now.getTime() + 25 * 60_000);
  const windowEnd   = new Date(now.getTime() + 35 * 60_000);

  const due = await db
    .select({
      id: assignments.id,
      scheduledAt: assignments.scheduledAt,
      doctorName: teamMembers.name,
      doctorEmail: teamMembers.email,
    })
    .from(assignments)
    .innerJoin(teamMembers, eq(assignments.teamMemberId, teamMembers.id))
    .where(
      and(
        gte(assignments.scheduledAt, windowStart),
        lte(assignments.scheduledAt, windowEnd),
        isNull(assignments.reminderSentAt),
      )
    );

  const results: { id: string; status: "sent" | "no_email" | "error"; error?: string }[] = [];

  await Promise.allSettled(
    due.map(async (row) => {
      if (!row.doctorEmail) {
        // Mark as "sent" anyway so we don't retry on every tick
        await db
          .update(assignments)
          .set({ reminderSentAt: now })
          .where(eq(assignments.id, row.id));
        results.push({ id: row.id, status: "no_email" });
        return;
      }

      try {
        await notifyDoctorReminder(row.doctorEmail, row.doctorName, row.scheduledAt);
        await db
          .update(assignments)
          .set({ reminderSentAt: now })
          .where(eq(assignments.id, row.id));
        results.push({ id: row.id, status: "sent" });
      } catch (err) {
        results.push({
          id: row.id,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })
  );

  return NextResponse.json({ processed: results.length, results });
}
