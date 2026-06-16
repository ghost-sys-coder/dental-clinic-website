import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { assignments, teamMembers, submissions } from "@/db/schema";
import { and, gte, lte, eq } from "drizzle-orm";
import { notifyDoctorDailySchedule } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Window: midnight → end of today (UTC)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999);

  const todaySlots = await db
    .select({
      doctorId: teamMembers.id,
      doctorName: teamMembers.name,
      doctorEmail: teamMembers.email,
      scheduledAt: assignments.scheduledAt,
      patientName: submissions.fullName,
      service: submissions.service,
    })
    .from(assignments)
    .innerJoin(teamMembers, eq(assignments.teamMemberId, teamMembers.id))
    .innerJoin(submissions, eq(assignments.submissionId, submissions.id))
    .where(
      and(
        gte(assignments.scheduledAt, todayStart),
        lte(assignments.scheduledAt, todayEnd),
      )
    )
    .orderBy(assignments.scheduledAt);

  // Group by doctor
  const byDoctor = new Map<
    string,
    {
      name: string;
      email: string | null;
      slots: { scheduledAt: Date; patientName: string; service: string | null }[];
    }
  >();

  for (const row of todaySlots) {
    if (!byDoctor.has(row.doctorId)) {
      byDoctor.set(row.doctorId, { name: row.doctorName, email: row.doctorEmail, slots: [] });
    }
    byDoctor.get(row.doctorId)!.slots.push({
      scheduledAt: row.scheduledAt,
      patientName: row.patientName,
      service: row.service,
    });
  }

  const results: { doctor: string; status: "sent" | "no_email" | "error"; error?: string }[] = [];

  await Promise.allSettled(
    [...byDoctor.values()].map(async ({ name, email, slots }) => {
      if (!email) {
        results.push({ doctor: name, status: "no_email" });
        return;
      }
      try {
        await notifyDoctorDailySchedule(email, name, slots);
        results.push({ doctor: name, status: "sent" });
      } catch (err) {
        results.push({
          doctor: name,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })
  );

  return NextResponse.json({ processed: results.length, results });
}
