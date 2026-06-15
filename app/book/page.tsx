import type { Metadata } from "next";
import { getClinic } from "@/lib/useClinic";
import BookingForm from "@/components/forms/BookingForm";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Schedule your appointment at Brightsmile Dental in Austin, TX. New patients welcome. Book online 24/7 or call us directly.",
};

export default function BookPage() {
  const clinic = getClinic();
  const { features, contact, meta } = clinic;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Header */}
      <section className="py-16 px-4 bg-linear-to-br from-primary/10 via-background to-background">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Schedule a Visit
          </p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4">
            Book an Appointment
          </h1>
          <p className="text-muted-foreground text-lg">
            {meta.acceptingNewPatients
              ? "We're currently accepting new patients. Choose a time that works for you."
              : "Contact us to check appointment availability."}
          </p>
        </div>
      </section>

      {/* Booking Widget */}
      <section className="py-16 px-4 bg-background flex-1">
        <div className="max-w-3xl mx-auto">
          {features.bookingMode === "calcom" ? (
            <div className="rounded-xl border border-border overflow-hidden shadow-sm">
              <iframe
                src={features.calcomUrl}
                style={{ width: "100%", height: "700px", border: "none" }}
                title="Book an appointment"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <h2 className="font-heading font-semibold text-xl text-foreground mb-6">
                Request an Appointment
              </h2>
              <BookingForm />
            </div>
          )}
        </div>
      </section>

      {/* Contact Info Below */}
      <section className="py-12 px-4 bg-muted/30 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-semibold text-lg text-foreground mb-6 text-center">
            Prefer to reach us directly?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="size-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Call Us</div>
                <div className="text-sm font-medium text-foreground">
                  {contact.phone}
                </div>
              </div>
            </a>

            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="size-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Email Us</div>
                <div className="text-sm font-medium text-foreground truncate">
                  {contact.email}
                </div>
              </div>
            </a>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="size-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Location</div>
                <div className="text-sm font-medium text-foreground">
                  {contact.address.city}, {contact.address.state}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="size-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Hours</div>
                <div className="text-sm font-medium text-foreground">
                  Mon–Fri 8AM–5PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
