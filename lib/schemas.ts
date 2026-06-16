import { z } from "zod";

export const intakeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^\+?[\d\s\-().]{7,}$/, "Enter a valid phone number"),
  service: z.string().min(1, "Please select an appointment type"),
  preferredDate: z.string().optional(),
  notes: z.string().optional(),
  type: z.enum(["booking", "contact"]).default("booking"),
  source: z.string().optional(),
  // Honeypot — must be empty
  _hp: z.string().max(0, "Bot detected").optional(),
});

export type IntakeInput = z.infer<typeof intakeSchema>;
