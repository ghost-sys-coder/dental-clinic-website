import "dotenv/config";
import { db } from "./index";
import { submissions } from "./schema";

const SEED_DATA = [
  {
    type: "APPOINTMENT" as const,
    status: "NEW" as const,
    fullName: "Sarah Mitchell",
    email: "sarah.mitchell@example.com",
    phone: "+1-512-555-0171",
    service: "teeth-whitening",
    preferredDate: "2026-06-20",
    message: "I have a wedding coming up and would love to brighten my smile beforehand.",
    source: "booking_form",
  },
  {
    type: "APPOINTMENT" as const,
    status: "CONTACTED" as const,
    fullName: "James Okafor",
    email: "j.okafor@example.com",
    phone: "+1-512-555-0183",
    service: "dental-implants",
    preferredDate: "2026-06-25",
    message: "Missing a molar on the lower right side. Looking for a permanent solution.",
    source: "booking_form",
  },
  {
    type: "APPOINTMENT" as const,
    status: "BOOKED" as const,
    fullName: "Elena Vasquez",
    email: "elena.v@example.com",
    phone: "+1-512-555-0192",
    service: "invisalign",
    preferredDate: "2026-06-18",
    message: "Interested in Invisalign for mild crowding. Had braces as a teen.",
    source: "homepage_form",
  },
  {
    type: "CONTACT" as const,
    status: "NEW" as const,
    fullName: "Robert Chen",
    email: "r.chen@example.com",
    phone: "+1-512-555-0204",
    service: null,
    preferredDate: null,
    message: "Do you accept Blue Cross insurance? My family is looking for a new dentist.",
    source: "contact_form",
  },
  {
    type: "APPOINTMENT" as const,
    status: "ARCHIVED" as const,
    fullName: "Priya Sharma",
    email: "priya.s@example.com",
    phone: "+1-512-555-0215",
    service: "emergency-dental-care",
    preferredDate: "2026-05-10",
    message: "Severe toothache started yesterday. Need to be seen ASAP.",
    source: "booking_form",
  },
];

async function seed() {
  console.log("Seeding submissions…");
  await db.insert(submissions).values(SEED_DATA).onConflictDoNothing();
  console.log(`✓ Inserted ${SEED_DATA.length} submissions`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
