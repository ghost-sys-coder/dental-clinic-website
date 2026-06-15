"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormValues {
  name: string;
  phone: string;
  email: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

const PHONE_REGEX = /^\+?[\d\s\-\(\)]{7,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Full name is required.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!values.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  return errors;
}

export default function LeadCaptureForm() {
  const [values, setValues] = useState<FormValues>({
    name: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }

      toast.success("We'll be in touch!");
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8 text-center animate-fade-in">
        <CheckCircle className="size-12 text-green-500" />
        <h3 className="font-heading font-bold text-xl">We'll be in touch!</h3>
        <p className="text-sm text-muted-foreground">
          Check your email for confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-name">Full Name</Label>
        <Input
          id="lead-name"
          name="name"
          type="text"
          placeholder="Jane Smith"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "lead-name-error" : undefined}
          className="h-10"
        />
        {errors.name && (
          <p id="lead-name-error" className="text-xs text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-phone">Phone Number</Label>
        <Input
          id="lead-phone"
          name="phone"
          type="tel"
          placeholder="+1 (512) 555-0100"
          autoComplete="tel"
          value={values.phone}
          onChange={handleChange}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "lead-phone-error" : undefined}
          className="h-10"
        />
        {errors.phone && (
          <p id="lead-phone-error" className="text-xs text-destructive">
            {errors.phone}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-email">Email Address</Label>
        <Input
          id="lead-email"
          name="email"
          type="email"
          placeholder="jane@example.com"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "lead-email-error" : undefined}
          className="h-10"
        />
        {errors.email && (
          <p id="lead-email-error" className="text-xs text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className={cn("w-full mt-1 h-11 text-base font-semibold")}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Claim Your Offer"
        )}
      </Button>
    </form>
  );
}
