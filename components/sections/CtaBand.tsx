import { getClinic } from "@/lib/useClinic";
import { Button } from "@/components/ui/button";
import { Star, Phone, Calendar } from "lucide-react";
import Link from "next/link";

export default function CtaBand() {
  const clinic = getClinic();
  const { meta, contact } = clinic;

  return (
    <section id="cta" className="py-16 px-4 bg-primary text-primary-foreground">
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl">
            Ready for Your Best Smile?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Join thousands of happy Austin patients who trust Brightsmile Dental
            for exceptional, compassionate care. New patients welcome — book
            today.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-semibold px-8 h-12"
          >
            <Link href="/book">
              <Calendar className="size-4 mr-2" />
              Book Appointment
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white text-primary hover:bg-white/10 hover:text-white font-semibold px-8 h-12"
          >
            <a href={`tel:${contact.phone}`}>
              <Phone className="size-4 mr-2" />
              Call Now
            </a>
          </Button>
        </div>

        {/* Star Rating Row */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="size-5 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <p className="text-sm text-primary-foreground/70">
            {meta.googleRating} {"·"} {meta.reviewCount} reviews on Google
          </p>
        </div>
      </div>
    </section>
  );
}
