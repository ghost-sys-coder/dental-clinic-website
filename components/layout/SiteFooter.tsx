import Link from "next/link";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { getClinic } from "@/lib/useClinic";

const clinic = getClinic();

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" aria-label={`${clinic.meta.name} — Home`}>
              <span className="font-heading text-xl font-bold text-primary">
                {clinic.meta.name}
              </span>
            </Link>
            <p className="mt-3 text-sm text-background/70 leading-relaxed max-w-xs">
              {clinic.meta.tagline}
            </p>
            {/* Social Links */}
            <div className="mt-5 flex items-center gap-3">
              {(
                [
                  { key: "facebook", label: "Facebook" },
                  { key: "instagram", label: "Instagram" },
                  { key: "twitter", label: "Twitter / X" },
                  { key: "google", label: "Google" },
                ] as const
              ).map(({ key, label }) => {
                const url = clinic.contact.socials[key];
                if (!url) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="size-8 flex items-center justify-center rounded-full bg-background/10 hover:bg-primary/30 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background/50 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Services", href: "/services" },
                { label: "About Us", href: "/about" },
                { label: "Book Appointment", href: "/book" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background/50 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${clinic.contact.phone}`}
                  className="flex items-start gap-2.5 text-sm text-background/70 hover:text-primary transition-colors"
                >
                  <Phone className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{clinic.contact.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${clinic.contact.email}`}
                  className="flex items-start gap-2.5 text-sm text-background/70 hover:text-primary transition-colors"
                >
                  <Mail className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{clinic.contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(clinic.contact.address.full)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-sm text-background/70 hover:text-primary transition-colors"
                >
                  <MapPin className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{clinic.contact.address.full}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background/50 mb-4">
              Office Hours
            </h3>
            <table className="text-sm w-full">
              <tbody className="divide-y divide-background/10">
                {clinic.contact.hours.map((entry) => (
                  <tr key={entry.day} className="flex justify-between py-1.5">
                    <td className="text-background/70 pr-4">{entry.day.slice(0, 3)}</td>
                    <td className="text-background font-medium text-right">
                      {entry.closed ? "Closed" : `${entry.open} – ${entry.close}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/40">
          <p>
            &copy; {currentYear} {clinic.meta.name}. All rights reserved.
          </p>
          <p>
            Established {clinic.meta.established} &middot; {clinic.meta.city},{" "}
            {clinic.meta.region}
          </p>
        </div>
      </div>
    </footer>
  );
}
