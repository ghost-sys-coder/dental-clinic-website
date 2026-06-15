import type { Metadata } from "next";
import { getClinic } from "@/lib/useClinic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TeamSection from "@/components/sections/TeamSection";
import { Award, Heart, Users, Star, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Brightsmile Dental — our story, our mission, and the compassionate team that has been serving Austin families since 2009.",
};

export default function AboutPage() {
  const clinic = getClinic();
  const { meta, contact } = clinic;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Our Story
          </p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-5">
            About Brightsmile Dental
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Since {meta.established}, we&apos;ve been committed to delivering
            exceptional dental care with a personal touch in the heart of{" "}
            {meta.city}, {meta.region}.
          </p>
        </div>
      </section>

      {/* Practice Story */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="flex flex-col gap-6">
              <h2 className="font-heading font-bold text-3xl text-foreground">
                Our Mission
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                At {meta.name}, our mission is simple: provide big-city dental
                expertise with small-town warmth. Founded in {meta.established}{" "}
                by Dr. Sarah Chen, our practice was built on the belief that
                every patient deserves honest, compassionate, and cutting-edge
                dental care — regardless of age, background, or dental history.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Over the years, we&apos;ve grown into a team of specialists
                serving thousands of Austin families, but we&apos;ve never lost
                sight of what matters most: making you feel heard, comfortable,
                and confident in your care.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We invest continuously in the latest dental technology — from
                digital X-rays and 3D cone-beam imaging to CEREC same-day crown
                milling — because we believe innovation and patient comfort go
                hand in hand.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="font-heading font-bold text-3xl text-foreground">
                Our Philosophy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We believe preventive dentistry is the foundation of lifelong
                oral health. We take the time to educate every patient about
                their oral health status, treatment options, and the &quot;why&quot;
                behind our recommendations — so you can make informed decisions
                with confidence.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                No upselling, no fear tactics — just straightforward,
                evidence-based dentistry delivered by a team that genuinely
                cares about your long-term wellbeing. When you walk through our
                door, you become part of our family.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                {[
                  { label: "Years in Austin", value: String(new Date().getFullYear() - meta.established) + "+" },
                  { label: "Google Reviews", value: String(meta.reviewCount) + "+" },
                  { label: "Google Rating", value: String(meta.googleRating) },
                  { label: "Services Offered", value: "12+" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-border bg-muted/30 p-4 text-center"
                  >
                    <div className="font-heading font-bold text-3xl text-primary">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

      {/* Awards & Certifications */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Recognition
            </p>
            <h2 className="font-heading font-bold text-3xl text-foreground">
              Awards &amp; Certifications
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Award,
                title: "Top Dentist Austin",
                subtitle: "Austin Monthly Magazine, 2022–2025",
              },
              {
                icon: Star,
                title: "4.9-Star Rating",
                subtitle: "312+ verified Google reviews",
              },
              {
                icon: Heart,
                title: "Patient Choice Award",
                subtitle: "American Dental Association, 2023",
              },
              {
                icon: Users,
                title: "Invisalign Diamond+",
                subtitle: "Top 1% of Invisalign providers nationwide",
              },
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex flex-col items-center text-center gap-3 rounded-xl border border-border bg-card p-6"
                >
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ItemIcon className="size-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
            Ready to experience the {meta.name} difference?
          </h2>
          <p className="text-muted-foreground">
            {meta.acceptingNewPatients
              ? "We're currently accepting new patients. Book your first visit today."
              : `Call us at ${contact.phone} to learn about availability.`}
          </p>
          <Button asChild size="lg" className="h-11 px-8 font-semibold">
            <Link href="/book">
              <Calendar className="size-4 mr-2" />
              Book an Appointment
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
