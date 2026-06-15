import * as Icons from 'lucide-react';
import { getClinic } from '@/lib/useClinic';
import { cn } from '@/lib/utils';

export default function WhyUsSection() {
  const clinic = getClinic();
  const { whyUs } = clinic;

  return (
    <section id="whyUs" className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-widest text-sm font-semibold mb-3">
            Why Choose Us
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            {whyUs.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {whyUs.subtitle}
          </p>
        </div>

        {/* Differentiators grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {whyUs.differentiators.map((item) => {
            const IconComponent = Icons[item.icon as keyof typeof Icons] as React.ComponentType<{
              className?: string;
            }> | undefined;

            return (
              <div
                key={item.title}
                className={cn(
                  'flex flex-col items-start',
                  'rounded-xl bg-background border border-border p-6',
                  'shadow-sm'
                )}
              >
                {/* Icon */}
                <div className="bg-primary/10 rounded-xl p-3 w-12 h-12 flex items-center justify-center">
                  {IconComponent ? (
                    <IconComponent className="size-5 text-primary" />
                  ) : (
                    <Icons.Star className="size-5 text-primary" />
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg mt-4 mb-2 text-foreground">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
