"use server";

import { db } from "@/db";
import { submissions, notes, auditLogs, profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { eq, ilike, or, count, desc, and, type SQL } from "drizzle-orm";

type SubmissionStatus = "NEW" | "CONTACTED" | "BOOKED" | "ARCHIVED";

// ── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  await requireUser();

  const [statusCounts, recentRows] = await Promise.all([
    db
      .select({ status: submissions.status, count: count() })
      .from(submissions)
      .groupBy(submissions.status),
    db
      .select()
      .from(submissions)
      .orderBy(desc(submissions.createdAt))
      .limit(5),
  ]);

  return { statusCounts, recent: recentRows };
}

// ── Submissions list ─────────────────────────────────────────────────────────

export async function listSubmissions({
  status,
  query,
  page = 1,
}: {
  status?: SubmissionStatus;
  query?: string;
  page?: number;
}) {
  await requireUser();

  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  const filters: SQL[] = [];
  if (status) filters.push(eq(submissions.status, status));
  if (query) {
    filters.push(
      or(
        ilike(submissions.fullName, `%${query}%`),
        ilike(submissions.email, `%${query}%`),
        ilike(submissions.phone, `%${query}%`)
      )!
    );
  }

  const where = filters.length > 0 ? and(...filters) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(submissions)
      .where(where)
      .orderBy(desc(submissions.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ total: count() }).from(submissions).where(where),
  ]);

  return { rows, total, page, pageSize: PAGE_SIZE };
}

// ── Submission detail ─────────────────────────────────────────────────────────

export async function getSubmission(id: string) {
  const user = await requireUser();

  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, id),
    with: {
      notes: {
        with: { author: true },
        orderBy: [desc(notes.createdAt)],
      },
      auditLogs: {
        with: { actor: true },
        orderBy: [desc(auditLogs.createdAt)],
      },
    },
  });

  if (!submission) return null;

  await db.insert(auditLogs).values({
    submissionId: id,
    actorId: user.id,
    action: "VIEW",
  });

  return submission;
}

// ── Status update ─────────────────────────────────────────────────────────────

export async function updateSubmissionStatus(id: string, status: SubmissionStatus) {
  const user = await requireUser();

  const [existing] = await db
    .select({ status: submissions.status })
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);

  if (!existing) throw new Error("Not found");

  await db.update(submissions).set({ status }).where(eq(submissions.id, id));

  await db.insert(auditLogs).values({
    submissionId: id,
    actorId: user.id,
    action: "STATUS_CHANGE",
    detail: `${existing.status} -> ${status}`,
  });
}

// ── Notes ────────────────────────────────────────────────────────────────────

export async function addNote(submissionId: string, body: string) {
  const user = await requireUser();

  if (!body.trim()) throw new Error("Note body cannot be empty");

  const [note] = await db
    .insert(notes)
    .values({ submissionId, authorId: user.id, body: body.trim() })
    .returning();

  await db.insert(auditLogs).values({
    submissionId,
    actorId: user.id,
    action: "NOTE_ADD",
  });

  return note;
}

// ── CSV export ────────────────────────────────────────────────────────────────

export async function exportSubmissionsCsv(status?: SubmissionStatus) {
  const user = await requireUser();

  const where = status ? eq(submissions.status, status) : undefined;
  const rows = await db
    .select()
    .from(submissions)
    .where(where)
    .orderBy(desc(submissions.createdAt));

  await db.insert(auditLogs).values({
    actorId: user.id,
    action: "EXPORT",
    detail: status ? `status=${status}` : "all",
  });

  const header = "id,type,status,fullName,email,phone,service,preferredDate,message,source,createdAt";
  const csvRows = rows.map((r) =>
    [
      r.id,
      r.type,
      r.status,
      `"${(r.fullName ?? "").replace(/"/g, '""')}"`,
      r.email,
      r.phone,
      r.service ?? "",
      r.preferredDate ?? "",
      `"${(r.message ?? "").replace(/"/g, '""')}"`,
      r.source ?? "",
      r.createdAt.toISOString(),
    ].join(",")
  );

  return [header, ...csvRows].join("\n");
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function listStaff() {
  await requireUser();
  return db.select().from(profiles).orderBy(profiles.createdAt);
}
