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
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("VIEWER");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    startTransition(async () => {
      try {
        await inviteUser(email.trim(), role);
        toast.success(`Invite sent to ${email.trim()}`);
        setEmail("");
        setRole("VIEWER");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send invite");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="colleague@clinic.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex h-9 flex-1 rounded-lg border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
        />
        <Select value={role} onValueChange={(v) => setRole(v as Role)}>
          <SelectTrigger className="h-9 w-32 text-sm">
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
        disabled={pending || !email.trim()}
        className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors w-fit"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}
        {pending ? "Sending…" : "Send Invite"}
      </button>
      <p className="text-xs text-muted-foreground">
        The invitee receives an email with a sign-in link. Their role is set immediately on first login.
      </p>
    </form>
  );
}
