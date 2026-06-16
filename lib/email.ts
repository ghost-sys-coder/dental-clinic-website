import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function notifyNewSubmission() {
  if (!process.env.SMTP_HOST || !process.env.NOTIFY_TO) return;
  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.NOTIFY_TO,
    subject: "New website submission",
    text: "You have a new submission. Log in to the admin to view it.",
    // NO patient name, contact, or reason for visit. PHI never goes in email.
  });
}

export async function sendStaffCredentials(
  email: string,
  password: string,
  role: string,
) {
  if (!process.env.SMTP_HOST) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const loginUrl = siteUrl ? `${siteUrl}/login` : "your clinic admin portal";

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your admin account is ready",
    text: [
      "Your account has been created for the clinic admin portal.",
      "",
      `Email:    ${email}`,
      `Password: ${password}`,
      `Role:     ${role}`,
      "",
      `Log in here: ${loginUrl}`,
      "",
      "Please change your password after your first login.",
    ].join("\n"),
  });
}

export async function notifyDoctorDailySchedule(
  doctorEmail: string,
  doctorName: string,
  slots: { scheduledAt: Date; patientName: string; service: string | null }[],
) {
  if (!process.env.SMTP_HOST) return;

  const timeFormat = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const slotLines = slots.map(
    (s, i) =>
      `  ${i + 1}. ${timeFormat.format(s.scheduledAt)}${s.service ? ` — ${s.service}` : ""}`
  );

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: doctorEmail,
    subject: `Your schedule for today — ${slots.length} appointment${slots.length === 1 ? "" : "s"}`,
    text: [
      `Good morning, ${doctorName}.`,
      "",
      `You have ${slots.length} appointment${slots.length === 1 ? "" : "s"} scheduled for today:`,
      "",
      ...slotLines,
      "",
      "Log in to the admin portal for full details on each patient.",
    ].join("\n"),
  });
}

export async function notifyDoctorReminder(
  doctorEmail: string,
  doctorName: string,
  scheduledAt: Date,
) {
  if (!process.env.SMTP_HOST) return;

  const formatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(scheduledAt);

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: doctorEmail,
    subject: "Reminder: appointment in 30 minutes",
    text: [
      `Hi ${doctorName},`,
      "",
      "This is a reminder that you have a patient appointment in approximately 30 minutes.",
      "",
      `Scheduled: ${formatted}`,
      "",
      "Please log in to the admin portal to review the full details.",
    ].join("\n"),
  });
}

export async function notifyDoctorAssignment(
  doctorEmail: string,
  doctorName: string,
  scheduledAt: Date,
) {
  if (!process.env.SMTP_HOST) return;

  const formatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(scheduledAt);

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: doctorEmail,
    subject: "New appointment assigned to you",
    text: [
      `Hi ${doctorName},`,
      "",
      "You have been assigned a new patient appointment.",
      "",
      `Scheduled: ${formatted}`,
      "",
      "Please log in to the admin portal to review the full details.",
      // Patient details are intentionally omitted — PHI stays in the portal.
    ].join("\n"),
  });
}
