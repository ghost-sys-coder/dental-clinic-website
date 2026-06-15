"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClinic } from "@/lib/useClinic";
import { CheckCircle, Loader2, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string;
  notes: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  service?: string;
}

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.firstName.trim()) errors.firstName = "First name is required.";
  if (!fields.lastName.trim()) errors.lastName = "Last name is required.";
  if (!fields.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!fields.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\+?[\d\s\-().]{7,}$/.test(fields.phone)) {
    errors.phone = "Enter a valid phone number.";
  }
  if (!fields.service) errors.service = "Please select an appointment type.";
  return errors;
}

export default function BookingForm() {
  const clinic = getClinic();

  const [fields, setFields] = useState<FormFields>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    preferredDate: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(key: keyof FormFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${fields.firstName} ${fields.lastName}`,
          email: fields.email,
          phone: fields.phone,
          service: fields.service,
          preferredDate: fields.preferredDate,
          notes: fields.notes,
          type: "booking",
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
      toast.success("Appointment request received! We'll confirm within 1 business day.");
    } catch {
      toast.error("Something went wrong. Please call us directly or try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-12 text-center animate-fade-in">
        <div className="size-16 rounded-full bg-accent/15 flex items-center justify-center">
          <CalendarCheck className="size-8 text-accent" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-xl text-foreground mb-2">
            Request Received!
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            We&apos;ll confirm your appointment within 1 business day. For
            same-day emergencies, call{" "}
            <a
              href={`tel:${clinic.contact.phone}`}
              className="text-primary font-medium hover:underline"
            >
              {clinic.contact.phone}
            </a>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
          <CheckCircle className="size-3.5 text-accent shrink-0" />
          Confirmation details sent to {fields.email}
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Name row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="book-first-name">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="book-first-name"
            type="text"
            placeholder="Jane"
            autoComplete="given-name"
            value={fields.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            aria-invalid={!!errors.firstName}
            className={cn("h-10", errors.firstName && "border-destructive")}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="book-last-name">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="book-last-name"
            type="text"
            placeholder="Smith"
            autoComplete="family-name"
            value={fields.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            aria-invalid={!!errors.lastName}
            className={cn("h-10", errors.lastName && "border-destructive")}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="book-email">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="book-email"
          type="email"
          placeholder="jane@example.com"
          autoComplete="email"
          value={fields.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors.email}
          className={cn("h-10", errors.email && "border-destructive")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="book-phone">
          Phone Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="book-phone"
          type="tel"
          placeholder="+1 (512) 555-0100"
          autoComplete="tel"
          value={fields.phone}
          onChange={(e) => set("phone", e.target.value)}
          aria-invalid={!!errors.phone}
          className={cn("h-10", errors.phone && "border-destructive")}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone}</p>
        )}
      </div>

      {/* Service */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="book-service">
          Appointment Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={fields.service}
          onValueChange={(val) => set("service", val)}
        >
          <SelectTrigger
            id="book-service"
            className={cn("h-10", errors.service && "border-destructive")}
          >
            <SelectValue placeholder="Select a service…" />
          </SelectTrigger>
          <SelectContent>
            {clinic.services.map((s) => (
              <SelectItem key={s.slug} value={s.slug}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.service && (
          <p className="text-xs text-destructive">{errors.service}</p>
        )}
      </div>

      {/* Preferred date */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="book-date">Preferred Date (optional)</Label>
        <Input
          id="book-date"
          type="date"
          min={today}
          value={fields.preferredDate}
          onChange={(e) => set("preferredDate", e.target.value)}
          className="h-10"
        />
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="book-notes">Additional Notes (optional)</Label>
        <textarea
          id="book-notes"
          placeholder="Any concerns, insurance info, or special requests…"
          value={fields.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>

      <Button type="submit" size="lg" className="h-11 font-semibold" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending Request…
          </>
        ) : (
          "Request Appointment"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        We&apos;ll confirm within 1 business day. For same-day emergencies,
        call{" "}
        <a href={`tel:${clinic.contact.phone}`} className="text-primary hover:underline">
          {clinic.contact.phone}
        </a>{" "}
        directly.
      </p>
    </form>
  );
}
