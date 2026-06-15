import type { Metadata } from "next";
import { getClinic } from "@/lib/useClinic";
import ContactForm from "@/components/forms/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Brightsmile Dental in Austin, TX. Call, email, or use our contact form — we'd love to hear from you.",
};

export default function ContactPage() {
  const clinic = getClinic();
  const { contact } = clinic;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Get In Touch
          </p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-lg">
            Questions, concerns, or ready to book? We&apos;re here to help.
            Reach out any way that works for you.
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="py-16 px-4 bg-background flex-1">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Contact Form */}
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <h2 className="font-heading font-semibold text-xl text-foreground mb-6">
              Send Us a Message
            </h2>
            <ContactForm />
          </div>

          {/* Right: Contact Info + Map */}
          <div className="flex flex-col gap-8">
            {/* Contact Details */}
            <div className="flex flex-col gap-5">
              <h2 className="font-heading font-semibold text-xl text-foreground">
                Contact Information
              </h2>

              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="size-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground mb-0.5">
                    Address
                  </div>
                  <address className="not-italic text-sm text-muted-foreground leading-relaxed">
                    {contact.address.street}
                    <br />
                    {contact.address.city}, {contact.address.state}{" "}
                    {contact.address.zip}
                  </address>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="size-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground mb-0.5">
                    Phone
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="size-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground mb-0.5">
                    Email
                  </div>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="size-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground mb-2">
                    Hours
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    {contact.hours.map((h) => (
                      <div key={h.day} className="contents">
                        <span className="text-muted-foreground">{h.day}</span>
                        {h.closed ? (
                          <span className="text-destructive font-medium">
                            Closed
                          </span>
                        ) : (
                          <span className="text-foreground">
                            {h.open} – {h.close}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-border shadow-sm">
              <iframe
                src={contact.mapEmbedUrl}
                className="w-full aspect-video"
                title="Brightsmile Dental on Google Maps"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
