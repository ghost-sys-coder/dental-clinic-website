export const clinic = {
  meta: {
    name: "Brightsmile Dental",
    tagline: "Exceptional Dental Care for the Whole Family",
    city: "Austin",
    region: "TX",
    established: 2009,
    googleRating: 4.9,
    reviewCount: 312,
    acceptingNewPatients: true,
  },

  brand: {
    logoSrc: "/logo.svg",
    themePreset: "modern",
    colors: {
      primary: "#0EA5E9",
      secondary: "#0F172A",
      accent: "#22C55E",
    },
    radius: "0.75rem",
  },

  contact: {
    phone: "+1-512-555-0142",
    email: "hello@brightsmile-dental.com",
    address: {
      street: "1204 Congress Ave",
      city: "Austin",
      state: "TX",
      zip: "78701",
      full: "1204 Congress Ave, Austin, TX 78701",
    },
    geo: {
      lat: 30.2672,
      lng: -97.7431,
    },
    mapEmbedUrl:
      "https://maps.google.com/maps?q=1204+Congress+Ave,+Austin,+TX+78701&t=&z=15&ie=UTF8&iwloc=&output=embed",
    hours: [
      { day: "Monday", open: "8:00 AM", close: "5:00 PM", closed: false },
      { day: "Tuesday", open: "8:00 AM", close: "5:00 PM", closed: false },
      { day: "Wednesday", open: "8:00 AM", close: "5:00 PM", closed: false },
      { day: "Thursday", open: "8:00 AM", close: "5:00 PM", closed: false },
      { day: "Friday", open: "8:00 AM", close: "3:00 PM", closed: false },
      { day: "Saturday", open: "9:00 AM", close: "2:00 PM", closed: false },
      { day: "Sunday", open: "", close: "", closed: true },
    ],
    socials: {
      facebook: "https://facebook.com/brightsmile-dental",
      instagram: "https://instagram.com/brightsmile-dental",
      twitter: "https://twitter.com/brightsmile-dental",
      google: "https://g.page/brightsmile-dental",
    },
  },

  hero: {
    variant: "split",
    headline: "Your Best Smile Starts Here",
    subhead:
      "Award-winning dental care in the heart of Austin. We combine advanced technology with a gentle touch so every visit feels comfortable, efficient, and worthwhile.",
    image: "/assets/hero-section-image.png",
    badges: [
      "20+ years experience",
      "5-star rated",
      "Accepting new patients",
    ],
    primaryCta: {
      label: "Book Your Appointment",
      href: "/book",
    },
    secondaryCta: {
      label: "See Our Services",
      href: "/services",
    },
  },

  services: [
    {
      slug: "oral-surgery",
      name: "Oral Surgery",
      icon: "Scissors",
      shortDescription:
        "Wisdom tooth extractions, bone grafts, and minor oral surgical procedures in one convenient location.",
      longDescription:
        "Our oral surgery services let you avoid specialist referrals for most routine surgical needs. We perform straightforward and surgical extractions, bone grafting in preparation for implants, and frenectomies under comfortable local anesthesia with sedation options available. Recovery guidance and follow-up care are always included.",
      image: "/assets/services/oral-surgery.png",
    },
    {
      slug: "teeth-whitening",
      name: "Teeth Whitening",
      icon: "Sparkles",
      shortDescription:
        "Professional-grade whitening that brightens your smile by up to 8 shades in one visit.",
      longDescription:
        "Our in-office Zoom! whitening system delivers dramatic, lasting results far beyond anything available over the counter. We also offer custom take-home trays for patients who prefer gradual whitening on their own schedule. Both options are safe, supervised, and tailored to minimize sensitivity.",
      image: "/assets/services/teeth-whitening.png",
    },
    {
      slug: "periodontics",
      name: "Periodontics",
      icon: "Leaf",
      shortDescription:
        "Expert gum disease treatment including deep cleanings, scaling, and gum therapy.",
      longDescription:
        "Gum disease is the leading cause of adult tooth loss, yet it's highly treatable when caught early. Our periodontal services range from professional deep cleanings (scaling and root planing) to advanced laser gum therapy that reduces pocket depth and promotes tissue regeneration. We monitor gum health at every visit.",
      image: "/assets/services/periodontics.png",
    },
    {
      slug: "invisalign",
      name: "Invisalign",
      icon: "Smile",
      shortDescription:
        "Straighten your teeth discreetly with clear, removable aligners custom-made for you.",
      longDescription:
        "Invisalign uses a series of virtually invisible plastic aligners to gradually shift teeth into their ideal positions—no metal brackets, no wires. Treatment typically takes 12–18 months, and you can remove the aligners to eat, brush, and floss normally. Our certified Invisalign providers will map your entire treatment digitally before you even begin.",
      image: "/assets/services/invisalign.png",
    },
    {
      slug: "dental-crowns",
      name: "Dental Crowns",
      icon: "Crown",
      shortDescription:
        "Same-day CEREC crowns that restore strength and beauty to damaged or weakened teeth.",
      longDescription:
        "Our in-house CEREC milling technology means we can design, fabricate, and place a custom porcelain crown in a single appointment—no temporaries, no second visits. Crowns are used to protect cracked teeth, restore broken cusps, cover implants, or complete a root-canal-treated tooth with a seamless, natural look.",
      image: "/assets/services/dental-crowns.png",
    },
    {
      slug: "general-dentistry",
      name: "General Dentistry",
      icon: "Stethoscope",
      shortDescription:
        "Comprehensive preventive and restorative care to keep your smile healthy year-round.",
      longDescription:
        "Our general dentistry services cover everything from routine cleanings and exams to fillings and gum evaluations. We use digital X-rays and intraoral cameras to catch issues early, saving you time and money. Regular visits form the foundation of a lifetime of excellent oral health.",
      image: "/assets/services/general-dentistry.png",
    },
    {
      slug: "cosmetic-dentistry",
      name: "Cosmetic Dentistry",
      icon: "Paintbrush",
      shortDescription:
        "Transform your smile with veneers, bonding, contouring, and full smile makeovers.",
      longDescription:
        "Cosmetic dentistry is about more than aesthetics—it's about confidence. We offer porcelain veneers, composite bonding, gum contouring, and comprehensive smile design to address chips, cracks, gaps, and discoloration. Every cosmetic plan begins with a thorough consultation and a digital smile preview.",
      image: "/assets/services/cosmetic-dentistry.png",
    },
    {
      slug: "emergency-care",
      name: "Emergency Care",
      icon: "Zap",
      shortDescription:
        "Same-day emergency appointments available for sudden pain, broken teeth, and dental trauma.",
      longDescription:
        "Dental emergencies don't follow a schedule, and neither do we. We reserve daily slots for urgent cases including severe toothaches, knocked-out teeth, lost crowns, and soft-tissue injuries. Call us first thing and we'll do everything possible to see you the same day and relieve your pain fast.",
      image: "/assets/services/emergency-care.png",
    },
    {
      slug: "dental-implants",
      name: "Dental Implants",
      icon: "Anchor",
      shortDescription:
        "Permanent, natural-looking tooth replacements anchored directly in your jawbone.",
      longDescription:
        "Dental implants are the gold standard for replacing missing teeth, offering unmatched stability, function, and aesthetics. A titanium post is placed in the jawbone, integrates over a few months, and then supports a custom crown indistinguishable from your natural teeth. With proper care, implants can last a lifetime.",
      image: "/assets/services/dental-implants.png",
    },
    {
      slug: "root-canal-therapy",
      name: "Root Canal Therapy",
      icon: "Activity",
      shortDescription:
        "Pain-free root canal treatment that saves your natural tooth and ends severe pain.",
      longDescription:
        "Modern root canal therapy is nothing to fear. With advanced anesthesia techniques and rotary endodontic instruments, most patients report the procedure feels no different from getting a filling. We remove infected pulp tissue, clean and seal the canal, and protect the tooth with a crown—saving it for decades to come.",
      image: "/assets/services/root-canal.png",
    },
    {
      slug: "pediatric-dentistry",
      name: "Pediatric Dentistry",
      icon: "Heart",
      shortDescription:
        "Gentle, fun, kid-friendly dental care that builds healthy habits from the very first tooth.",
      longDescription:
        "Our pediatric team specializes in creating positive dental experiences for children of all ages, from infants through teens. We use child-appropriate language, explain every step, and make check-ups feel like an adventure rather than a chore. Early dental education sets the stage for a lifetime of healthy smiles.",
      image: "/assets/services/pediatric-dentistry.png",
    },
    {
      slug: "orthodontics",
      name: "Orthodontics",
      icon: "AlignLeft",
      shortDescription:
        "Traditional braces and modern clear aligner options for teens and adults alike.",
      longDescription:
        "Whether you prefer classic metal braces or cutting-edge clear aligners, our orthodontic team delivers precise, beautiful results at every age. We use 3D scanning technology to plan treatment with digital accuracy, reducing surprises and shortening overall treatment time. Flexible payment plans are available.",
      image: "/assets/services/orthodontics.png",
    },
  ],

  whyUs: {
    title: "Why Patients Choose Brightsmile",
    subtitle:
      "We've spent over 15 years earning the trust of Austin families through consistent, compassionate, and cutting-edge dental care.",
    differentiators: [
      {
        icon: "Clock",
        title: "Same-Day Appointments",
        description:
          "We keep daily slots open for new patients and emergencies so you're never left waiting in pain or uncertainty.",
      },
      {
        icon: "Shield",
        title: "Advanced Technology",
        description:
          "Digital X-rays, 3D cone-beam imaging, intraoral cameras, and CEREC same-day crowns put us at the forefront of modern dentistry.",
      },
      {
        icon: "Star",
        title: "4.9-Star Reputation",
        description:
          "Over 312 verified Google reviews reflect our commitment to exceptional outcomes, transparent pricing, and respectful care.",
      },
      {
        icon: "Users",
        title: "Whole-Family Care",
        description:
          "From your toddler's first tooth to grandparent's implants, we treat every generation with the same personalized attention.",
      },
    ],
  },

  team: [
    {
      slug: "dr-sarah-chen",
      name: "Dr. Sarah Chen",
      title: "Lead Dentist, DDS",
      credentials: ["DDS — University of Texas Health Science Center", "Fellow, Academy of General Dentistry", "Invisalign Certified Provider"],
      bio: "Dr. Chen founded Brightsmile Dental in 2009 with a simple mission: deliver big-city dental expertise with small-town warmth. A graduate of UT Health Science Center San Antonio, she has completed over 500 hours of continuing education in cosmetic and restorative dentistry. When she's not transforming smiles, she volunteers at Austin's free dental clinics and coaches youth soccer on weekends.",
      photo: "/assets/team/team-chen.png",
    },
    {
      slug: "dr-marcus-rivera",
      name: "Dr. Marcus Rivera",
      title: "Orthodontist, DMD",
      credentials: ["DMD — Baylor College of Dentistry", "Residency in Orthodontics — Vanderbilt University", "Board-Certified Orthodontist, AAO Member"],
      bio: "Dr. Rivera joined Brightsmile in 2014, bringing with him a reputation for precision orthodontics and a calm chairside manner that puts even the most anxious patients at ease. He specializes in complex bite corrections, early interceptive treatment for children, and Invisalign for adults. Outside the office, Dr. Rivera is an avid cyclist and Austin FC season-ticket holder.",
      photo: "/assets/team/team-rivera.png",
    },
    {
      slug: "dr-aisha-thompson",
      name: "Dr. Aisha Thompson",
      title: "Pediatric Specialist, DDS",
      credentials: ["DDS — Howard University College of Dentistry", "Pediatric Dentistry Residency — Texas Children's Hospital", "Diplomat, American Board of Pediatric Dentistry"],
      bio: "Dr. Thompson is Brightsmile's resident champion for children's oral health. Board-certified in pediatric dentistry, she has a gift for connecting with kids of all ages and turning dental anxiety into genuine enthusiasm for oral hygiene. She is also a sought-after speaker on early childhood caries prevention and regularly publishes in pediatric dental journals.",
      photo: "/assets/team/team-aisha.png",
    },
  ],

  beforeAfter: [
    {
      before: "/assets/porcelain-veneers-before.png",
      after: "/assets/porcelain-veneers-after.png",
      caption: "Full Smile Makeover — Porcelain Veneers",
    },
    {
      before: "/assets/professional-teeth-whitening-before.png",
      after: "/assets/professional-teeth-whitening-after.png",
      caption: "Professional Teeth Whitening — 8 Shades Brighter",
    },
    {
      before: "/assets/single-tooth-implant-before.png",
      after: "/assets/single-tooth-implant-after.png",
      caption: "Single-Tooth Implant — Natural-Looking Restoration",
    },
  ],

  reviews: [
    {
      name: "Jennifer M.",
      rating: 5,
      text: "I've been coming to Brightsmile for three years and every single visit has been exceptional. Dr. Chen takes the time to explain everything, the staff is warm and welcoming, and I've never had to wait more than five minutes past my appointment time. The office is spotless and uses the latest technology. I've recommended them to everyone I know.",
      date: "2025-11",
      source: "Google",
    },
    {
      name: "Carlos T.",
      rating: 5,
      text: "Broke a tooth on a Friday afternoon and they got me in within two hours for emergency care. Dr. Chen placed a CEREC crown the same day — I couldn't believe it. No temporary, no second appointment. The crown looks and feels completely natural. This practice genuinely cares about its patients.",
      date: "2025-10",
      source: "Google",
    },
    {
      name: "Priya S.",
      rating: 5,
      text: "Dr. Thompson is an absolute gem with my kids. My 6-year-old used to be terrified of the dentist; after just one visit here, he actually asks when he gets to go back. The pediatric suite is colorful and fun, the staff is incredibly patient, and they explain everything in kid-friendly terms. We will not go anywhere else.",
      date: "2025-09",
      source: "Google",
    },
    {
      name: "David K.",
      rating: 5,
      text: "Dr. Rivera completed my Invisalign treatment in 14 months — right on schedule. Throughout the process he monitored my progress closely and made adjustments whenever needed. The digital preview he showed me at the consultation was almost exactly what I ended up with. My confidence has skyrocketed. Worth every penny.",
      date: "2025-08",
      source: "Google",
    },
    {
      name: "Maria L.",
      rating: 5,
      text: "I needed three implants after years of neglecting my teeth, and I was dreading the process. The Brightsmile team made it manageable from start to finish — clear cost estimates, gentle surgical technique, and thorough aftercare instructions. All three implants integrated perfectly and I'm so happy with the results. Truly life-changing.",
      date: "2025-07",
      source: "Google",
    },
    {
      name: "Robert H.",
      rating: 5,
      text: "Best dental experience I've had in 40 years of dental visits. No upselling, no fear-mongering, just honest advice and excellent technical work. Dr. Chen restored two failing teeth that another dentist told me needed extraction. Clean, modern office, friendly staff, and billing that is always transparent. This is what dentistry should be.",
      date: "2025-06",
      source: "Google",
    },
  ],

  offer: {
    enabled: true,
    title: "$59 New Patient Special",
    description:
      "Get a comprehensive exam, full set of digital X-rays, and a professional cleaning — all for just $59. Our new-patient special is designed to remove every barrier to starting your dental health journey with us.",
    terms:
      "Valid for new patients only. Not combinable with insurance. Exam, X-rays, and standard cleaning included. Cosmetic or restorative treatment quoted separately. Offer may be withdrawn at any time.",
    ctaLabel: "Claim Your $59 Visit",
  },

  faq: [
    {
      question: "Do you accept dental insurance?",
      answer:
        "Yes — we accept most major PPO dental plans including Delta Dental, Cigna, Aetna, MetLife, United Concordia, and many others. Our insurance coordinators will verify your benefits before your appointment and explain exactly what is covered so there are no surprises. We also offer in-house financing for uninsured or under-insured patients through CareCredit and Sunbit.",
    },
    {
      question: "How quickly can I get an appointment as a new patient?",
      answer:
        "Most new patients can be seen within 48–72 hours for a routine appointment. We reserve same-day slots for dental emergencies — if you're in pain or have a dental trauma, call us first thing in the morning and we will do everything possible to get you in that day. You can also book online 24/7 through our Cal.com scheduling page.",
    },
    {
      question: "What should I expect at my first visit?",
      answer:
        "Your first visit typically runs 60–90 minutes. We'll take a full set of digital X-rays, perform a comprehensive oral exam including a cancer screening, evaluate your gum health, and discuss any concerns you have. If your schedule permits, we'll complete a professional cleaning the same day. You'll leave with a clear picture of your oral health and a personalized treatment roadmap.",
    },
    {
      question: "Is teeth whitening safe, and how long do the results last?",
      answer:
        "Professional teeth whitening performed or supervised by a dentist is very safe for most adults. Some patients experience temporary sensitivity during or after treatment, which resolves within 24–48 hours. In-office Zoom! results typically last 1–2 years with good oral hygiene; take-home tray results last 6–12 months and are easy to top up. We'll assess your enamel and existing restorations before recommending the best whitening approach for you.",
    },
    {
      question: "At what age should my child first see a dentist?",
      answer:
        "The American Academy of Pediatric Dentistry recommends a child's first dental visit within 6 months of the first tooth erupting, or by their first birthday — whichever comes first. Early visits allow us to monitor development, apply fluoride varnish, and coach parents on brushing and diet. Starting early builds a positive relationship with dental care that pays dividends for life.",
    },
    {
      question: "How do I know if I need a dental implant or a bridge?",
      answer:
        "Both implants and bridges replace missing teeth, but they differ significantly in approach and long-term outcomes. Implants replace the tooth root and don't involve adjacent teeth; they last 15–25+ years with proper care. Bridges require crowning the teeth on either side of the gap and typically last 10–15 years. During your consultation, Dr. Chen will evaluate your bone density, overall gum health, and budget to recommend the best option for your specific situation.",
    },
  ],

  features: {
    bookingMode: "form",
    calcomUrl: "https://cal.com/brightsmile/dental-appointment",
    showBeforeAfter: true,
    showOffer: true,
    showBlog: false,
  },

  sections: [
    "hero",
    "trustBar",
    "services",
    "whyUs",
    "offer",
    "beforeAfter",
    "team",
    "reviews",
    "faq",
    "location",
    "cta",
  ],
} as const;

/** Narrow inferred type of the default config — available if needed for exact-literal work. */
export type DefaultClinicConfig = typeof clinic;

/** Widened structural type that any clinic config object satisfies, regardless of string literals. */
export interface ClinicConfig {
  meta: {
    name: string;
    tagline: string;
    city: string;
    region: string;
    established: number;
    googleRating: number;
    reviewCount: number;
    acceptingNewPatients: boolean;
  };
  brand: {
    logoSrc: string;
    themePreset: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    radius: string;
  };
  contact: {
    phone: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      full: string;
    };
    geo: {
      lat: number;
      lng: number;
    };
    mapEmbedUrl: string;
    hours: ReadonlyArray<{
      day: string;
      open: string;
      close: string;
      closed: boolean;
    }>;
    socials: {
      facebook: string;
      instagram: string;
      twitter: string;
      google: string;
    };
  };
  hero: {
    variant: string;
    headline: string;
    subhead: string;
    image: string;
    badges: ReadonlyArray<string>;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  services: ReadonlyArray<{
    slug: string;
    name: string;
    icon: string;
    shortDescription: string;
    longDescription: string;
    image: string;
  }>;
  whyUs: {
    title: string;
    subtitle: string;
    differentiators: ReadonlyArray<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  team: ReadonlyArray<{
    slug: string;
    name: string;
    title: string;
    credentials: ReadonlyArray<string>;
    bio: string;
    photo: string;
  }>;
  beforeAfter: ReadonlyArray<{
    before: string;
    after: string;
    caption: string;
  }>;
  reviews: ReadonlyArray<{
    name: string;
    rating: number;
    text: string;
    date: string;
    source: string;
  }>;
  offer: {
    enabled: boolean;
    title: string;
    description: string;
    terms: string;
    ctaLabel: string;
  };
  faq: ReadonlyArray<{
    question: string;
    answer: string;
  }>;
  features: {
    bookingMode: string;
    calcomUrl: string;
    showBeforeAfter: boolean;
    showOffer: boolean;
    showBlog: boolean;
  };
  sections: ReadonlyArray<string>;
}
