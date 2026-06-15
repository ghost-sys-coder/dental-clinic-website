import React from "react";
import { getClinic } from "@/lib/useClinic";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function LocationSection() {
  const clinic = getClinic();
  const { contact } = clinic;
  const directionsUrl = `https://maps.google.com/?q=${encodeURIComponent(contact.address.full)}`;

  return (
    <section id="location" className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Location
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground">
            Visit Our Office
          </h2>
        </div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left: Map */}
          <div className="rounded-xl overflow-hidden border border-border shadow-sm">
            <iframe
              src={contact.mapEmbedUrl}
              className="w-full aspect-video md:aspect-4/3"
              title="Brightsmile Dental location on Google Maps"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Right: NAP + Hours */}
          <div className="flex flex-col gap-8">
            {/* Heading */}
            <h3 className="font-heading font-bold text-2xl text-foreground">
              Find Us in Austin
            </h3>

            {/* Address / Phone / Email */}
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="size-5 text-primary mt-0.5 shrink-0" />
                <address className="not-italic text-foreground leading-snug">
                  {contact.address.street}
                  <br />
                  {contact.address.city}, {contact.address.state}{" "}
                  {contact.address.zip}
                </address>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="size-5 text-primary shrink-0" />
                <a
                  href={`tel:${contact.phone}`}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {contact.phone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="size-5 text-primary shrink-0" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {contact.email}
                </a>
              </div>
            </div>

            {/* Hours table */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="size-5 text-primary shrink-0" />
                <span className="font-semibold text-foreground">Office Hours</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                {contact.hours.map((h) => (
                  <React.Fragment key={h.day}>
                    <span className="text-muted-foreground">{h.day}</span>
                    {h.closed ? (
                      <span className="text-destructive font-medium">Closed</span>
                    ) : (
                      <span className="text-foreground">
                        {h.open} {"–"} {h.close}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Directions Button */}
            <div>
              <Button variant="outline" asChild>
                <Link href={directionsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4 mr-2" />
                  Get Directions
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
