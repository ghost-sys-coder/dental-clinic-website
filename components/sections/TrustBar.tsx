import { Star, CheckCircle, Shield, Award } from 'lucide-react';
import { getClinic } from '@/lib/useClinic';
import { cn } from '@/lib/utils';

export default function TrustBar() {
  const clinic = getClinic();
  const { meta } = clinic;

  return (
    <div id="trustBar" className="bg-muted/50 border-y border-border py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'grid grid-cols-2 md:flex md:flex-row md:items-center md:justify-center',
            'gap-4 md:gap-0'
          )}
        >
          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 md:px-6">
            <Star className="size-4 fill-yellow-400 text-yellow-400 shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              {meta.googleRating}
            </span>
            <span className="text-sm text-muted-foreground">
              ({meta.reviewCount} reviews)
            </span>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-border" />

          {/* Accepting New Patients */}
          {meta.acceptingNewPatients && (
            <>
              <div className="flex items-center justify-center gap-2 md:px-6">
                <CheckCircle className="size-4 shrink-0 text-accent-foreground" style={{ color: 'var(--color-accent, #22C55E)' }} />
                <span className="text-sm font-medium text-foreground">
                  Accepting New Patients
                </span>
              </div>
              {/* Divider */}
              <div className="hidden md:block w-px h-6 bg-border" />
            </>
          )}

          {/* Insurance */}
          <div className="flex items-center justify-center gap-2 md:px-6">
            <Shield className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Most Insurance Accepted
            </span>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-border" />

          {/* Experience */}
          <div className="flex items-center justify-center gap-2 md:px-6">
            <Award className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              20+ Years Experience
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
