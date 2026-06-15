import Link from 'next/link';
import { CheckCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClinic } from '@/lib/useClinic';
import { cn } from '@/lib/utils';

export default function HeroCentered() {
  const clinic = getClinic();
  const { hero } = clinic;

  return (
    <section
      id="hero"
      className={cn(
        'relative min-h-[90vh] flex items-center overflow-hidden',
        'bg-gradient-to-b from-muted/30 to-background'
      )}
    >
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col items-center text-center gap-8">

        {/* Headline */}
        <h1
          className={cn(
            'animate-fade-up',
            'text-5xl md:text-6xl lg:text-7xl',
            'font-heading font-bold tracking-tight',
            'text-foreground leading-[1.08]'
          )}
        >
          {hero.headline}
        </h1>

        {/* Subhead */}
        <p
          className={cn(
            'animate-fade-up animation-delay-100',
            'text-lg md:text-xl text-muted-foreground',
            'leading-relaxed max-w-2xl'
          )}
        >
          {hero.subhead}
        </p>

        {/* CTAs */}
        <div
          className={cn(
            'animate-fade-up animation-delay-200',
            'flex flex-col sm:flex-row gap-3'
          )}
        >
          <Button size="lg" asChild className="text-base px-6 py-3 h-auto">
            <Link href={hero.primaryCta.href}>
              <Phone className="size-4" />
              {hero.primaryCta.label}
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="text-base px-6 py-3 h-auto"
          >
            <Link href={hero.secondaryCta.href}>
              {hero.secondaryCta.label}
            </Link>
          </Button>
        </div>

        {/* Badges */}
        <div
          className={cn(
            'animate-fade-up animation-delay-300',
            'flex flex-wrap justify-center gap-2'
          )}
        >
          {hero.badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium"
            >
              <CheckCircle className="size-3.5 shrink-0" />
              {badge}
            </span>
          ))}
        </div>

      </div>

      {/* Bottom edge gradient */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
