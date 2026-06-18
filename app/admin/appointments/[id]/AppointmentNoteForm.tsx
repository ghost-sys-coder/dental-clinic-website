"use client";

import { useState, useTransition } from "react";
import { addNote } from "../../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export default function AppointmentNoteForm({ submissionId }: { submissionId: string }) {
  const [body, setBody]             = useState("");
  const [pending, startTransition]  = useTransition();
  const router                      = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    startTransition(async () => {
      try {
        await addNote(submissionId, body);
        setBody("");
        toast.success("Note added.");
        router.refresh();
      } catch {
        toast.error("Failed to add note.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add an internal note…"
        rows={3}
        disabled={pending}
        className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow resize-none"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
          Add Note
        </button>
      </div>
    </form>
  );
}
