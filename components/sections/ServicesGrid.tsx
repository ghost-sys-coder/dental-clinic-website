import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/ui/ServiceCard';
import { getClinic } from '@/lib/useClinic';

export default function ServicesGrid() {
  const clinic = getClinic();
  const { services } = clinic;

  return (
    <section id="services" className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-widest text-sm font-semibold mb-3">
            Our Services
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Comprehensive Dental Care
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From routine cleanings to advanced cosmetic procedures, we offer
            everything your family needs under one roof.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
          {services.map((service) => (
            <ServiceCard
              key={service.slug}
              name={service.name}
              icon={service.icon}
              shortDescription={service.shortDescription}
              slug={service.slug}
            />
          ))}
        </div>

        {/* View all CTA */}
        <div className="mt-12 flex justify-center">
          <Button variant="outline" size="lg" asChild className="text-base px-8">
            <Link href="/services">View All Services</Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
