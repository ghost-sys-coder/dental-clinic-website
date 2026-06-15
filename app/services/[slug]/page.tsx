import type { Metadata } from "next";
import { getClinic } from "@/lib/useClinic";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import { buildServiceSchema } from "@/lib/jsonld";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import { ArrowLeft, CheckCircle, Phone, Calendar } from "lucide-react";
import React from "react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const clinic = getClinic();
  return clinic.services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const clinic = getClinic();
  const service = clinic.services.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: `${service.name} in ${clinic.meta.city}`,
    description: service.shortDescription,
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const clinic = getClinic();
  const service = clinic.services.find((s) => s.slug === slug);
  if (!service) notFound();

  const Icon = (Icons[service.icon as keyof typeof Icons] ??
    Icons.Stethoscope) as React.ComponentType<{ className?: string }>;

  const related = clinic.services.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd data={buildServiceSchema(clinic, service.name)} />
      {/* Breadcrumb */}
      <div className="py-4 px-4 border-b border-border bg-background">
        <div className="max-w-5xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/services"
              className="hover:text-primary transition-colors"
            >
              Services
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{service.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left: Content */}
            <div className="flex flex-col gap-5">
              <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10">
                <Icon className="size-7 text-primary" />
              </div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground leading-tight">
                {service.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {service.shortDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button asChild size="lg" className="h-11 px-6 font-semibold">
                  <Link href="/book">
                    <Calendar className="size-4 mr-2" />
                    Book Consultation
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 px-6">
                  <a href={`tel:${clinic.contact.phone}`}>
                    <Phone className="size-4 mr-2" />
                    Call Us
                  </a>
                </Button>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden border border-border shadow-lg">
              <Image
                src={service.image}
                alt={service.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Long Description */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-6">
            About This Service
          </h2>
          <p className="text-foreground leading-relaxed text-lg">
            {service.longDescription}
          </p>

          {/* Key benefits */}
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {[
              "Experienced, board-certified dentists",
              "State-of-the-art technology",
              "Transparent pricing with no surprises",
              "Comfortable, anxiety-free environment",
              "Most insurance plans accepted",
              "Flexible payment options available",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle className="size-5 text-green-500 shrink-0" />
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book CTA */}
      <section className="py-16 px-4 bg-primary/5 border-y border-primary/10">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground">
            Schedule a consultation with our team and take the first step toward
            a healthier, more confident smile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="h-11 px-8 font-semibold">
              <Link href="/book">
                <Calendar className="size-4 mr-2" />
                Book a Consultation
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-8">
              <Link href="/services">
                <ArrowLeft className="size-4 mr-2" />
                All Services
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-8">
            Other Services You May Like
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((rel) => {
              const RelIcon = (Icons[rel.icon as keyof typeof Icons] ??
                Icons.Stethoscope) as React.ComponentType<{
                className?: string;
              }>;
              return (
                <Link
                  key={rel.slug}
                  href={`/services/${rel.slug}`}
                  className="group flex flex-col rounded-xl border border-border bg-card p-5 gap-3 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <RelIcon className="size-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {rel.name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rel.shortDescription}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
