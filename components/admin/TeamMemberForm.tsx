"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { createTeamMember, updateTeamMember } from "@/app/admin/actions";
import { Loader2, X, Upload, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BUCKET = "team-profile";

interface InitialData {
  id: string;
  name: string;
  title: string;
  credentials: string[];
  bio: string;
  photo: string | null;
  email: string | null;
  displayOrder: number;
}

interface Props {
  initialData?: InitialData;
}

interface Fields {
  name: string;
  title: string;
  bio: string;
  email: string;
  displayOrder: string;
}

export default function TeamMemberForm({ initialData }: Props) {
  const isEdit = !!initialData;
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fields, setFields] = useState<Fields>({
    name: initialData?.name ?? "",
    title: initialData?.title ?? "",
    bio: initialData?.bio ?? "",
    email: initialData?.email ?? "",
    displayOrder: String(initialData?.displayOrder ?? 0),
  });
  const [credentials, setCredentials] = useState<string[]>(initialData?.credentials ?? []);
  const [credInput, setCredInput] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  // photoPreview: blob URL for a newly chosen file, existing URL for retained photo, null if cleared
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo ?? null);
  const [photoClear, setPhotoClear] = useState(false);
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [pending, startTransition] = useTransition();

  function set(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoClear(false);
  }

  function handlePhotoClear() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoClear(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addCredential() {
    const val = credInput.trim();
    if (!val || credentials.includes(val)) return;
    setCredentials((prev) => [...prev, val]);
    setCredInput("");
  }

  function handleCredKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addCredential();
    }
  }

  function removeCredential(cred: string) {
    setCredentials((prev) => prev.filter((c) => c !== cred));
  }

  function validate(): boolean {
    const errs: Partial<Fields> = {};
    if (!fields.name.trim()) errs.name = "Name is required";
    if (!fields.title.trim()) errs.title = "Title is required";
    if (!fields.bio.trim()) errs.bio = "Bio is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function resolvePhoto(): Promise<string | null | undefined> {
    if (photoFile) {
      const supabase = createClient();
      const ext = photoFile.name.split(".").pop();
      const path = `${fields.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from(BUCKET).upload(path, photoFile, { upsert: true });
      if (error) throw new Error(`Image upload failed: ${error.message}`);
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
      return publicUrl;
    }
    if (photoClear) return null;
    // No new file, not cleared — undefined signals "leave unchanged" to the action
    return undefined;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      try {
        const photo = await resolvePhoto();
        const payload = {
          name: fields.name.trim(),
          title: fields.title.trim(),
          credentials,
          bio: fields.bio.trim(),
          photo,
          email: fields.email.trim() || null,
          displayOrder: parseInt(fields.displayOrder, 10) || 0,
        };

        if (isEdit) {
          await updateTeamMember(initialData.id, payload);
          toast.success("Team member updated");
        } else {
          await createTeamMember({
            ...payload,
            photo: payload.photo ?? undefined,
            email: payload.email ?? undefined,
          });
          toast.success("Team member created");
        }

        router.push("/admin/team");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">

      {/* Photo upload */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Profile Photo</label>
        <div className="flex items-center gap-4">
          <div className="relative size-24 rounded-xl overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center">
            {photoPreview ? (
              <Image src={photoPreview} alt="Preview" fill className="object-cover" unoptimized={photoPreview.startsWith("blob:")} />
            ) : (
              <User className="size-10 text-muted-foreground/40" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted/60 transition-colors"
            >
              <Upload className="size-3.5" />
              {photoPreview ? "Change photo" : "Upload photo"}
            </button>
            {photoPreview && (
              <button
                type="button"
                onClick={handlePhotoClear}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors text-left"
              >
                Remove
              </button>
            )}
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Saved to Supabase.</p>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tm-name" className="text-sm font-medium text-foreground">
          Full Name <span className="text-destructive">*</span>
        </label>
        <input
          id="tm-name"
          type="text"
          placeholder="Dr. Jane Smith"
          value={fields.name}
          onChange={(e) => set("name", e.target.value)}
          className={cn("flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow", errors.name && "border-destructive")}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tm-title" className="text-sm font-medium text-foreground">
          Title / Role <span className="text-destructive">*</span>
        </label>
        <input
          id="tm-title"
          type="text"
          placeholder="Lead Dentist, DDS"
          value={fields.title}
          onChange={(e) => set("title", e.target.value)}
          className={cn("flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow", errors.title && "border-destructive")}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tm-email" className="text-sm font-medium text-foreground">
          Email Address
        </label>
        <input
          id="tm-email"
          type="email"
          placeholder="doctor@clinic.com"
          value={fields.email}
          onChange={(e) => set("email", e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
        />
        <p className="text-xs text-muted-foreground">Used to notify the doctor when an appointment is assigned to them.</p>
      </div>

      {/* Credentials */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tm-credentials" className="text-sm font-medium text-foreground">
          Credentials
        </label>
        <div className={cn("flex flex-wrap gap-1.5 min-h-10 w-full rounded-lg border border-input bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-ring transition-shadow", credentials.length > 0 && "pb-1.5")}>
          {credentials.map((cred) => (
            <span key={cred} className="flex items-center gap-1 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
              {cred}
              <button type="button" onClick={() => removeCredential(cred)} className="hover:text-destructive transition-colors">
                <X className="size-3" />
              </button>
            </span>
          ))}
          <input
            id="tm-credentials"
            type="text"
            placeholder={credentials.length === 0 ? "Type and press Enter to add…" : "Add more…"}
            value={credInput}
            onChange={(e) => setCredInput(e.target.value)}
            onKeyDown={handleCredKeyDown}
            onBlur={addCredential}
            className="flex-1 min-w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground">Press Enter or comma after each credential (e.g. DDS, FAGD)</p>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tm-bio" className="text-sm font-medium text-foreground">
          Bio <span className="text-destructive">*</span>
        </label>
        <textarea
          id="tm-bio"
          rows={5}
          placeholder="Write a short professional biography…"
          value={fields.bio}
          onChange={(e) => set("bio", e.target.value)}
          className={cn("flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow resize-none", errors.bio && "border-destructive")}
        />
        {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
      </div>

      {/* Display order */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tm-order" className="text-sm font-medium text-foreground">Display Order</label>
        <input
          id="tm-order"
          type="number"
          min="0"
          value={fields.displayOrder}
          onChange={(e) => set("displayOrder", e.target.value)}
          className="flex h-10 w-28 rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
        />
        <p className="text-xs text-muted-foreground">Lower numbers appear first on the site.</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Member"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/team")}
          disabled={pending}
          className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted/60 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
