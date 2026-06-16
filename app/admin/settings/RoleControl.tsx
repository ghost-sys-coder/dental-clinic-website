"use client";

import { useTransition } from "react";
import { updateUserRole, revokeUser } from "../actions";
import type { Role } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  profileId: string;
  currentRole: Role;
  isSelf: boolean;
}

export default function RoleControl({ profileId, currentRole, isSelf }: Props) {
  const [rolePending, startRoleTransition] = useTransition();
  const [revokePending, startRevokeTransition] = useTransition();

  function handleRoleChange(newRole: string) {
    startRoleTransition(async () => {
      try {
        await updateUserRole(profileId, newRole as Role);
        toast.success("Role updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update role");
      }
    });
  }

  function handleRevoke() {
    if (!confirm("Remove this user's access? This cannot be undone.")) return;
    startRevokeTransition(async () => {
      try {
        await revokeUser(profileId);
        toast.success("User access revoked");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to revoke user");
      }
    });
  }

  if (isSelf) {
    return (
      <span className="text-[10px] text-muted-foreground italic">you</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={currentRole} onValueChange={handleRoleChange} disabled={rolePending}>
        <SelectTrigger className="h-7 w-28 text-xs">
          {rolePending ? <Loader2 className="size-3 animate-spin" /> : <SelectValue />}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="EDITOR">Editor</SelectItem>
          <SelectItem value="VIEWER">Viewer</SelectItem>
        </SelectContent>
      </Select>
      <button
        type="button"
        onClick={handleRevoke}
        disabled={revokePending}
        className="size-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
        aria-label="Revoke access"
      >
        {revokePending ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3.5" />}
      </button>
    </div>
  );
}
