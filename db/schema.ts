import {
  pgTable,
  pgEnum,
  text,
  uuid,
  timestamp,
  index,
  integer,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ─────────────────────────────────────────────────────────────────────

export const submissionType = pgEnum("submission_type", ["APPOINTMENT", "CONTACT"]);
export const submissionStatus = pgEnum("submission_status", [
  "NEW",
  "CONTACTED",
  "WAITING_FOR_RESPONSE",
  "BOOKED",
  "ATTENDED",
  "TREATMENT_PLANNED",
  "CONVERTED",
  "LOST",
  "ARCHIVED",
]);
export const roleEnum = pgEnum("role", ["ADMIN", "EDITOR", "VIEWER"]);

export const appointmentStatus = pgEnum("appointment_status", [
  "REQUESTED",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_TREATMENT",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
  "RESCHEDULED",
]);

export const appointmentDuration = pgEnum("appointment_duration", [
  "30", "45", "60", "90", "120",
]);

// ── Tables ────────────────────────────────────────────────────────────────────

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  role: roleEnum("role").notNull().default("VIEWER"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: submissionType("type").notNull(),
  status: submissionStatus("status").notNull().default("NEW"),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  service: text("service"),
  preferredDate: text("preferred_date"),
  preferredTime: text("preferred_time"),
  message: text("message"),
  source: text("source"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("submissions_status_idx").on(t.status),
  index("submissions_created_at_idx").on(t.createdAt),
]);

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => profiles.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("notes_submission_idx").on(t.submissionId),
]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => submissions.id, { onDelete: "set null" }),
  actorId: uuid("actor_id").notNull().references(() => profiles.id),
  action: text("action").notNull(),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("audit_submission_idx").on(t.submissionId),
  index("audit_actor_idx").on(t.actorId),
]);

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  credentials: text("credentials").array().notNull().default([]),
  bio: text("bio").notNull().default(""),
  photo: text("photo"),
  email: text("email"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const assignments = pgTable("assignments", {
  // ── existing columns ─────────────────────────────────────────────────────
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  teamMemberId: uuid("team_member_id").notNull().references(() => teamMembers.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

  // ── appointment-management columns ───────────────────────────────────────
  apptStatus: appointmentStatus("appt_status").notNull().default("REQUESTED"),
  duration: appointmentDuration("duration").notNull().default("60"),
  treatmentType: text("treatment_type"),
  roomOrChair: text("room_or_chair"),
  cancellationReason: text("cancellation_reason"),
  followUpDate: text("follow_up_date"),
  // Self-ref FK uses callback form to avoid circular reference at declaration time
  rescheduledFromId: uuid("rescheduled_from_id").references(
    (): AnyPgColumn => assignments.id,
    { onDelete: "set null" }
  ),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("assignments_submission_idx").on(t.submissionId),
  index("assignments_team_member_idx").on(t.teamMemberId),
  index("assignments_scheduled_at_idx").on(t.scheduledAt),
  index("assignments_appt_status_idx").on(t.apptStatus),
  index("assignments_scheduled_at_status_idx").on(t.scheduledAt, t.apptStatus),
]);

export const availabilityBlocks = pgTable("availability_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamMemberId: uuid("team_member_id").notNull().references(() => teamMembers.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  reason: text("reason"),
  createdBy: uuid("created_by").notNull().references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("avail_blocks_team_member_idx").on(t.teamMemberId),
  index("avail_blocks_starts_at_idx").on(t.startsAt),
]);

// ── Relations ─────────────────────────────────────────────────────────────────

export const submissionsRelations = relations(submissions, ({ many }) => ({
  notes: many(notes),
  auditLogs: many(auditLogs),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  submission: one(submissions, { fields: [notes.submissionId], references: [submissions.id] }),
  author: one(profiles, { fields: [notes.authorId], references: [profiles.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  submission: one(submissions, { fields: [auditLogs.submissionId], references: [submissions.id] }),
  actor: one(profiles, { fields: [auditLogs.actorId], references: [profiles.id] }),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  submission: one(submissions, { fields: [assignments.submissionId], references: [submissions.id] }),
  teamMember: one(teamMembers, { fields: [assignments.teamMemberId], references: [teamMembers.id] }),
  rescheduledFrom: one(assignments, {
    fields: [assignments.rescheduledFromId],
    references: [assignments.id],
    relationName: "reschedule_chain",
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ many }) => ({
  assignments: many(assignments),
  availabilityBlocks: many(availabilityBlocks),
}));

export const availabilityBlocksRelations = relations(availabilityBlocks, ({ one }) => ({
  teamMember: one(teamMembers, { fields: [availabilityBlocks.teamMemberId], references: [teamMembers.id] }),
  createdByProfile: one(profiles, { fields: [availabilityBlocks.createdBy], references: [profiles.id] }),
}));
