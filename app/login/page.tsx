"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "./actions";
import { getClinic } from "@/lib/useClinic";
import { Eye, EyeOff, Loader2, ShieldCheck, CalendarCheck, BarChart3, AlertCircle } from "lucide-react";

const clinic = getClinic();

const features = [
  { icon: CalendarCheck, label: "Manage appointment requests" },
  { icon: BarChart3, label: "Track submission pipeline" },
  { icon: ShieldCheck, label: "HIPAA-conscious audit trail" },
];

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [visible, setVisible] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => signIn(formData));
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary px-12 py-10 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 size-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-20 size-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 left-12 size-48 rounded-full bg-white/5" />

        {/* Top: wordmark */}
        <div className="relative z-10">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">
            Staff Portal
          </span>
          <h1 className="mt-3 font-heading font-bold text-3xl text-primary-foreground leading-tight">
            {clinic.meta.name}
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
            {clinic.meta.tagline}
          </p>
        </div>

        {/* Middle: feature list */}
        <div className="relative z-10 flex flex-col gap-4">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="size-4 text-primary-foreground" />
              </div>
              <span className="text-sm text-primary-foreground/80">{label}</span>
            </div>
          ))}
        </div>

        {/* Bottom: clinic meta */}
        <div className="relative z-10 text-xs text-primary-foreground/40 space-y-0.5">
          <p>{clinic.contact.address.city}, {clinic.contact.address.state}</p>
          <p>Est. {clinic.meta.established}</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm flex flex-col gap-7">

          {/* Header */}
          <div>
            {/* Mobile-only clinic name */}
            <p className="lg:hidden text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              {clinic.meta.name} · Staff Portal
            </p>
            <h2 className="font-heading font-bold text-2xl text-foreground">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your staff account to continue.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-3">
              <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{decodeURIComponent(error)}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@clinic.com"
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={visible ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 pr-10 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  aria-label={visible ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="mt-1 h-10 w-full rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            Staff accounts are provisioned by your administrator.
            <br />Contact them if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
