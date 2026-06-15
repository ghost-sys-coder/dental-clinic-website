import Link from "next/link";
import { Phone, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getClinic } from "@/lib/useClinic";

const clinic = getClinic();

export default function FloatingMobileBar() {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 flex gap-3 safe-area-pb"
      role="navigation"
      aria-label="Mobile quick actions"
    >
      <Button asChild variant="outline" className="flex-1 h-11 text-sm font-semibold">
        <a href={`tel:${clinic.contact.phone}`} aria-label={`Call ${clinic.meta.name}`}>
          <Phone className="size-4" aria-hidden="true" />
          Call Now
        </a>
      </Button>
      <Button asChild className="flex-1 h-11 text-sm font-semibold">
        <Link href="/book" aria-label={`Book an appointment at ${clinic.meta.name}`}>
          <CalendarCheck className="size-4" aria-hidden="true" />
          Book Appointment
        </Link>
      </Button>
    </div>
  );
}
