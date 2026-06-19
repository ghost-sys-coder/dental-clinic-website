"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  convertSubmissionToPatient,
  linkSubmissionToPatient,
  unlinkSubmissionFromPatient,
  searchPatients,
} from "@/app/admin/actions";
import { toast } from "sonner";
import { Loader2, UserRound, Search, ExternalLink, Unlink } from "lucide-react";

const STATUS_CLS: Record<string, string> = {
  NEW:      "bg-blue-50 text-blue-700 border-blue-200",
  ACTIVE:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-amber-50 text-amber-700 border-amber-200",
  ARCHIVED: "bg-gray-100 text-gray-500 border-gray-200",
};

function avatar(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

interface LinkedPatient {
  id: string;
  fullName: string;
  email: string;
  status: string;
}

interface SearchResult {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
}

interface Props {
  submissionId: string;
  linkedPatient: LinkedPatient | null;
  canWrite: boolean;
}

export default function PatientLinkPanel({ submissionId, linkedPatient, canWrite }: Props) {
  const router = useRouter();
  const [converting, startConvert] = useTransition();
  const [linking, startLink] = useTransition();
  const [unlinking, startUnlink] = useTransition();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchPatients(query);
        setResults(res);
        setOpen(res.length > 0);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleConvert() {
    startConvert(async () => {
      try {
        const { patientId } = await convertSubmissionToPatient(submissionId);
        toast.success("Patient record created");
        router.push(`/admin/patients/${patientId}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create patient");
      }
    });
  }

  function handleLink(patientId: string) {
    startLink(async () => {
      try {
        await linkSubmissionToPatient(submissionId, patientId);
        toast.success("Patient linked");
        setQuery("");
        setOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to link patient");
      }
    });
  }

  function handleUnlink() {
    if (!window.confirm("Unlink this submission from the patient record?")) return;
    startUnlink(async () => {
      try {
        await unlinkSubmissionFromPatient(submissionId);
        toast.success("Patient unlinked");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to unlink patient");
      }
    });
  }

  if (linkedPatient) {
    const cls = STATUS_CLS[linkedPatient.status] ?? STATUS_CLS.NEW;
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
          <UserRound className="size-3.5 text-primary" />
          <h2 className="text-xs font-semibold text-foreground">Linked Patient</h2>
        </div>
        <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
              {avatar(linkedPatient.fullName)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-foreground">{linkedPatient.fullName}</p>
                <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
                  {linkedPatient.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{linkedPatient.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/admin/patients/${linkedPatient.id}`}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium text-primary hover:border-primary/40 transition-colors"
            >
              <ExternalLink className="size-3.5" />
              View patient
            </Link>
            {canWrite && (
              <button
                onClick={handleUnlink}
                disabled={unlinking}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors disabled:opacity-50"
              >
                {unlinking
                  ? <Loader2 className="size-3.5 animate-spin" />
                  : <Unlink className="size-3.5" />
                }
                Unlink
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
        <UserRound className="size-3.5 text-primary" />
        <h2 className="text-xs font-semibold text-foreground">Patient Record</h2>
      </div>
      <div className="px-4 py-3 flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">No patient record is linked to this submission.</p>

        {canWrite && (
          <>
            <button
              onClick={handleConvert}
              disabled={converting}
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors w-fit"
            >
              {converting
                ? <Loader2 className="size-3.5 animate-spin" />
                : <UserRound className="size-3.5" />
              }
              {converting ? "Creating patient…" : "Create patient from this submission"}
            </button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span>or link to existing</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground animate-spin" />
                )}
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, email or phone…"
                  className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {open && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      disabled={linking}
                      onClick={() => handleLink(p.id)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-muted/60 transition-colors disabled:opacity-50"
                    >
                      <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {avatar(p.fullName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{p.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${STATUS_CLS[p.status] ?? STATUS_CLS.NEW}`}>
                        {p.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
