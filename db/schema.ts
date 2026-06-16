import { pgTable, pgEnum, text, uuid, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const submissionType = pgEnum("submission_type", ["APPOINTMENT", "CONTACT"]);
export const submissionStatus = pgEnum("submission_status", ["NEW", "CONTACTED", "BOOKED", "ARCHIVED"]);
export const roleEnum = pgEnum("role", ["ADMIN", "STAFF"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  role: roleEnum("role").notNull().default("STAFF"),
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
