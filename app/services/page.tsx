import type { Metadata } from "next";
import { getClinic } from "@/lib/useClinic";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import * as Icons from "lucide-react";
import React from "react";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore the full range of dental services at Brightsmile Dental in Austin, TX — from routine cleanings to cosmetic dentistry, implants, and orthodontics.",
};

export default function ServicesPage() {
  const clinic = getClinic();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            What We Offer
          </p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-5">
            Our Dental Services
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From preventive care to full smile transformations, we offer
            comprehensive dental treatments for every stage of life — all under
            one roof in Austin, TX.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clinic.services.map((service) => {
              const Icon = (Icons[service.icon as keyof typeof Icons] ??
                Icons.Stethoscope) as React.ComponentType<{
                className?: string;
              }>;

              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                >
                  {/* Service Image */}
                  <div className="relative h-48 w-full bg-muted overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg p-2">
                      <Icon className="size-5 text-primary" />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <h2 className="font-heading font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {service.name}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {service.longDescription}
                    </p>
                    <div className="flex items-center text-sm font-medium text-primary mt-2">
                      Learn more
                      <ArrowRight className="size-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
            Have questions? Book a consultation.
          </h2>
          <p className="text-muted-foreground">
            Not sure which service is right for you? Our team is happy to walk
            you through your options and create a personalized treatment plan.
          </p>
          <Button asChild size="lg" className="h-11 px-8 font-semibold">
            <Link href="/book">
              <Calendar className="size-4 mr-2" />
              Book a Consultation
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
