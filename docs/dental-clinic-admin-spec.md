# Dental Clinic — Backend Admin & Management Build Spec

**Stack:** Next.js (App Router) + Supabase Auth + Drizzle ORM + Postgres (Supabase) + nodemailer (dev) on Vercel
**Scope:** Single-tenant per deployment. Staff-only admin to manage submissions from the custom intake form. US-based clinic → HIPAA in scope.

---

## 1. Security model (decide once, enforce everywhere)

| Concern | Decision |

|---|---|
| Authentication | Supabase Auth (staff only — no public signup). |
| Data access | Drizzle, connecting as a privileged role via the pooler. **Drizzle bypasses RLS.** |
| Authorization | App layer only. Every server action / route handler verifies the Supabase user *before* any Drizzle query. RLS is NOT the guard. |
| Audit trail | Required for HIPAA. Log who viewed/changed each submission (see `audit_logs`). |
| PHI in email | Never. Notifications say "new submission — log in to view." No patient data in email bodies. |
| Public intake endpoint | Unauthenticated but validated (Zod), rate-limited, and honeypot-protected. HTTPS only (Vercel default). |
| Roles | `ADMIN` / `STAFF` via a `profiles` table keyed to the Supabase auth user id. |

**Rule:** there is no Drizzle query anywhere in the codebase that isn't preceded by an auth check (except the public intake insert, which is write-only and validated).

---

## 2. Environment & connection config

```bash
# .env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...   # browser-safe (anon equivalent)
SUPABASE_SECRET_KEY=...                     # server-only, NEVER NEXT_PUBLIC — for admin auth ops if needed

# Drizzle + Supabase pooling — BOTH are required
DATABASE_URL="postgresql://...@...pooler.supabase.com:6543/postgres"   # transaction pooler, runtime
DIRECT_URL="postgresql://...@...supabase.com:5432/postgres"            # direct, migrations only

# Email (dev stopgap)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...            # Gmail App Password (not account password)
NOTIFY_TO=...            # clinic inbox that receives "new submission" alerts
```

- `DATABASE_URL` = transaction pooler (6543). Used by the app at runtime. Prevents connection exhaustion on serverless.
- **Critical:** the runtime postgres-js client MUST set `{ prepare: false }`. pgBouncer in transaction mode does not support prepared statements; omitting this causes intermittent, hard-to-trace query errors.

---

## 3. Drizzle schema

`profiles.id` holds the Supabase `auth.users` UUID (no default — set it to the auth user id). Drizzle does not manage the `auth` schema; there is no cross-schema FK.

```ts
// db/schema.ts
import { pgTable, pgEnum, text, uuid, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const submissionType = pgEnum("submission_type", ["APPOINTMENT", "CONTACT"]);
export const submissionStatus = pgEnum("submission_status", ["NEW", "CONTACTED", "BOOKED", "ARCHIVED"]);
export const roleEnum = pgEnum("role", ["ADMIN", "STAFF"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),                 // = Supabase auth user id
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
  service: text("service"),                    // requested service slug/name
  preferredDate: text("preferred_date"),       // free text; intake is a request, not a booking
  preferredTime: text("preferred_time"),
  message: text("message"),
  source: text("source"),                      // e.g. "homepage_form", "offer_form"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
  statusIdx: index("submissions_status_idx").on(t.status),
  createdAtIdx: index("submissions_created_at_idx").on(t.createdAt),
}));

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => profiles.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  submissionIdx: index("notes_submission_idx").on(t.submissionId),
}));

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => submissions.id, { onDelete: "set null" }),
  actorId: uuid("actor_id").notNull().references(() => profiles.id),
  action: text("action").notNull(),            // VIEW | STATUS_CHANGE | NOTE_ADD | EXPORT
  detail: text("detail"),                      // e.g. "NEW -> CONTACTED"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  submissionIdx: index("audit_submission_idx").on(t.submissionId),
  actorIdx: index("audit_actor_idx").on(t.actorId),
}));

// Relations (enables db.query.submissions.findFirst({ with: { notes: true, auditLogs: true } }))
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
```

```ts
// db/index.ts — runtime client
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// prepare:false is REQUIRED for the Supabase transaction pooler (port 6543).
const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client, { schema });
```

```ts
// drizzle.config.ts — migrations use the DIRECT connection
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DIRECT_URL! },
});
```

A `profiles` row should be created on first login (upsert in an auth callback or on first authenticated admin request), since Supabase Auth owns the actual user record.

---

## 4. Auth flow

- `utils/supabase/middleware.ts` → `updateSession()` (async, calls `getUser()`, gates `/admin/*`, redirects to `/login`). [Corrected version provided in chat.]
- Root `middleware.ts` calls `updateSession`; matcher excludes static assets.
- `/login` → email+password (or magic link) via Supabase Auth. No public signup; seed staff users from the Supabase dashboard.
- Server-side guard helper used by every admin server action:

```ts
// lib/auth.ts
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function requireUser() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user; // use user.id for profile / audit logging
}
```

Call `requireUser()` at the top of **every** admin server action and admin route handler.

---

## 5. API surface

### Public intake (unauthenticated, write-only)

`POST /api/intake` (or a server action bound to the public form)

- Validate with the **same Zod schema** the frontend form uses (single source of truth — keep it in `lib/schemas.ts` and import in both places so they can't drift).
- Honeypot field + basic rate limit (e.g. Upstash or in-memory per-IP for the demo).
- Insert a `submissions` row (status `NEW`).
- Fire notification email ("new submission — log in to view", no PHI).
- Return success; never leak DB errors to the client.

### Admin (all auth-guarded server actions)

- `listSubmissions({ status?, query?, page })` — filter + search + paginate.
- `getSubmission(id)` — detail; writes an `audit_logs` VIEW entry.
- `updateSubmissionStatus(id, status)` — writes STATUS_CHANGE audit entry.
- `addNote(submissionId, body)` — writes NOTE_ADD audit entry.
- `exportSubmissionsCsv(filters)` — writes EXPORT audit entry.
- `getDashboardStats()` — counts by status, recent activity.

---

## 6. Admin pages (App Router, route group `(admin)` under `/admin`)

| Route | Contents |

|---|---|
| `/login` | Supabase auth form. |
| `/admin` | Dashboard: counts by status, today's new submissions, recent activity. |
| `/admin/submissions` | Table: name, type, service, status badge, date. Filter by status, search, pagination. |
| `/admin/submissions/[id]` | Detail: contact info, message, status control, internal notes thread, audit trail. |
| `/admin/settings` | Notification recipient, staff list (read-only or invite), export. |

Reuse the shadcn components already in the project (Table, Badge, Dialog, Form, Tabs) so the admin matches the site's design system.

---

## 7. Email notifications (nodemailer, dev stopgap)

```ts
// lib/email.ts
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function notifyNewSubmission() {
  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.NOTIFY_TO,
    subject: "New website submission",
    text: "You have a new submission. Log in to the admin to view it.",
    // NO patient name, contact, or reason for visit. PHI never goes in email.
  });
}
```

Before handoff: swap transport to the real provider, keep the no-PHI body.

---

## 8. Claude Code build sequence (run in order)

**Prompt 1 — Drizzle + DB foundation**:

> Install drizzle-orm, postgres, and drizzle-kit. Create `db/schema.ts` [paste schema above], `db/index.ts` (postgres-js client with `prepare: false`, pointed at `DATABASE_URL`), and `drizzle.config.ts` (pointed at `DIRECT_URL`). Generate and run the initial migration with drizzle-kit. For the demo you may use `drizzle-kit push`; for production use `generate` + `migrate`.

**Prompt 2 — Auth wiring**:

> Fix `utils/supabase/middleware.ts` to export an async `updateSession` that calls `getUser()`, redirects unauthenticated `/admin/*` requests to `/login`, and returns the response. Wire root `middleware.ts` with a matcher excluding static assets. Build `/login` with Supabase email/password auth and a sign-out action. Add `lib/auth.ts` with `requireUser()`. On first authenticated request, upsert a `profiles` row from the Supabase user.

**Prompt 3 — Shared validation + public intake**:

> Create `lib/schemas.ts` with a Zod schema for the intake form, and refactor the existing public custom form to import it. Build `POST /api/intake` (or a server action) that validates with that schema, has a honeypot + simple rate limit, inserts a `submissions` row (status NEW), and calls `notifyNewSubmission()`. Build `lib/email.ts` with nodemailer — notification body contains NO patient data, only "log in to view."

**Prompt 4 — Admin server actions**:

> Build auth-guarded server actions (each calls `requireUser()` first): `listSubmissions`, `getSubmission` (logs VIEW), `updateSubmissionStatus` (logs STATUS_CHANGE), `addNote` (logs NOTE_ADD), `exportSubmissionsCsv` (logs EXPORT), `getDashboardStats`. Every mutation writes an `audit_logs` row.

**Prompt 5 — Admin UI**:

> Build the `(admin)` route group: dashboard with status counts and recent activity, submissions table with status filter + search + pagination, and a submission detail page with status control, internal notes thread, and audit trail. Use the existing shadcn components for visual consistency.

**Prompt 6 — Settings + export + polish**:

> Build `/admin/settings` (notification recipient, staff list, CSV export button). Add loading/empty/error states, optimistic status updates, and toast confirmations. Verify every admin query sits behind `requireUser()`.

**Prompt 7 — Seed + verify**:

> Add a seed script inserting a few fake submissions across statuses. Manually verify: unauthenticated access to `/admin` redirects; a public intake insert appears in the dashboard and triggers a (no-PHI) notification; status changes and notes write audit entries.

---

## 9. Pre-handoff compliance checklist (US / HIPAA)

Do before the real product goes live with real patient data:

- [ ] BAAs signed with Vercel, Supabase, and the transactional email provider.
- [ ] Email notifications contain zero PHI ("log in to view" only).
- [ ] Postgres encryption at rest (Supabase default) + TLS in transit confirmed.
- [ ] `audit_logs` capturing VIEW / STATUS_CHANGE / NOTE_ADD / EXPORT.
- [ ] Strong staff auth (enforce password policy or magic link; consider MFA).
- [ ] No PHI in logs, error messages, or analytics.
- [ ] Data retention/deletion policy agreed with the clinic.
- [ ] Public intake endpoint rate-limited and bot-protected.
- [ ] `SUPABASE_SECRET_KEY` and DB URLs are server-only env vars, never `NEXT_PUBLIC`.

Compliance items are flagged here as engineering requirements, not legal advice — the clinic should confirm its obligations with its own counsel.
