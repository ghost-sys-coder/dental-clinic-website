"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getClinic } from "@/lib/useClinic";
import { NAV_LINKS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

const clinic = getClinic();

export default function StickyNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Wordmark */}
          <Link
            href="/"
            className="flex items-center shrink-0"
            aria-label={`${clinic.meta.name} — Home`}
          >
            <span className="font-heading text-xl font-bold text-primary tracking-tight">
              {clinic.meta.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`tel:${clinic.contact.phone}`}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Call us at ${clinic.contact.phone}`}
            >
              <Phone className="size-4" aria-hidden="true" />
              <span>{clinic.contact.phone}</span>
            </a>
            <Button asChild size="sm">
              <Link href="/book">Book Appointment</Link>
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-border",
          mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
        aria-hidden={!mobileOpen}
      >
        <nav
          className="flex flex-col px-4 pt-2 pb-4 gap-1"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-3 flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/book" onClick={() => setMobileOpen(false)}>
                Book Appointment
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={`tel:${clinic.contact.phone}`}>
                <Phone className="size-4" aria-hidden="true" />
                Call {clinic.contact.phone}
              </a>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
