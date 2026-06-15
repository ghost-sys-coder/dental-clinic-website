import { getClinic } from "@/lib/useClinic";
import HeroSection from "@/components/sections/HeroSection";
import TrustBar from "@/components/sections/TrustBar";
import ServicesGrid from "@/components/sections/ServicesGrid";
import WhyUsSection from "@/components/sections/WhyUsSection";
import NewPatientOffer from "@/components/sections/NewPatientOffer";
import BeforeAfterGallery from "@/components/sections/BeforeAfterGallery";
import TeamSection from "@/components/sections/TeamSection";
import ReviewsCarousel from "@/components/sections/ReviewsCarousel";
import FaqSection from "@/components/sections/FaqSection";
import LocationSection from "@/components/sections/LocationSection";
import CtaBand from "@/components/sections/CtaBand";

type SectionKey =
  | "hero"
  | "trustBar"
  | "services"
  | "whyUs"
  | "offer"
  | "beforeAfter"
  | "team"
  | "reviews"
  | "faq"
  | "location"
  | "cta";

const sectionMap: Record<SectionKey, React.ComponentType> = {
  hero: HeroSection,
  trustBar: TrustBar,
  services: ServicesGrid,
  whyUs: WhyUsSection,
  offer: NewPatientOffer,
  beforeAfter: BeforeAfterGallery,
  team: TeamSection,
  reviews: ReviewsCarousel,
  faq: FaqSection,
  location: LocationSection,
  cta: CtaBand,
};

export default function SectionRenderer() {
  const clinic = getClinic();

  return (
    <>
      {clinic.sections.map((key) => {
        const C = sectionMap[key as SectionKey];
        return C ? <C key={key} /> : null;
      })}
    </>
  );
}
