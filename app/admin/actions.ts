"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { submissions, notes, auditLogs, profiles, teamMembers, assignments } from "@/db/schema";
import { requireUser, requireRole, type Role } from "@/lib/auth";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { eq, ilike, or, count, desc, asc, and, gte, lte, ne, type SQL } from "drizzle-orm";
import { notifyDoctorAssignment, sendStaffCredentials } from "@/lib/email";

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
  const { user } = await requireRole("EDITOR");

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
  const { user } = await requireRole("EDITOR");

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

  revalidatePath(`/admin/submissions/${submissionId}`);
  return note;
}

// ── CSV export ────────────────────────────────────────────────────────────────

export async function exportSubmissionsCsv(status?: SubmissionStatus) {
  const { user } = await requireRole("EDITOR");

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

export async function inviteUser(
  email: string,
  password: string,
  role: Role,
): Promise<{ error: string | null }> {
  try {
    await requireRole("ADMIN");
  } catch {
    return { error: "You don't have permission to invite users." };
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role },
  });

  if (error) return { error: error.message };

  // Seed profile immediately so the role is correct from first login
  if (data.user) {
    await db.insert(profiles).values({
      id: data.user.id,
      email: data.user.email!,
      fullName: null,
      role,
    }).onConflictDoNothing();
  }

  await sendStaffCredentials(email, password, role);

  revalidatePath("/admin/settings");
  return { error: null };
}

export async function updateUserRole(profileId: string, newRole: Role) {
  const { user } = await requireRole("ADMIN");
  if (profileId === user.id) throw new Error("You cannot change your own role.");

  await db.update(profiles).set({ role: newRole }).where(eq(profiles.id, profileId));
  revalidatePath("/admin/settings");
}

export async function revokeUser(profileId: string) {
  const { user } = await requireRole("ADMIN");
  if (profileId === user.id) throw new Error("You cannot revoke your own account.");

  await supabaseAdmin.auth.admin.deleteUser(profileId);
  await db.delete(profiles).where(eq(profiles.id, profileId));
  revalidatePath("/admin/settings");
}

// ── Team members ──────────────────────────────────────────────────────────────

export async function listTeamMembers() {
  await requireUser();
  return db
    .select()
    .from(teamMembers)
    .orderBy(asc(teamMembers.displayOrder), asc(teamMembers.createdAt));
}

export async function getTeamMember(id: string) {
  await requireUser();
  const [member] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.id, id))
    .limit(1);
  return member ?? null;
}

export async function createTeamMember(data: {
  name: string;
  title: string;
  credentials: string[];
  bio: string;
  photo?: string;
  email?: string;
  displayOrder?: number;
}) {
  await requireRole("EDITOR");

  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  await db.insert(teamMembers).values({
    slug,
    name: data.name,
    title: data.title,
    credentials: data.credentials,
    bio: data.bio,
    photo: data.photo ?? null,
    email: data.email ?? null,
    displayOrder: data.displayOrder ?? 0,
  });

  revalidatePath("/admin/team");
  revalidatePath("/");
}

export async function updateTeamMember(
  id: string,
  data: {
    name: string;
    title: string;
    credentials: string[];
    bio: string;
    photo?: string | null;
    email?: string | null;
    displayOrder?: number;
  }
) {
  await requireRole("EDITOR");

  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  await db
    .update(teamMembers)
    .set({
      slug,
      name: data.name,
      title: data.title,
      credentials: data.credentials,
      bio: data.bio,
      ...(data.photo !== undefined ? { photo: data.photo } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      displayOrder: data.displayOrder ?? 0,
    })
    .where(eq(teamMembers.id, id));

  revalidatePath("/admin/team");
  revalidatePath("/");
}

export async function deleteTeamMember(id: string) {
  await requireRole("EDITOR");
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
  revalidatePath("/admin/team");
  revalidatePath("/");
}

// ── Doctor upcoming schedule ──────────────────────────────────────────────────

export async function getDoctorUpcomingAssignments(teamMemberId: string) {
  await requireUser();
  const now = new Date();
  return db
    .select({
      id: assignments.id,
      scheduledAt: assignments.scheduledAt,
      submissionId: assignments.submissionId,
      patientName: submissions.fullName,
      service: submissions.service,
      phone: submissions.phone,
      email: submissions.email,
      type: submissions.type,
    })
    .from(assignments)
    .innerJoin(submissions, eq(assignments.submissionId, submissions.id))
    .where(
      and(
        eq(assignments.teamMemberId, teamMemberId),
        gte(assignments.scheduledAt, now),
      )
    )
    .orderBy(asc(assignments.scheduledAt));
}

// ── Assignments ───────────────────────────────────────────────────────────────

export async function getAssignment(submissionId: string) {
  await requireUser();
  const [row] = await db
    .select({
      id: assignments.id,
      submissionId: assignments.submissionId,
      teamMemberId: assignments.teamMemberId,
      scheduledAt: assignments.scheduledAt,
      createdAt: assignments.createdAt,
      doctorName: teamMembers.name,
      doctorTitle: teamMembers.title,
      doctorEmail: teamMembers.email,
    })
    .from(assignments)
    .innerJoin(teamMembers, eq(assignments.teamMemberId, teamMembers.id))
    .where(eq(assignments.submissionId, submissionId))
    .limit(1);
  return row ?? null;
}

export async function assignSubmission(
  submissionId: string,
  teamMemberId: string,
  scheduledAt: Date,
): Promise<{ error: string } | { error: null }> {
  let user: Awaited<ReturnType<typeof requireRole>>["user"];
  try {
    ({ user } = await requireRole("EDITOR"));
  } catch {
    return { error: "You don't have permission to assign submissions." };
  }

  const [submission] = await db
    .select({ status: submissions.status })
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1);

  if (!submission) return { error: "Submission not found." };
  if (submission.status !== "BOOKED")
    return { error: "Only BOOKED submissions can be assigned." };

  // 30-minute collision window, excluding re-assignment of the same submission
  const windowMs = 30 * 60 * 1000;
  const lower = new Date(scheduledAt.getTime() - windowMs);
  const upper = new Date(scheduledAt.getTime() + windowMs);

  const conflicts = await db
    .select({ id: assignments.id })
    .from(assignments)
    .where(
      and(
        eq(assignments.teamMemberId, teamMemberId),
        gte(assignments.scheduledAt, lower),
        lte(assignments.scheduledAt, upper),
        ne(assignments.submissionId, submissionId),
      )
    )
    .limit(1);

  if (conflicts.length > 0)
    return {
      error:
        "This doctor already has an appointment within 30 minutes of that time. Please choose a different slot.",
    };

  await db
    .insert(assignments)
    .values({ submissionId, teamMemberId, scheduledAt })
    .onConflictDoUpdate({
      target: assignments.submissionId,
      set: { teamMemberId, scheduledAt },
    });

  await db.insert(auditLogs).values({
    submissionId,
    actorId: user.id,
    action: "ASSIGNED",
    detail: `Scheduled for ${scheduledAt.toISOString()}`,
  });

  // Email the doctor — fire and forget, never block the action
  const [doctor] = await db
    .select({ email: teamMembers.email, name: teamMembers.name })
    .from(teamMembers)
    .where(eq(teamMembers.id, teamMemberId))
    .limit(1);

  if (doctor?.email) {
    notifyDoctorAssignment(doctor.email, doctor.name, scheduledAt).catch(() => {});
  }

  revalidatePath(`/admin/submissions/${submissionId}`);
  return { error: null };
}
