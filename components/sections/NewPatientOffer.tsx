import { Check } from "lucide-react";
import { getClinic } from "@/lib/useClinic";
import LeadCaptureForm from "@/components/forms/LeadCaptureForm";

const TRUST_BULLETS = [
  "No hidden fees",
  "Most insurance accepted",
  "Same-day availability",
  "Friendly, judgment-free care",
];

export default function NewPatientOffer() {
  const clinic = getClinic();

  if (!clinic.features.showOffer) {
    return null;
  }

  const { offer } = clinic;

  return (
    <section id="offer" className="py-20 px-4 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column — copy */}
          <div className="animate-fade-up">
            <p className="text-sm uppercase tracking-widest text-primary-foreground/70 font-medium mb-4">
              Special Offer
            </p>

            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground leading-tight">
              {offer.title}
            </h2>

            <p className="mt-4 text-primary-foreground/85 leading-relaxed text-base md:text-lg">
              {offer.description}
            </p>

            {/* Trust bullets */}
            <ul className="mt-8 flex flex-col gap-3">
              {TRUST_BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-center gap-3">
                  <span className="flex-shrink-0 size-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Check className="size-3 text-primary-foreground" strokeWidth={3} />
                  </span>
                  <span className="text-primary-foreground/90 text-sm font-medium">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>

            {/* Terms */}
            <p className="mt-6 text-xs text-primary-foreground/60 leading-relaxed">
              {offer.terms}
            </p>
          </div>

          {/* Right column — form card */}
          <div className="animate-slide-in-right">
            <div className="bg-background text-foreground rounded-2xl p-8 shadow-xl">
              <h3 className="font-heading font-bold text-xl mb-6">
                Claim Your Offer
              </h3>
              <LeadCaptureForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
