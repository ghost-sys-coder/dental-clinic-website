"use client";

import { useState, useTransition } from "react";
import { inviteUser } from "../actions";
import type { Role } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function InviteForm() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [role, setRole]         = useState<Role>("VIEWER");
  const [pending, startTransition] = useTransition();

  const passwordError = password.length > 0 && password.length < 8
    ? "Password must be at least 8 characters"
    : null;

  const canSubmit = email.trim() && password.length >= 8 && !pending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    startTransition(async () => {
      try {
        const result = await inviteUser(email.trim(), password, role);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(`Account created and credentials sent to ${email.trim()}`);
          setEmail("");
          setPassword("");
          setRole("VIEWER");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Email */}
      <div className="flex flex-col gap-1">
        <label htmlFor="invite-email" className="text-xs font-medium text-foreground">
          Email address
        </label>
        <input
          id="invite-email"
          type="email"
          required
          placeholder="colleague@clinic.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <label htmlFor="invite-password" className="text-xs font-medium text-foreground">
          Temporary password
        </label>
        <div className="relative">
          <input
            id="invite-password"
            type={showPw ? "text" : "password"}
            required
            minLength={8}
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-card px-3 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
        </div>
        {passwordError && (
          <p className="text-xs text-destructive">{passwordError}</p>
        )}
      </div>

      {/* Role */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-foreground">Role</label>
        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="EDITOR">Editor</SelectItem>
            <SelectItem value="VIEWER">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors w-fit"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}
        {pending ? "Creating…" : "Create Account"}
      </button>

      <p className="text-xs text-muted-foreground">
        An email with login credentials will be sent to the address above.
        Ask them to change their password after first login.
      </p>
    </form>
  );
}
