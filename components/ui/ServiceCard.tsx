import Link from 'next/link';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  name: string;
  icon: string;
  shortDescription: string;
  slug: string;
}

export default function ServiceCard({
  name,
  icon,
  shortDescription,
  slug,
}: ServiceCardProps) {
  const IconComponent = Icons[icon as keyof typeof Icons] as React.ComponentType<{
    className?: string;
  }> | undefined;

  return (
    <Link
      href={`/services/${slug}`}
      className={cn(
        'group block rounded-xl border border-border bg-card p-6',
        'hover:border-primary/40 hover:shadow-md transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      {/* Icon container */}
      <div
        className={cn(
          'bg-primary/10 rounded-xl p-3 w-12 h-12',
          'flex items-center justify-center',
          'group-hover:bg-primary group-hover:text-primary-foreground',
          'transition-all duration-200'
        )}
      >
        {IconComponent ? (
          <IconComponent className="size-5 text-primary group-hover:text-primary-foreground transition-colors duration-200" />
        ) : (
          <Icons.Star className="size-5 text-primary group-hover:text-primary-foreground transition-colors duration-200" />
        )}
      </div>

      {/* Service name */}
      <h3 className="font-semibold text-lg mt-4 mb-2 text-foreground">
        {name}
      </h3>

      {/* Short description */}
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
        {shortDescription}
      </p>

      {/* Learn More link */}
      <div className="flex items-center gap-1 mt-4 text-sm font-medium text-primary group-hover:gap-2 transition-all duration-200">
        Learn More
        <ArrowRight className="size-4" />
      </div>
    </Link>
  );
}
