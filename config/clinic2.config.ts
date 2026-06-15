import type { ClinicConfig } from '@/config/clinic.config';

export const clinic: ClinicConfig = {
  meta: {
    name: "Luxe Dental Studio",
    tagline: "The Art of the Perfect Smile — Beverly Hills",
    city: "Beverly Hills",
    region: "CA",
    established: 2014,
    googleRating: 5.0,
    reviewCount: 187,
    acceptingNewPatients: true,
  },

  brand: {
    logoSrc: "/logo.svg",
    themePreset: "luxury",
    colors: {
      primary: "#B8860B",
      secondary: "#F5F0E8",
      accent: "#8B7536",
    },
    radius: "0.25rem",
  },

  contact: {
    phone: "+1-310-555-0198",
    email: "concierge@luxedentalstudio.com",
    address: {
      street: "9465 Wilshire Blvd, Suite 320",
      city: "Beverly Hills",
      state: "CA",
      zip: "90212",
      full: "9465 Wilshire Blvd, Suite 320, Beverly Hills, CA 90212",
    },
    geo: {
      lat: 34.0673,
      lng: -118.3968,
    },
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.123!2d-118.3968!3d34.0673",
    hours: [
      { day: "Monday", open: "9:00 AM", close: "6:00 PM", closed: false },
      { day: "Tuesday", open: "9:00 AM", close: "6:00 PM", closed: false },
      { day: "Wednesday", open: "9:00 AM", close: "6:00 PM", closed: false },
      { day: "Thursday", open: "9:00 AM", close: "7:00 PM", closed: false },
      { day: "Friday", open: "9:00 AM", close: "5:00 PM", closed: false },
      { day: "Saturday", open: "10:00 AM", close: "4:00 PM", closed: false },
      { day: "Sunday", open: "", close: "", closed: true },
    ],
    socials: {
      facebook: "https://facebook.com/luxedentalstudio",
      instagram: "https://instagram.com/luxedentalstudio",
      twitter: "https://twitter.com/luxedentalstudio",
      google: "https://g.page/luxedentalstudio",
    },
  },

  hero: {
    variant: "centered",
    headline: "Where Dental Artistry Meets Concierge Care",
    subhead:
      "Beverly Hills' most acclaimed cosmetic dental studio. Award-winning smile designers, cutting-edge technology, and a white-glove experience reserved for those who expect nothing less than perfection.",
    image: "/images/hero.jpg",
    badges: [
      "Award-winning cosmetic dentistry",
      "Concierge service",
      "Accepting new clients",
    ],
    primaryCta: {
      label: "Request a Smile Consultation",
      href: "/book",
    },
    secondaryCta: {
      label: "Explore Our Artistry",
      href: "/services",
    },
  },

  services: [
    {
      slug: "general-dentistry",
      name: "Preventive Excellence",
      icon: "Stethoscope",
      shortDescription:
        "Comprehensive wellness exams and precision cleanings delivered with the care and discretion Beverly Hills clients deserve.",
      longDescription:
        "Our preventive care program goes far beyond the routine check-up. Each appointment includes a thorough full-mouth evaluation using high-resolution digital imaging, a comprehensive gum health assessment, an oral cancer screening, and a professional cleaning performed by our credentialed hygienists. We build personalised prevention plans — because protecting an extraordinary smile requires extraordinary attention to detail.",
      image: "/images/services/general-dentistry.jpg",
    },
    {
      slug: "teeth-whitening",
      name: "Luminous Whitening",
      icon: "Sparkles",
      shortDescription:
        "Bespoke whitening protocols that deliver red-carpet brilliance without compromising enamel integrity.",
      longDescription:
        "At Luxe Dental Studio, whitening is a curated experience. We begin with a detailed shade analysis and enamel assessment before prescribing a whitening protocol tailored specifically to your teeth. Our in-studio treatment combines professional-strength gel with precision light activation, achieving results up to ten shades brighter in a single session. Custom maintenance trays, crafted from digital impressions, preserve your luminous result between visits.",
      image: "/images/services/teeth-whitening.jpg",
    },
    {
      slug: "invisalign",
      name: "Discreet Alignment",
      icon: "Smile",
      shortDescription:
        "Virtually invisible, concierge-managed aligner therapy for a flawless smile on your schedule.",
      longDescription:
        "Our certified Invisalign Diamond-tier providers have transformed hundreds of Beverly Hills smiles with seamless, removable aligner therapy. Each treatment plan begins with a full 3D iTero digital scan, producing a precise virtual model of your anticipated final result before your first aligner is ever fabricated. Progress appointments are scheduled at your convenience, and refinements are included. Most complex cases resolve within 12–16 months.",
      image: "/images/services/invisalign.jpg",
    },
    {
      slug: "emergency-care",
      name: "Priority Access Care",
      icon: "Zap",
      shortDescription:
        "Discreet, same-day priority appointments for our clients whenever dental urgency arises.",
      longDescription:
        "Life does not pause for the calendar, and neither do we. Luxe Dental Studio clients have access to a private priority line for same-day urgent care — whether a chipped veneer before a gala, sudden dental pain, or a dental injury requiring immediate attention. We maintain confidential, expedited appointment slots to ensure your care is both swift and private.",
      image: "/images/services/emergency-care.jpg",
    },
    {
      slug: "dental-implants",
      name: "Precision Implantology",
      icon: "Anchor",
      shortDescription:
        "Flawlessly engineered implant restorations that look, feel, and function indistinguishably from natural teeth.",
      longDescription:
        "Our implant program combines guided surgical placement with master-crafted zirconia or porcelain crowns for restorations of exceptional quality. Using cone-beam CT imaging and surgical guides, placement is precise to within fractions of a millimetre. Every implant crown is hand-characterised by a master ceramist to match your surrounding dentition in shade, translucency, and texture. The result: a restoration only your dentist can identify.",
      image: "/images/services/dental-implants.jpg",
    },
    {
      slug: "pediatric-dentistry",
      name: "Young Smiles Program",
      icon: "Heart",
      shortDescription:
        "A nurturing, beautifully appointed environment that introduces children to exceptional dental care from the very start.",
      longDescription:
        "Our Young Smiles suite is thoughtfully designed to make every child feel calm, curious, and completely at ease. Our paediatric-focused clinicians use gentle, child-centred communication and age-appropriate techniques. We educate parents on home-care and nutrition, ensuring that a foundation of excellent oral health is established long before the permanent teeth arrive. Because exceptional smiles begin in childhood.",
      image: "/images/services/pediatric-dentistry.jpg",
    },
    {
      slug: "cosmetic-dentistry",
      name: "Smile Design Artistry",
      icon: "Paintbrush",
      shortDescription:
        "Bespoke smile transformations — from subtle refinements to full Hollywood makeovers — crafted with genuine artistry.",
      longDescription:
        "Every great smile is a unique composition of proportion, symmetry, shade, and texture. Our smile design consultations begin with a thorough facial and dental analysis, followed by digital smile design software that lets you preview your result before any preparation begins. We then collaborate with world-class ceramists to fabricate ultra-thin porcelain veneers, e.max crowns, and composite enhancements that are indistinguishable from nature — only better.",
      image: "/images/services/cosmetic-dentistry.jpg",
    },
    {
      slug: "orthodontics",
      name: "Refined Orthodontics",
      icon: "AlignLeft",
      shortDescription:
        "Precision bite correction and alignment solutions for adults and teens seeking subtle, efficient treatment.",
      longDescription:
        "We offer a curated selection of orthodontic solutions including Invisalign, clear ceramic braces, and lingual braces positioned behind the teeth for complete invisibility. Our board-certified orthodontist employs 3D digital treatment simulation to plan each case with accuracy and predictability. All orthodontic patients receive complimentary whitening upon completion of treatment — because the final reveal should be extraordinary.",
      image: "/images/services/orthodontics.jpg",
    },
    {
      slug: "root-canal-therapy",
      name: "Comfortable Endodontics",
      icon: "Activity",
      shortDescription:
        "Painless, single-visit root canal therapy using advanced rotary instrumentation and microscope-enhanced precision.",
      longDescription:
        "Fear of root canal therapy is rooted in a bygone era of dentistry. At Luxe Dental Studio, endodontic treatment is performed under profound anaesthesia with the aid of a dental operating microscope, ensuring every canal is cleaned and sealed with complete precision. Our rotary nickel-titanium systems reduce procedure time dramatically. Most patients report experiencing nothing beyond mild pressure — and leave the same day with their tooth saved.",
      image: "/images/services/root-canal-therapy.jpg",
    },
    {
      slug: "dental-crowns",
      name: "Bespoke Crown Restorations",
      icon: "Crown",
      shortDescription:
        "Master-crafted ceramic and zirconia crowns that restore function and elevate aesthetics simultaneously.",
      longDescription:
        "A crown from Luxe Dental Studio is not a clinical appliance — it is a work of precision craftsmanship. Each restoration is designed digitally using state-of-the-art CAD/CAM software and hand-finished by a master ceramist. We work exclusively with premium all-ceramic and zirconia materials for their unrivalled strength, biocompatibility, and optical beauty. Your temporary crown meanwhile is equally refined, ensuring your smile is never compromised during the fabrication process.",
      image: "/images/services/dental-crowns.jpg",
    },
    {
      slug: "periodontics",
      name: "Periodontal Wellness",
      icon: "Leaf",
      shortDescription:
        "Meticulous gum health management that protects the foundation of your smile and your systemic wellbeing.",
      longDescription:
        "Gum health is the cornerstone of a lasting, beautiful smile. Our periodontal programme combines thorough baseline assessments with personalised maintenance protocols, laser-assisted gum therapy where indicated, and systemic co-management when periodontal disease intersects with conditions such as diabetes or cardiovascular disease. We monitor every millimetre of tissue at each visit to ensure your investment in your smile is protected for life.",
      image: "/images/services/periodontics.jpg",
    },
    {
      slug: "oral-surgery",
      name: "Refined Oral Surgery",
      icon: "Scissors",
      shortDescription:
        "Discreet, minimally invasive oral surgical procedures performed in our private, premium surgical suite.",
      longDescription:
        "Our surgical suite is designed for privacy, comfort, and clinical excellence in equal measure. We perform wisdom tooth removal, bone augmentation and grafting, soft-tissue procedures, and surgical implant placements under local anaesthesia with IV sedation available for those who prefer a completely relaxed experience. Post-operative care instructions and a follow-up call from your clinician are standard practice — because exceptional care extends well beyond the appointment itself.",
      image: "/images/services/oral-surgery.jpg",
    },
  ],

  whyUs: {
    title: "The Luxe Dental Difference",
    subtitle:
      "For over a decade, Beverly Hills' most discerning clientele have trusted Luxe Dental Studio for smile artistry that combines clinical precision with an uncompromising standard of care.",
    differentiators: [
      {
        icon: "Star",
        title: "Award-Winning Artistry",
        description:
          "Recognised by Los Angeles Magazine's Top Dentists list four consecutive years, our clinicians are regarded as some of the most skilled cosmetic practitioners in Southern California.",
      },
      {
        icon: "Shield",
        title: "Concierge Experience",
        description:
          "From private parking validation to a personal treatment coordinator who manages every detail of your care, our white-glove service ensures every visit is seamless and stress-free.",
      },
      {
        icon: "Clock",
        title: "Precision Technology",
        description:
          "Digital smile design, cone-beam CT, 3D iTero scanning, dental operating microscopes, and laser therapy — our suite of technology ensures outcomes of the highest possible standard.",
      },
      {
        icon: "Users",
        title: "Absolute Discretion",
        description:
          "Your privacy is paramount. We maintain strict confidentiality protocols for all clients, with private consultation rooms and discreet scheduling options available on request.",
      },
    ],
  },

  team: [
    {
      slug: "dr-eleanor-voss",
      name: "Dr. Eleanor Voss",
      title: "Founder & Lead Cosmetic Dentist, DDS",
      credentials: [
        "DDS — UCLA School of Dentistry (Honours)",
        "Fellowship, American Academy of Cosmetic Dentistry",
        "Advanced Smile Design — Kois Center, Seattle",
      ],
      bio: "Dr. Eleanor Voss founded Luxe Dental Studio in 2014 after a distinguished career in restorative and cosmetic dentistry spanning both Los Angeles and London. A Fellow of the American Academy of Cosmetic Dentistry and a graduate of the prestigious Kois Center advanced training programme, she is widely regarded as one of the foremost smile designers on the West Coast. Her work has been featured in Vogue, Harper's Bazaar, and the Los Angeles Times. Dr. Voss approaches each case as a collaboration between clinical science and aesthetic artistry, ensuring every smile she creates is as functional as it is beautiful.",
      photo: "/images/team/dr-eleanor-voss.jpg",
    },
    {
      slug: "dr-james-nakamura",
      name: "Dr. James Nakamura",
      title: "Implantologist & Oral Surgeon, DMD",
      credentials: [
        "DMD — University of Southern California Herman Ostrow School of Dentistry",
        "Residency in Oral & Maxillofacial Surgery — Cedars-Sinai Medical Center",
        "Diplomat, American Board of Oral Implantology",
      ],
      bio: "Dr. James Nakamura brings surgical excellence and a meticulous eye for detail to every implant and oral surgery procedure at Luxe Dental Studio. Trained at Cedars-Sinai and board-certified in oral implantology, he has placed over two thousand implants and is a recognised authority on full-arch reconstruction and bone augmentation. His patients consistently describe his approach as reassuring, thorough, and technically impeccable. Away from the studio, Dr. Nakamura lectures internationally on guided implant surgery and is an enthusiastic collector of contemporary Japanese ceramics.",
      photo: "/images/team/dr-james-nakamura.jpg",
    },
  ],

  beforeAfter: [
    {
      before: "/images/before-after/smile-makeover-before-1.jpg",
      after: "/images/before-after/smile-makeover-after-1.jpg",
      caption: "Full Smile Design — 10 Ultra-Thin Porcelain Veneers",
    },
    {
      before: "/images/before-after/whitening-before-2.jpg",
      after: "/images/before-after/whitening-after-2.jpg",
      caption: "Luminous Whitening — Ten Shades Brighter in One Session",
    },
    {
      before: "/images/before-after/implant-before-3.jpg",
      after: "/images/before-after/implant-after-3.jpg",
      caption: "Full-Arch Implant Reconstruction — Zirconia Restorations",
    },
  ],

  reviews: [
    {
      name: "Isabelle C.",
      rating: 5,
      text: "I have visited top dental practices in London, Paris, and New York, and Luxe Dental Studio surpasses them all. Dr. Voss designed my veneers with an artistry I have never encountered elsewhere — she studied my facial structure, listened to every nuance of what I wanted, and delivered a smile that looks completely natural yet utterly transformed. The studio itself is exquisite, and the team treats every client as though they are the most important person in the room.",
      date: "2026-02",
      source: "Google",
    },
    {
      name: "Michael R.",
      rating: 5,
      text: "I came to Dr. Voss for a complete smile redesign before my company's IPO roadshow — the timing could not have been more demanding. Her team accommodated my schedule with remarkable flexibility, delivered the digital smile preview within days, and completed twelve veneers flawlessly. The result is extraordinary. I feel a confidence in front of cameras and boardrooms I simply did not have before. The investment was absolutely justified.",
      date: "2026-01",
      source: "Google",
    },
    {
      name: "Sophia L.",
      rating: 5,
      text: "Dr. Nakamura replaced four implants that a previous clinic had placed poorly, performing complex bone grafting in the process. His surgical technique was precise, his explanation of each stage was clear and reassuring, and the outcome exceeded every expectation. The crowns crafted to finish the implants are genuinely beautiful — my periodontist, who examined them, asked who had made them. Exceptional on every measure.",
      date: "2025-12",
      source: "Google",
    },
    {
      name: "Alexandra V.",
      rating: 5,
      text: "The level of care and discretion at Luxe Dental Studio is unlike anything I have experienced at a dental practice. My treatment coordinator managed every detail of my Invisalign journey, from the initial 3D scan to the final refinements. Dr. Voss checked in personally at each appointment. The results — combined with the whitening included at completion — have genuinely changed how I feel about my smile. I cannot recommend this studio highly enough.",
      date: "2025-11",
      source: "Google",
    },
    {
      name: "Daniel P.",
      rating: 5,
      text: "I was referred to Luxe Dental Studio by my stylist and it is one of the best referrals I have ever received. From the private parking to the beautifully appointed consultation room to Dr. Voss herself — every element of the experience signals that this practice genuinely values its clients. My crowns and bonding work were completed over three appointments and the results are absolutely seamless. This is world-class dentistry.",
      date: "2025-10",
      source: "Google",
    },
    {
      name: "Christina W.",
      rating: 5,
      text: "I had significant dental anxiety after a traumatic experience elsewhere, and I was genuinely nervous returning to any practice. Dr. Voss and her team were extraordinary in their patience and sensitivity. They took time I did not expect to simply talk through my concerns before we proceeded with anything clinical. The treatment itself — a full preventive assessment and deep clean — was entirely pain-free. I left feeling genuinely cared for. I will not go anywhere else.",
      date: "2025-09",
      source: "Google",
    },
  ],

  offer: {
    enabled: true,
    title: "$99 Smile Consultation",
    description:
      "Your journey to the smile you deserve begins here. Our $99 Smile Consultation includes a comprehensive oral health assessment, a full digital smile design preview created specifically for your face, and a personalised treatment plan with transparent investment options — all with no obligation.",
    terms:
      "Valid for new patients only. Includes oral health assessment, digital smile design preview, and personalised treatment roadmap. Not combinable with insurance billing for the same visit. Consultation fee applied toward any accepted treatment plan valued at $500 or more. Offer subject to availability.",
    ctaLabel: "Book Your $99 Smile Consultation",
  },

  faq: [
    {
      question: "What makes Luxe Dental Studio different from other cosmetic dentists in Beverly Hills?",
      answer:
        "Our studio is distinguished by the rare combination of a Fellowship-level cosmetic dentist, a board-certified implantologist, and a concierge service model designed around our clients' lives rather than our scheduling convenience. Every treatment plan is underpinned by digital smile design technology that allows you to preview and approve your result before a single tooth is prepared. We also collaborate with master ceramists who hand-characterise every restoration — a standard of craftsmanship uncommon even in premium practices.",
    },
    {
      question: "How long does a complete smile makeover take?",
      answer:
        "Timeline depends on the scope of treatment. A full porcelain veneer case typically requires two to three appointments over three to four weeks — including your digital smile design consultation, preparation, and final placement. Cases involving implants, orthodontics, or bone grafting naturally require additional time, which your treatment coordinator will map out clearly from the outset. We work efficiently without compromising precision, and we will always accommodate your schedule wherever possible.",
    },
    {
      question: "Are your veneers reversible?",
      answer:
        "Conventional porcelain veneers require a minimal amount of enamel preparation and are not fully reversible, which is why we never begin preparation until you have approved your digital smile design preview and feel completely confident in the outcome. We also offer no-preparation or minimal-preparation veneers for suitable candidates, where little or no enamel reduction is required. Dr. Voss will advise you on the most appropriate approach during your consultation.",
    },
    {
      question: "Do you offer sedation dentistry?",
      answer:
        "Yes. We offer both oral conscious sedation and intravenous sedation for surgical procedures and for patients with significant dental anxiety. IV sedation is administered by our certified anaesthesia provider and allows most patients to complete lengthy procedures in a single, comfortable appointment with little or no memory of the treatment. All sedation options are discussed during your consultation so you can make a fully informed choice.",
    },
    {
      question: "What payment and financing options are available?",
      answer:
        "We accept all major credit cards, wire transfer, and cheque for larger treatment plans. We offer in-house extended payment arrangements for established clients and partner with CareCredit and Alphaeon Credit for third-party financing — both offer promotional interest-free periods. Your treatment coordinator will prepare a detailed investment overview and walk you through every available option before any commitment is made.",
    },
    {
      question: "How do I maintain my veneers or cosmetic work long-term?",
      answer:
        "Porcelain veneers and cosmetic restorations are highly durable when cared for properly. We provide each patient with a bespoke home-care protocol tailored to their specific restorations, including product recommendations and technique guidance. We also provide a custom nightguard for all veneer patients to protect against bruxism. Bi-annual maintenance visits are strongly recommended; our hygienists use instruments specifically selected to preserve ceramic surfaces. With proper care, quality veneers routinely last fifteen or more years.",
    },
  ],

  features: {
    bookingMode: "calcom",
    calcomUrl: "https://cal.com/luxedentalstudio/smile-consultation",
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
};
