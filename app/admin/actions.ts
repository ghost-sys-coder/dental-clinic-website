"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  submissions,
  notes,
  auditLogs,
  profiles,
  teamMembers,
  assignments,
  availabilityBlocks,
  patients,
} from "@/db/schema";
import { requireUser, requireRole, type Role } from "@/lib/auth";
import { supabaseAdmin } from "@/utils/supabase/admin";
import {
  eq,
  ilike,
  or,
  count,
  desc,
  asc,
  and,
  gte,
  lte,
  ne,
  lt,
  gt,
  notInArray,
  sql,
  type SQL,
} from "drizzle-orm";
import { notifyDoctorAssignment, sendStaffCredentials } from "@/lib/email";

type SubmissionStatus =
  | "NEW"
  | "CONTACTED"
  | "WAITING_FOR_RESPONSE"
  | "BOOKED"
  | "ATTENDED"
  | "TREATMENT_PLANNED"
  | "CONVERTED"
  | "LOST"
  | "ARCHIVED";

type AppointmentStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_TREATMENT"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED"
  | "RESCHEDULED";

type AppointmentDuration = "30" | "45" | "60" | "90" | "120";

const TERMINAL_STATUSES: AppointmentStatus[] = ["COMPLETED", "NO_SHOW", "CANCELLED", "RESCHEDULED"];

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

// ── Patients list ─────────────────────────────────────────────────────────────

type PatientStatus = "NEW" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

export async function listPatients({
  status,
  query,
  page = 1,
}: {
  status?: PatientStatus;
  query?: string;
  page?: number;
}) {
  await requireUser();

  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  const filters: SQL[] = [];
  if (status) filters.push(eq(patients.status, status));
  if (query) {
    filters.push(
      or(
        ilike(patients.fullName, `%${query}%`),
        ilike(patients.email, `%${query}%`),
        ilike(patients.phone, `%${query}%`)
      )!
    );
  }

  const where = filters.length > 0 ? and(...filters) : undefined;

  const lastVisitSq = sql<string | null>`(
    SELECT MAX(a.scheduled_at)
    FROM assignments a
    JOIN submissions s ON a.submission_id = s.id
    WHERE s.patient_id = ${patients.id}
      AND a.appt_status = 'COMPLETED'
  )`;

  const nextVisitSq = sql<string | null>`(
    SELECT MIN(a.scheduled_at)
    FROM assignments a
    JOIN submissions s ON a.submission_id = s.id
    WHERE s.patient_id = ${patients.id}
      AND a.appt_status IN ('REQUESTED', 'CONFIRMED', 'CHECKED_IN', 'IN_TREATMENT')
      AND a.scheduled_at > NOW()
  )`;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: patients.id,
        fullName: patients.fullName,
        email: patients.email,
        phone: patients.phone,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        address: patients.address,
        emergencyContact: patients.emergencyContact,
        medicalAlerts: patients.medicalAlerts,
        allergies: patients.allergies,
        insuranceProvider: patients.insuranceProvider,
        status: patients.status,
        createdAt: patients.createdAt,
        preferredDoctorName: teamMembers.name,
        lastVisit: lastVisitSq,
        nextVisit: nextVisitSq,
      })
      .from(patients)
      .leftJoin(teamMembers, eq(patients.preferredDoctorId, teamMembers.id))
      .where(where)
      .orderBy(desc(patients.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ total: count() }).from(patients).where(where),
  ]);

  return { rows, total, page, pageSize: PAGE_SIZE };
}

// ── Patient detail / create / update ─────────────────────────────────────────

type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export async function getPatient(id: string) {
  await requireUser();

  const [row] = await db
    .select({
      id:                 patients.id,
      fullName:           patients.fullName,
      email:              patients.email,
      phone:              patients.phone,
      dateOfBirth:        patients.dateOfBirth,
      gender:             patients.gender,
      address:            patients.address,
      emergencyContact:   patients.emergencyContact,
      medicalAlerts:      patients.medicalAlerts,
      allergies:          patients.allergies,
      insuranceProvider:  patients.insuranceProvider,
      preferredDoctorId:  patients.preferredDoctorId,
      status:             patients.status,
      createdAt:          patients.createdAt,
      updatedAt:          patients.updatedAt,
    })
    .from(patients)
    .where(eq(patients.id, id));

  return row ?? null;
}

export async function createPatient(data: {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  address?: string | null;
  emergencyContact?: string | null;
  medicalAlerts?: string[];
  allergies?: string[];
  insuranceProvider?: string | null;
  preferredDoctorId?: string | null;
  status?: PatientStatus;
}) {
  await requireRole("EDITOR");

  const [row] = await db.insert(patients).values({
    fullName:          data.fullName,
    email:             data.email,
    phone:             data.phone,
    dateOfBirth:       data.dateOfBirth ?? null,
    gender:            data.gender ?? null,
    address:           data.address ?? null,
    emergencyContact:  data.emergencyContact ?? null,
    medicalAlerts:     data.medicalAlerts ?? [],
    allergies:         data.allergies ?? [],
    insuranceProvider: data.insuranceProvider ?? null,
    preferredDoctorId: data.preferredDoctorId ?? null,
    status:            data.status ?? "NEW",
  }).returning({ id: patients.id });

  revalidatePath("/admin/patients");
  return { id: row.id };
}

export async function updatePatient(
  id: string,
  data: {
    fullName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string | null;
    gender?: Gender | null;
    address?: string | null;
    emergencyContact?: string | null;
    medicalAlerts?: string[];
    allergies?: string[];
    insuranceProvider?: string | null;
    preferredDoctorId?: string | null;
    status?: PatientStatus;
  }
) {
  await requireRole("EDITOR");

  await db.update(patients).set(data).where(eq(patients.id, id));

  revalidatePath("/admin/patients");
  revalidatePath(`/admin/patients/${id}`);
}

// ── Submission detail ─────────────────────────────────────────────────────────

export async function getSubmission(id: string) {
  const user = await requireUser();

  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, id),
    with: {
      patient: true,
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
      apptStatus: assignments.apptStatus,
      duration: assignments.duration,
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
        notInArray(assignments.apptStatus, ["CANCELLED", "NO_SHOW", "RESCHEDULED"]),
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
      apptStatus: assignments.apptStatus,
      duration: assignments.duration,
      treatmentType: assignments.treatmentType,
      roomOrChair: assignments.roomOrChair,
      createdAt: assignments.createdAt,
      doctorName: teamMembers.name,
      doctorTitle: teamMembers.title,
      doctorEmail: teamMembers.email,
    })
    .from(assignments)
    .innerJoin(teamMembers, eq(assignments.teamMemberId, teamMembers.id))
    .where(
      and(
        eq(assignments.submissionId, submissionId),
        notInArray(assignments.apptStatus, ["RESCHEDULED", "CANCELLED"]),
      )
    )
    .orderBy(desc(assignments.createdAt))
    .limit(1);
  return row ?? null;
}

export async function assignSubmission(
  submissionId: string,
  teamMemberId: string,
  scheduledAt: Date,
  options?: {
    duration?: AppointmentDuration;
    treatmentType?: string;
    roomOrChair?: string;
  },
): Promise<{ error: null } | { error: string; blockConflict?: { startsAt: string; endsAt: string; reason: string | null } }> {
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

  const duration = options?.duration ?? "60";
  const durationMs = parseInt(duration) * 60 * 1000;
  const newEnd = new Date(scheduledAt.getTime() + durationMs);

  // Fetch candidates that could overlap (window = new slot + max existing duration of 120 min)
  const candidates = await db
    .select({
      id: assignments.id,
      scheduledAt: assignments.scheduledAt,
      duration: assignments.duration,
    })
    .from(assignments)
    .where(
      and(
        eq(assignments.teamMemberId, teamMemberId),
        ne(assignments.submissionId, submissionId),
        notInArray(assignments.apptStatus, ["CANCELLED", "RESCHEDULED", "NO_SHOW"]),
        gte(assignments.scheduledAt, new Date(scheduledAt.getTime() - 120 * 60 * 1000)),
        lt(assignments.scheduledAt, newEnd),
      )
    );

  const hasConflict = candidates.some((c) => {
    const existingEnd = new Date(
      c.scheduledAt.getTime() + parseInt(c.duration) * 60 * 1000
    );
    return c.scheduledAt < newEnd && existingEnd > scheduledAt;
  });

  if (hasConflict)
    return {
      error:
        "This doctor already has an overlapping appointment at that time. Please choose a different slot.",
    };

  // Check availability blocks — doctor is blocked during this window
  const [blockConflict] = await db
    .select({
      reason:   availabilityBlocks.reason,
      startsAt: availabilityBlocks.startsAt,
      endsAt:   availabilityBlocks.endsAt,
    })
    .from(availabilityBlocks)
    .where(
      and(
        eq(availabilityBlocks.teamMemberId, teamMemberId),
        lt(availabilityBlocks.startsAt, newEnd),
        gt(availabilityBlocks.endsAt, scheduledAt),
      )
    )
    .limit(1);

  if (blockConflict)
    return {
      error: "This doctor is unavailable during that time slot.",
      blockConflict: {
        startsAt: blockConflict.startsAt.toISOString(),
        endsAt:   blockConflict.endsAt.toISOString(),
        reason:   blockConflict.reason,
      },
    };

  // Upsert: update existing active assignment or insert a new one
  const [existingAppt] = await db
    .select({ id: assignments.id })
    .from(assignments)
    .where(
      and(
        eq(assignments.submissionId, submissionId),
        notInArray(assignments.apptStatus, ["RESCHEDULED", "CANCELLED"]),
      )
    )
    .orderBy(desc(assignments.createdAt))
    .limit(1);

  if (existingAppt) {
    await db
      .update(assignments)
      .set({
        teamMemberId,
        scheduledAt,
        duration,
        treatmentType: options?.treatmentType ?? null,
        roomOrChair: options?.roomOrChair ?? null,
      })
      .where(eq(assignments.id, existingAppt.id));
  } else {
    await db.insert(assignments).values({
      submissionId,
      teamMemberId,
      scheduledAt,
      duration,
      treatmentType: options?.treatmentType ?? null,
      roomOrChair: options?.roomOrChair ?? null,
      apptStatus: "REQUESTED",
    });
  }

  await db.insert(auditLogs).values({
    submissionId,
    actorId: user.id,
    action: "ASSIGNED",
    detail: `Scheduled for ${scheduledAt.toISOString()} (${duration} min)`,
  });

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

// ── Submission notes (for appointment detail page) ────────────────────────────

export async function listNotesBySubmission(submissionId: string) {
  await requireUser();
  return db
    .select({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      authorName: profiles.fullName,
      authorEmail: profiles.email,
    })
    .from(notes)
    .leftJoin(profiles, eq(notes.authorId, profiles.id))
    .where(eq(notes.submissionId, submissionId))
    .orderBy(desc(notes.createdAt));
}

// ── Appointment detail ────────────────────────────────────────────────────────

export async function getAppointmentDetail(id: string) {
  await requireUser();
  const [row] = await db
    .select({
      id: assignments.id,
      submissionId: assignments.submissionId,
      teamMemberId: assignments.teamMemberId,
      scheduledAt: assignments.scheduledAt,
      apptStatus: assignments.apptStatus,
      duration: assignments.duration,
      treatmentType: assignments.treatmentType,
      roomOrChair: assignments.roomOrChair,
      cancellationReason: assignments.cancellationReason,
      followUpDate: assignments.followUpDate,
      rescheduledFromId: assignments.rescheduledFromId,
      createdAt: assignments.createdAt,
      updatedAt: assignments.updatedAt,
      doctorName: teamMembers.name,
      doctorTitle: teamMembers.title,
      doctorPhoto: teamMembers.photo,
      doctorEmail: teamMembers.email,
      patientName: submissions.fullName,
      patientEmail: submissions.email,
      patientPhone: submissions.phone,
      service: submissions.service,
      submissionStatus: submissions.status,
      preferredDate: submissions.preferredDate,
      message: submissions.message,
    })
    .from(assignments)
    .innerJoin(teamMembers, eq(assignments.teamMemberId, teamMembers.id))
    .innerJoin(submissions, eq(assignments.submissionId, submissions.id))
    .where(eq(assignments.id, id))
    .limit(1);
  return row ?? null;
}

// ── Appointment status ────────────────────────────────────────────────────────

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  opts?: { cancellationReason?: string },
): Promise<{ error: string | null }> {
  let user: Awaited<ReturnType<typeof requireRole>>["user"];
  try {
    ({ user } = await requireRole("EDITOR"));
  } catch {
    return { error: "You don't have permission to update appointments." };
  }

  const [existing] = await db
    .select({ apptStatus: assignments.apptStatus, submissionId: assignments.submissionId })
    .from(assignments)
    .where(eq(assignments.id, id))
    .limit(1);

  if (!existing) return { error: "Appointment not found." };
  if (TERMINAL_STATUSES.includes(existing.apptStatus as AppointmentStatus))
    return { error: `Appointment is already ${existing.apptStatus} and cannot be changed.` };

  await db
    .update(assignments)
    .set({
      apptStatus: status,
      ...(status === "CANCELLED" && opts?.cancellationReason
        ? { cancellationReason: opts.cancellationReason }
        : {}),
    })
    .where(eq(assignments.id, id));

  await db.insert(auditLogs).values({
    submissionId: existing.submissionId,
    actorId: user.id,
    action: "APPT_STATUS_CHANGE",
    detail: `${existing.apptStatus} -> ${status}${opts?.cancellationReason ? `: ${opts.cancellationReason}` : ""}`,
  });

  revalidatePath(`/admin/appointments/${id}`);
  revalidatePath("/admin/appointments");
  return { error: null };
}

export async function markNoShow(id: string): Promise<{ error: string | null }> {
  return updateAppointmentStatus(id, "NO_SHOW");
}

export async function cancelAppointment(
  id: string,
  reason?: string,
): Promise<{ error: string | null }> {
  return updateAppointmentStatus(id, "CANCELLED", { cancellationReason: reason });
}

// ── Reschedule ────────────────────────────────────────────────────────────────

export async function rescheduleAppointment(
  id: string,
  newDoctorId: string,
  newScheduledAt: Date,
  options?: {
    duration?: AppointmentDuration;
    treatmentType?: string;
    roomOrChair?: string;
  },
): Promise<{ error: null; newId: string } | { error: string; blockConflict?: { startsAt: string; endsAt: string; reason: string | null } }> {
  let user: Awaited<ReturnType<typeof requireRole>>["user"];
  try {
    ({ user } = await requireRole("EDITOR"));
  } catch {
    return { error: "You don't have permission to reschedule appointments." };
  }

  const [existing] = await db
    .select({
      submissionId: assignments.submissionId,
      scheduledAt: assignments.scheduledAt,
      teamMemberId: assignments.teamMemberId,
      apptStatus: assignments.apptStatus,
    })
    .from(assignments)
    .where(eq(assignments.id, id))
    .limit(1);

  if (!existing) return { error: "Appointment not found." };
  if (TERMINAL_STATUSES.includes(existing.apptStatus as AppointmentStatus))
    return { error: `Appointment is ${existing.apptStatus} and cannot be rescheduled.` };

  const duration = options?.duration ?? "60";
  const durationMs = parseInt(duration) * 60 * 1000;
  const newEnd = new Date(newScheduledAt.getTime() + durationMs);

  // Collision check for the new doctor/time, excluding this submission's slot
  const candidates = await db
    .select({
      id: assignments.id,
      scheduledAt: assignments.scheduledAt,
      duration: assignments.duration,
    })
    .from(assignments)
    .where(
      and(
        eq(assignments.teamMemberId, newDoctorId),
        ne(assignments.submissionId, existing.submissionId),
        notInArray(assignments.apptStatus, ["CANCELLED", "RESCHEDULED", "NO_SHOW"]),
        gte(assignments.scheduledAt, new Date(newScheduledAt.getTime() - 120 * 60 * 1000)),
        lt(assignments.scheduledAt, newEnd),
      )
    );

  const hasConflict = candidates.some((c) => {
    const existingEnd = new Date(
      c.scheduledAt.getTime() + parseInt(c.duration) * 60 * 1000
    );
    return c.scheduledAt < newEnd && existingEnd > newScheduledAt;
  });

  if (hasConflict)
    return {
      error:
        "That doctor already has an overlapping appointment. Please choose a different time.",
    };

  // Check availability blocks for the new doctor/time
  const [rescheduleBlockConflict] = await db
    .select({
      reason:   availabilityBlocks.reason,
      startsAt: availabilityBlocks.startsAt,
      endsAt:   availabilityBlocks.endsAt,
    })
    .from(availabilityBlocks)
    .where(
      and(
        eq(availabilityBlocks.teamMemberId, newDoctorId),
        lt(availabilityBlocks.startsAt, newEnd),
        gt(availabilityBlocks.endsAt, newScheduledAt),
      )
    )
    .limit(1);

  if (rescheduleBlockConflict)
    return {
      error: "That doctor is unavailable during that time slot.",
      blockConflict: {
        startsAt: rescheduleBlockConflict.startsAt.toISOString(),
        endsAt:   rescheduleBlockConflict.endsAt.toISOString(),
        reason:   rescheduleBlockConflict.reason,
      },
    };

  const oldDetail = `${existing.teamMemberId}@${existing.scheduledAt.toISOString()}`;
  const newDetail = `${newDoctorId}@${newScheduledAt.toISOString()} (${duration} min)`;

  // Mark old appointment as RESCHEDULED (preserve history)
  await db
    .update(assignments)
    .set({ apptStatus: "RESCHEDULED" })
    .where(eq(assignments.id, id));

  // Create new appointment record for the new slot
  const [newAppt] = await db
    .insert(assignments)
    .values({
      submissionId: existing.submissionId,
      teamMemberId: newDoctorId,
      scheduledAt: newScheduledAt,
      apptStatus: "CONFIRMED",
      duration,
      treatmentType: options?.treatmentType ?? null,
      roomOrChair: options?.roomOrChair ?? null,
      rescheduledFromId: id,
    })
    .returning({ id: assignments.id });

  await db.insert(auditLogs).values({
    submissionId: existing.submissionId,
    actorId: user.id,
    action: "RESCHEDULED",
    detail: `${oldDetail} -> ${newDetail}`,
  });

  const [doctor] = await db
    .select({ email: teamMembers.email, name: teamMembers.name })
    .from(teamMembers)
    .where(eq(teamMembers.id, newDoctorId))
    .limit(1);

  if (doctor?.email) {
    notifyDoctorAssignment(doctor.email, doctor.name, newScheduledAt).catch(() => {});
  }

  revalidatePath(`/admin/appointments/${id}`);
  revalidatePath(`/admin/appointments/${newAppt.id}`);
  revalidatePath("/admin/appointments");
  return { error: null, newId: newAppt.id };
}

// ── Appointment details update ────────────────────────────────────────────────

export async function updateAppointmentDetails(
  id: string,
  data: {
    duration?: AppointmentDuration;
    treatmentType?: string | null;
    roomOrChair?: string | null;
    followUpDate?: string | null;
  },
): Promise<{ error: string | null }> {
  try {
    await requireRole("EDITOR");
  } catch {
    return { error: "You don't have permission to update appointments." };
  }

  await db
    .update(assignments)
    .set({
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
      ...(data.treatmentType !== undefined ? { treatmentType: data.treatmentType } : {}),
      ...(data.roomOrChair !== undefined ? { roomOrChair: data.roomOrChair } : {}),
      ...(data.followUpDate !== undefined ? { followUpDate: data.followUpDate } : {}),
    })
    .where(eq(assignments.id, id));

  revalidatePath(`/admin/appointments/${id}`);
  return { error: null };
}

// ── Week calendar ─────────────────────────────────────────────────────────────

export async function getWeekAppointments(weekStart: Date) {
  await requireUser();

  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [appts, blocks] = await Promise.all([
    db
      .select({
        id: assignments.id,
        submissionId: assignments.submissionId,
        teamMemberId: assignments.teamMemberId,
        scheduledAt: assignments.scheduledAt,
        apptStatus: assignments.apptStatus,
        duration: assignments.duration,
        treatmentType: assignments.treatmentType,
        roomOrChair: assignments.roomOrChair,
        doctorName: teamMembers.name,
        patientName: submissions.fullName,
        service: submissions.service,
      })
      .from(assignments)
      .innerJoin(teamMembers, eq(assignments.teamMemberId, teamMembers.id))
      .innerJoin(submissions, eq(assignments.submissionId, submissions.id))
      .where(
        and(
          gte(assignments.scheduledAt, weekStart),
          lt(assignments.scheduledAt, weekEnd),
          notInArray(assignments.apptStatus, ["CANCELLED", "NO_SHOW", "RESCHEDULED"]),
        )
      )
      .orderBy(asc(assignments.scheduledAt)),

    db
      .select({
        id: availabilityBlocks.id,
        teamMemberId: availabilityBlocks.teamMemberId,
        startsAt: availabilityBlocks.startsAt,
        endsAt: availabilityBlocks.endsAt,
        reason: availabilityBlocks.reason,
        doctorName: teamMembers.name,
      })
      .from(availabilityBlocks)
      .innerJoin(teamMembers, eq(availabilityBlocks.teamMemberId, teamMembers.id))
      .where(
        and(
          lt(availabilityBlocks.startsAt, weekEnd),
          gte(availabilityBlocks.endsAt, weekStart),
        )
      )
      .orderBy(asc(availabilityBlocks.startsAt)),
  ]);

  return { appointments: appts, blocks };
}

// ── Availability blocks ───────────────────────────────────────────────────────

export async function listAvailabilityBlocks(opts?: {
  doctorId?: string;
  from?: Date;
  to?: Date;
}) {
  await requireUser();

  const filters: SQL[] = [];
  if (opts?.doctorId) filters.push(eq(availabilityBlocks.teamMemberId, opts.doctorId));
  if (opts?.from) filters.push(gte(availabilityBlocks.endsAt, opts.from));
  if (opts?.to) filters.push(lte(availabilityBlocks.startsAt, opts.to));

  const where = filters.length > 0 ? and(...filters) : undefined;

  return db
    .select({
      id: availabilityBlocks.id,
      teamMemberId: availabilityBlocks.teamMemberId,
      startsAt: availabilityBlocks.startsAt,
      endsAt: availabilityBlocks.endsAt,
      reason: availabilityBlocks.reason,
      createdAt: availabilityBlocks.createdAt,
    })
    .from(availabilityBlocks)
    .where(where)
    .orderBy(asc(availabilityBlocks.startsAt));
}

export async function createAvailabilityBlock(
  doctorId: string,
  startsAt: Date,
  endsAt: Date,
  reason?: string,
): Promise<{ error: string | null }> {
  let user: Awaited<ReturnType<typeof requireRole>>["user"];
  try {
    ({ user } = await requireRole("EDITOR"));
  } catch {
    return { error: "You don't have permission to manage availability." };
  }

  if (endsAt <= startsAt)
    return { error: "End time must be after start time." };

  await db.insert(availabilityBlocks).values({
    teamMemberId: doctorId,
    startsAt,
    endsAt,
    reason: reason ?? null,
    createdBy: user.id,
  });

  revalidatePath("/admin/appointments");
  revalidatePath(`/admin/team/${doctorId}`);
  return { error: null };
}

export async function deleteAvailabilityBlock(id: string): Promise<{ error: string | null }> {
  try {
    await requireRole("EDITOR");
  } catch {
    return { error: "You don't have permission to manage availability." };
  }

  await db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, id));

  revalidatePath("/admin/appointments");
  return { error: null };
}

// ── Patient ↔ Submission linking ──────────────────────────────────────────────

export async function searchPatients(query: string) {
  await requireUser();

  if (!query.trim()) return [];

  return db
    .select({
      id: patients.id,
      fullName: patients.fullName,
      email: patients.email,
      phone: patients.phone,
      status: patients.status,
    })
    .from(patients)
    .where(
      or(
        ilike(patients.fullName, `%${query}%`),
        ilike(patients.email, `%${query}%`),
        ilike(patients.phone, `%${query}%`),
      )!
    )
    .orderBy(asc(patients.fullName))
    .limit(10);
}

export async function convertSubmissionToPatient(submissionId: string) {
  const { user } = await requireRole("EDITOR");

  const [sub] = await db
    .select({
      fullName: submissions.fullName,
      email: submissions.email,
      phone: submissions.phone,
      patientId: submissions.patientId,
    })
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1);

  if (!sub) throw new Error("Submission not found.");
  if (sub.patientId) throw new Error("This submission is already linked to a patient.");

  const [newPatient] = await db
    .insert(patients)
    .values({
      fullName: sub.fullName,
      email: sub.email,
      phone: sub.phone,
      status: "NEW",
    })
    .returning({ id: patients.id });

  await db
    .update(submissions)
    .set({ patientId: newPatient.id })
    .where(eq(submissions.id, submissionId));

  await db.insert(auditLogs).values({
    submissionId,
    actorId: user.id,
    action: "PATIENT_LINKED",
    detail: `Created patient ${newPatient.id} from submission`,
  });

  revalidatePath(`/admin/submissions/${submissionId}`);
  revalidatePath("/admin/patients");
  return { patientId: newPatient.id };
}

export async function linkSubmissionToPatient(submissionId: string, patientId: string) {
  const { user } = await requireRole("EDITOR");

  const [sub] = await db
    .select({ patientId: submissions.patientId })
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1);

  if (!sub) throw new Error("Submission not found.");
  if (sub.patientId) throw new Error("This submission is already linked to a patient. Unlink it first.");

  await db
    .update(submissions)
    .set({ patientId })
    .where(eq(submissions.id, submissionId));

  await db.insert(auditLogs).values({
    submissionId,
    actorId: user.id,
    action: "PATIENT_LINKED",
    detail: `Linked to existing patient ${patientId}`,
  });

  revalidatePath(`/admin/submissions/${submissionId}`);
}

export async function unlinkSubmissionFromPatient(submissionId: string) {
  const { user } = await requireRole("EDITOR");

  const [sub] = await db
    .select({ patientId: submissions.patientId })
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1);

  if (!sub) throw new Error("Submission not found.");

  await db
    .update(submissions)
    .set({ patientId: null })
    .where(eq(submissions.id, submissionId));

  await db.insert(auditLogs).values({
    submissionId,
    actorId: user.id,
    action: "PATIENT_UNLINKED",
    detail: `Unlinked from patient ${sub.patientId ?? "unknown"}`,
  });

  revalidatePath(`/admin/submissions/${submissionId}`);
}

export async function listPatientSubmissions(patientId: string) {
  await requireUser();

  return db
    .select({
      id: submissions.id,
      fullName: submissions.fullName,
      email: submissions.email,
      phone: submissions.phone,
      service: submissions.service,
      status: submissions.status,
      type: submissions.type,
      createdAt: submissions.createdAt,
    })
    .from(submissions)
    .where(eq(submissions.patientId, patientId))
    .orderBy(desc(submissions.createdAt));
}
