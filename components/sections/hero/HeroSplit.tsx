import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClinic } from '@/lib/useClinic';
import { cn } from '@/lib/utils';

export default function HeroSplit() {
  const clinic = getClinic();
  const { hero } = clinic;

  return (
    <section
      id="hero"
      className={cn(
        'relative min-h-[90vh] flex items-center overflow-hidden',
        'bg-gradient-to-br from-background to-muted/5'
      )}
    >
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left: Copy */}
          <div className="flex-1 flex flex-col items-start gap-6 lg:max-w-[55%]">
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
                'leading-relaxed max-w-xl'
              )}
            >
              {hero.subhead}
            </p>

            {/* Badges */}
            <div
              className={cn(
                'animate-fade-up animation-delay-200',
                'flex flex-wrap gap-2'
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

            {/* CTAs */}
            <div
              className={cn(
                'animate-fade-up animation-delay-300',
                'flex flex-col sm:flex-row gap-3 w-full sm:w-auto'
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
          </div>

          {/* Right: Image */}
          <div className="flex-1 w-full lg:max-w-[45%]">
            <div
              className={cn(
                'animate-slide-in-right',
                'relative w-full aspect-[4/5]',
                'rounded-2xl overflow-hidden',
                'bg-primary/10',
                'shadow-2xl shadow-primary/10'
              )}
            >
              <Image
                src={hero.image}
                alt={`${clinic.meta.name} — ${hero.headline}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              {/* Bottom gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* Subtle page-edge gradient */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
