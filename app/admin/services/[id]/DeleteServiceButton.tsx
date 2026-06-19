"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteService } from "@/app/admin/actions";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

interface Props {
  id: string;
  name: string;
}

export default function DeleteServiceButton({ id, name }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteService(id);
        toast.success("Service deleted");
        router.push("/admin/services");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete service");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="flex items-center gap-2 h-9 px-4 rounded-lg border border-destructive/40 bg-card text-destructive text-sm font-medium hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 transition-colors"
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
      Delete Service
    </button>
  );
}
