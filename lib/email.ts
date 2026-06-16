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
