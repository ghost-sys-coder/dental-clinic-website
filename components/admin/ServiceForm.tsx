"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { createService, updateService } from "@/app/admin/actions";
import {
  Loader2, Upload, ImageIcon,
  Smile, Sparkles, HeartPulse, Shield, Scissors, Stethoscope,
  Activity, Baby, Star, Zap, Leaf, Sun, CheckCircle, AlertCircle,
  Layers, Wrench, FlaskConical, Syringe, Microscope, BrainCircuit,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const BUCKET = "clinic-services";
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ICON_OPTIONS: { name: string; Icon: LucideIcon }[] = [
  { name: "Smile",        Icon: Smile },
  { name: "Sparkles",     Icon: Sparkles },
  { name: "HeartPulse",   Icon: HeartPulse },
  { name: "Shield",       Icon: Shield },
  { name: "Scissors",     Icon: Scissors },
  { name: "Stethoscope",  Icon: Stethoscope },
  { name: "Activity",     Icon: Activity },
  { name: "Baby",         Icon: Baby },
  { name: "Star",         Icon: Star },
  { name: "Zap",          Icon: Zap },
  { name: "Leaf",         Icon: Leaf },
  { name: "Sun",          Icon: Sun },
  { name: "CheckCircle",  Icon: CheckCircle },
  { name: "AlertCircle",  Icon: AlertCircle },
  { name: "Layers",       Icon: Layers },
  { name: "Wrench",       Icon: Wrench },
  { name: "FlaskConical", Icon: FlaskConical },
  { name: "Syringe",      Icon: Syringe },
  { name: "Microscope",   Icon: Microscope },
  { name: "BrainCircuit", Icon: BrainCircuit },
];

const inputCls = (err?: string) =>
  cn(
    "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow",
    err && "border-destructive focus-visible:ring-destructive/30"
  );

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Doctor {
  id: string;
  name: string;
  title: string;
  photo: string | null;
}

export interface ServiceInitialData {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  shortDescription: string;
  longDescription: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  doctorIds: string[];
}

interface Props {
  doctors: Doctor[];
  initialData?: ServiceInitialData;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ServiceForm({ doctors, initialData }: Props) {
  const isEdit = !!initialData;
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fields, setFields] = useState({
    name:             initialData?.name             ?? "",
    slug:             initialData?.slug             ?? "",
    icon:             initialData?.icon             ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    longDescription:  initialData?.longDescription  ?? "",
    displayOrder:     String(initialData?.displayOrder ?? 0),
    isActive:         initialData?.isActive         ?? true,
  });

  const [slugManual, setSlugManual] = useState(isEdit);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>(
    initialData?.doctorIds ?? []
  );
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image ?? null);
  const [imageClear, setImageClear]     = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [pending, startTransition]      = useTransition();

  function setField(key: keyof typeof fields, value: string | boolean) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) setErrors((prev) => { const n = { ...prev }; delete n[key as string]; return n; });
  }

  function handleNameChange(value: string) {
    setField("name", value);
    if (!slugManual) setField("slug", slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlugManual(true);
    setField("slug", value);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Image must be under 5 MB");
      e.target.value = "";
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageClear(false);
  }

  function handleImageClear() {
    setImageFile(null);
    setImagePreview(null);
    setImageClear(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  function toggleDoctor(id: string) {
    setSelectedDoctorIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!fields.name.trim())             errs.name             = "Service name is required";
    if (!fields.slug.trim())             errs.slug             = "Slug is required";
    if (!fields.shortDescription.trim()) errs.shortDescription = "Short description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function resolveImage(): Promise<string | null | undefined> {
    if (imageFile) {
      const supabase = createClient();
      const ext = imageFile.name.split(".").pop();
      const path = `${fields.slug}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(path, imageFile, { upsert: true });
      if (error) throw new Error(`Image upload failed: ${error.message}`);
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
      return publicUrl;
    }
    if (imageClear) return null;
    return undefined;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      try {
        const image = await resolveImage();

        const base = {
          slug:             fields.slug.trim(),
          name:             fields.name.trim(),
          icon:             fields.icon.trim() || null,
          shortDescription: fields.shortDescription.trim(),
          longDescription:  fields.longDescription.trim() || null,
          displayOrder:     parseInt(fields.displayOrder, 10) || 0,
          isActive:         fields.isActive,
          doctorIds:        selectedDoctorIds,
          ...(image !== undefined ? { image } : {}),
        };

        if (isEdit) {
          await updateService(initialData.id, base);
          toast.success("Service updated");
          router.refresh();
        } else {
          const { id } = await createService({ ...base, image: image ?? null });
          toast.success("Service created");
          router.push(`/admin/services/${id}`);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  const selectedIcon = ICON_OPTIONS.find((o) => o.name === fields.icon);
  const PreviewIcon = selectedIcon?.Icon ?? null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">

      {/* ── Service image ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Service Image
        </h2>
        <div className="flex items-start gap-4">
          <div className="relative w-32 h-24 rounded-xl overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Service preview"
                fill
                className="object-cover"
                unoptimized={imagePreview.startsWith("blob:")}
              />
            ) : (
              <ImageIcon className="size-8 text-muted-foreground/40" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted/60 transition-colors"
            >
              <Upload className="size-3.5" />
              {imagePreview ? "Change image" : "Upload image"}
            </button>
            {imagePreview && (
              <button
                type="button"
                onClick={handleImageClear}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors text-left"
              >
                Remove
              </button>
            )}
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP · Max 5 MB</p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageChange}
        />
      </section>

      {/* ── Basic info ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Basic Information
        </h2>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Service Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Teeth Whitening"
            value={fields.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={inputCls(errors.name)}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">URL Slug</label>
          <input
            type="text"
            placeholder="teeth-whitening"
            value={fields.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className={inputCls(errors.slug)}
          />
          {errors.slug
            ? <p className="text-xs text-destructive">{errors.slug}</p>
            : <p className="text-xs text-muted-foreground">
                Used in the URL: <span className="font-mono">/services/{fields.slug || "..."}</span>
                {isEdit && " — changing this will break existing links."}
              </p>
          }
        </div>

        {/* Short description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Short Description <span className="text-destructive">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="1–2 sentence summary shown on listing cards…"
            value={fields.shortDescription}
            onChange={(e) => setField("shortDescription", e.target.value)}
            className={cn(
              "flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow resize-none",
              errors.shortDescription && "border-destructive"
            )}
          />
          {errors.shortDescription && (
            <p className="text-xs text-destructive">{errors.shortDescription}</p>
          )}
        </div>

        {/* Long description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Full Description</label>
          <textarea
            rows={5}
            placeholder="Detailed description shown on the service detail page…"
            value={fields.longDescription}
            onChange={(e) => setField("longDescription", e.target.value)}
            className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow resize-none"
          />
        </div>
      </section>

      {/* ── Icon ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Icon
        </h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {PreviewIcon
                ? <PreviewIcon className="size-5 text-primary" />
                : <span className="text-xs text-muted-foreground/40">—</span>
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {fields.icon ? `Selected: ${fields.icon}` : "Click an icon below to select it"}
            </p>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {ICON_OPTIONS.map(({ name, Icon }) => (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => setField("icon", fields.icon === name ? "" : name)}
                className={cn(
                  "size-9 rounded-lg flex items-center justify-center transition-colors border",
                  fields.icon === name
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Linked Doctors ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Linked Doctors
        </h2>
        {doctors.length === 0 ? (
          <p className="text-xs text-muted-foreground">No team members added yet.</p>
        ) : (
          <div className="flex flex-col gap-1 max-h-56 overflow-y-auto rounded-lg border border-border bg-muted/20 p-1">
            {doctors.map((d) => {
              const checked = selectedDoctorIds.includes(d.id);
              return (
                <label
                  key={d.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors select-none",
                    checked ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/60 border border-transparent"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDoctor(d.id)}
                    className="size-4 rounded accent-primary shrink-0"
                  />
                  {d.photo ? (
                    <Image
                      src={d.photo}
                      alt={d.name}
                      width={28}
                      height={28}
                      className="rounded-full object-cover shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                      {d.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{d.title}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
        {selectedDoctorIds.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selectedDoctorIds.length} doctor{selectedDoctorIds.length > 1 ? "s" : ""} linked to this service.
          </p>
        )}
      </section>

      {/* ── Settings ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Settings
        </h2>

        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Display Order</label>
            <input
              type="number"
              min="0"
              value={fields.displayOrder}
              onChange={(e) => setField("displayOrder", e.target.value)}
              className="flex h-10 w-24 rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
            />
            <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Visibility</label>
            <label className="flex items-center gap-2.5 cursor-pointer h-10">
              <div
                role="checkbox"
                aria-checked={fields.isActive}
                onClick={() => setField("isActive", !fields.isActive)}
                className={cn(
                  "relative w-10 h-6 rounded-full transition-colors cursor-pointer shrink-0",
                  fields.isActive ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
                    fields.isActive ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </div>
              <span className="text-sm text-foreground">
                {fields.isActive ? "Active — visible on public site" : "Inactive — hidden from public site"}
              </span>
            </label>
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
          {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Service"}
        </button>
        <button
          type="button"
          onClick={() => router.push(isEdit ? `/admin/services/${initialData?.id}` : "/admin/services")}
          disabled={pending}
          className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted/60 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
