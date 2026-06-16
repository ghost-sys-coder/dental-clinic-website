"use client";

import { useState, useTransition } from "react";
import { exportSubmissionsCsv } from "../actions";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";

export default function ExportButton() {
  const [pending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      try {
        const csv = await exportSubmissionsCsv();
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `submissions-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Export downloaded");
      } catch {
        toast.error("Export failed");
      }
    });
  }

  return (
    <button
      onClick={handleExport}
      disabled={pending}
      className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors w-fit"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {pending ? "Exporting…" : "Download CSV"}
    </button>
  );
}
