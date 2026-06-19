"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPatient, updatePatient } from "@/app/admin/actions";
import { toast } from "sonner";
import { Loader2, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
type PatientStatus = "NEW" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

interface Doctor {
  id: string;
  name: string;
  title: string;
}

export interface PatientInitialData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  emergencyContact: string | null;
  medicalAlerts: string[];
  allergies: string[];
  insuranceProvider: string | null;
  preferredDoctorId: string | null;
  status: string;
}

interface Props {
  doctors: Doctor[];
  initialData?: PatientInitialData;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = (err?: string) =>
  cn(
    "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow",
    err && "border-destructive focus-visible:ring-destructive/30"
  );

const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow appearance-none";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-sm font-medium text-foreground">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive">{msg}</p>;
}

// ── Tag chip input (for Medical Alerts and Allergies) ─────────────────────────

function TagInput({
  label,
  placeholder,
  tags,
  onChange,
  chipCls,
}: {
  label: string;
  placeholder: string;
  tags: string[];
  onChange: (next: string[]) => void;
  chipCls: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const val = input.trim();
    if (!val || tags.includes(val)) return;
    onChange([...tags, val]);
    setInput("");
  }

  function remove(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex h-9 flex-1 rounded-lg border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
        />
        <button
          type="button"
          onClick={add}
          className="h-9 w-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          <Plus className="size-4" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full",
                chipCls
              )}
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────────

export default function PatientForm({ doctors, initialData }: Props) {
  const isEdit = !!initialData;
  const router = useRouter();

  const [fields, setFields] = useState({
    fullName:          initialData?.fullName          ?? "",
    email:             initialData?.email             ?? "",
    phone:             initialData?.phone             ?? "",
    dateOfBirth:       initialData?.dateOfBirth       ?? "",
    gender:            initialData?.gender            ?? "",
    address:           initialData?.address           ?? "",
    emergencyContact:  initialData?.emergencyContact  ?? "",
    insuranceProvider: initialData?.insuranceProvider ?? "",
    preferredDoctorId: initialData?.preferredDoctorId ?? "",
    status:            initialData?.status            ?? "NEW",
  });

  const [medicalAlerts, setMedicalAlerts] = useState<string[]>(
    initialData?.medicalAlerts ?? []
  );
  const [allergies, setAllergies] = useState<string[]>(
    initialData?.allergies ?? []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function set(key: keyof typeof fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!fields.fullName.trim()) errs.fullName = "Full name is required";
    if (!fields.email.trim())    errs.email    = "Email is required";
    if (!fields.phone.trim())    errs.phone    = "Phone is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      fullName:          fields.fullName.trim(),
      email:             fields.email.trim(),
      phone:             fields.phone.trim(),
      dateOfBirth:       fields.dateOfBirth       || null,
      gender:            (fields.gender           || null) as Gender | null,
      address:           fields.address.trim()    || null,
      emergencyContact:  fields.emergencyContact.trim() || null,
      insuranceProvider: fields.insuranceProvider.trim() || null,
      preferredDoctorId: fields.preferredDoctorId || null,
      status:            fields.status            as PatientStatus,
      medicalAlerts,
      allergies,
    };

    startTransition(async () => {
      try {
        if (isEdit) {
          await updatePatient(initialData.id, payload);
          toast.success("Patient updated");
          router.refresh();
        } else {
          const { id } = await createPatient(payload);
          toast.success("Patient created");
          router.push(`/admin/patients/${id}`);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">

      {/* ── Personal information ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label required>Full Name</Label>
            <input
              type="text"
              placeholder="Jane Doe"
              value={fields.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              className={inputCls(errors.fullName)}
            />
            <FieldError msg={errors.fullName} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label required>Email</Label>
            <input
              type="email"
              placeholder="patient@example.com"
              value={fields.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputCls(errors.email)}
            />
            <FieldError msg={errors.email} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label required>Phone</Label>
            <input
              type="tel"
              placeholder="+1 555 000 0000"
              value={fields.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputCls(errors.phone)}
            />
            <FieldError msg={errors.phone} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Date of Birth</Label>
            <input
              type="date"
              value={fields.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
              className={inputCls()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Gender</Label>
            <select
              value={fields.gender}
              onChange={(e) => set("gender", e.target.value)}
              className={selectCls}
            >
              <option value="">— Select —</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Contact & emergency ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Contact & Emergency
        </h2>

        <div className="flex flex-col gap-1.5">
          <Label>Address</Label>
          <textarea
            rows={2}
            placeholder="123 Main St, City, State 00000"
            value={fields.address}
            onChange={(e) => set("address", e.target.value)}
            className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Emergency Contact</Label>
          <input
            type="text"
            placeholder="Jane Doe (sister) — 555-1234"
            value={fields.emergencyContact}
            onChange={(e) => set("emergencyContact", e.target.value)}
            className={inputCls()}
          />
          <p className="text-xs text-muted-foreground">Name, relationship, and phone number.</p>
        </div>
      </section>

      {/* ── Medical information ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Medical Information
        </h2>

        <TagInput
          label="Medical Alerts"
          placeholder="e.g. Diabetic, Heart condition…"
          tags={medicalAlerts}
          onChange={setMedicalAlerts}
          chipCls="bg-red-50 text-red-700 border border-red-200"
        />

        <TagInput
          label="Allergies"
          placeholder="e.g. Penicillin, Latex…"
          tags={allergies}
          onChange={setAllergies}
          chipCls="bg-orange-50 text-orange-700 border border-orange-200"
        />
      </section>

      {/* ── Administrative ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Administrative
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Insurance Provider</Label>
            <input
              type="text"
              placeholder="Blue Cross, Aetna…"
              value={fields.insuranceProvider}
              onChange={(e) => set("insuranceProvider", e.target.value)}
              className={inputCls()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Preferred Doctor</Label>
            <select
              value={fields.preferredDoctorId}
              onChange={(e) => set("preferredDoctorId", e.target.value)}
              className={selectCls}
            >
              <option value="">— No preference —</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <select
              value={fields.status}
              onChange={(e) => set("status", e.target.value)}
              className={selectCls}
            >
              <option value="NEW">New</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Patient"}
        </button>
        <button
          type="button"
          onClick={() => router.push(isEdit ? `/admin/patients/${initialData?.id}` : "/admin/patients")}
          disabled={pending}
          className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted/60 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
