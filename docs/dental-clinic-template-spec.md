# Re-Skinnable Dental Clinic Template — Build Spec

**Stack:** Next.js (App Router) + shadcn/ui + Tailwind, deployed on Vercel
**Goal:** A premium dental clinic site that re-skins per prospect from a single config file, used as VeilCode Studio's lead-gen sales asset.

---

## 1. Architecture: three separated layers

The whole template rests on cleanly separating these. Mixing them is what makes templates hard to re-skin later.

1. **Brand / theme** → colors, fonts, radius, logo. Drives CSS variables + Tailwind theme.
2. **Content** → clinic name, services, team, reviews, hours, offers, contact. Pure structured data.
3. **Composition** → which sections show, which variant of each, section order. Feature flags.

shadcn is built for exactly this. Its components already read from CSS custom properties (`--primary`, `--background`, `--radius`, etc. in `globals.css`). So a theme re-skin = swapping a block of CSS variables, **not** editing components. Lean into that — it's the cleanest part of the whole approach.

---

## 2. The config file (`config/clinic.config.ts`)

Everything prospect-specific lives here. Nothing hardcoded in components.

```ts
export const clinic = {
  meta: {
    name: "Brightsmile Dental",
    tagline: "Modern dentistry, gentle care",
    city: "Austin",
    region: "TX",
    established: 2009,
    googleRating: 4.9,
    reviewCount: 312,
    acceptingNewPatients: true,
  },
  brand: {
    logoSrc: "/logo.svg",
    themePreset: "modern",            // 'modern' | 'warm' | 'luxury' — sets fonts/radius/feel
    colors: { primary: "#0EA5E9", secondary: "#0F172A", accent: "#22C55E" }, // overrides preset
    radius: "0.75rem",
  },
  contact: {
    phone: "+1-512-555-0142",
    email: "hello@brightsmile.example",
    address: { line1: "123 Congress Ave", city: "Austin", region: "TX", postal: "78701" },
    geo: { lat: 30.2672, lng: -97.7431 },
    mapEmbedUrl: "https://www.google.com/maps/embed?...",
    hours: [ { day: "Mon–Thu", open: "8:00", close: "17:00" }, /* ... */ ],
    socials: { facebook: "", instagram: "", google: "" },
  },
  hero: {
    variant: "split",                 // 'split' | 'centered' | 'image-bg'
    headline: "A dentist your whole family will look forward to seeing",
    subhead: "Same-day appointments. Most insurance accepted. Zero judgment.",
    image: "/hero.jpg",
    badges: ["20+ years", "5-star rated", "Accepting new patients"],
    primaryCta: { label: "Book Appointment", href: "/book" },
    secondaryCta: { label: "Call now", href: "tel:+15125550142" },
  },
  services: [
    { slug: "general-dentistry", name: "General Dentistry", icon: "Stethoscope",
      short: "Cleanings, fillings, and checkups.", long: "...", image: "/svc-general.jpg" },
    { slug: "teeth-whitening", name: "Teeth Whitening", icon: "Sparkles",
      short: "Professional, safe brightening.", long: "...", image: "/svc-whitening.jpg" },
    { slug: "invisalign", name: "Invisalign", icon: "AlignJustify", short: "...", long: "..." },
    { slug: "emergency", name: "Emergency Care", icon: "Siren", short: "...", long: "..." },
    // implants, ortho, pediatric, cosmetic...
  ],
  team: [
    { name: "Dr. Sarah Chen", role: "Lead Dentist, DDS",
      credentials: ["DDS, UT Austin", "AGD Fellow"], bio: "...", photo: "/dr-chen.jpg" },
  ],
  beforeAfter: [ { before: "/ba1-before.jpg", after: "/ba1-after.jpg", caption: "Veneers" } ],
  reviews: [
    { name: "Maria G.", rating: 5, text: "...", date: "2025-11", source: "Google" },
  ],
  offer: {
    enabled: true,
    title: "$59 New Patient Exam + X-Rays",
    description: "Includes a full exam, digital X-rays, and a personalized care plan.",
    terms: "New patients only. Cannot be combined with insurance.",
    ctaLabel: "Claim this offer",
  },
  faq: [ { q: "Do you accept my insurance?", a: "..." } ],
  features: {
    bookingMode: "calcom",            // 'calcom' | 'form'
    calcomUrl: "https://cal.com/your-handle/dental",
    showBeforeAfter: true,
    showOffer: true,
    showBlog: false,
  },
  // Section order + visibility — composition layer
  sections: [
    "hero", "trustBar", "services", "whyUs", "offer",
    "beforeAfter", "team", "reviews", "faq", "location", "cta",
  ],
} as const;

export type ClinicConfig = typeof clinic;
```

A `<SectionRenderer>` maps over `clinic.sections` and renders the matching component, so section order and visibility are pure data. Theme presets live in a separate `config/themes.ts` (each preset = a set of CSS-variable values + a next/font pairing).

---

## 3. Pages (App Router)

| Route | Purpose | SEO target |

|---|---|---|
| `/` | Full home — all sections | "[clinic] dentist in [city]" |
| `/services/[slug]` | Service detail, generated from config | "[service] in [city]" |
| `/about` | Practice story + team | brand |
| `/book` | Booking (Cal.com embed or styled form) | conversion |
| `/contact` | Form + map + hours | "dentist near me" |
| `/services` | Index of all services | service hub |

`generateStaticParams` builds the service pages from `clinic.services`, so adding a service in config auto-creates its page.

---

## 4. Section inventory (home page)

Build in this priority order. Each is a self-contained component reading from config.

**Above the fold (these do the converting):**

- **Sticky nav** — logo, links, prominent `Book` button, visible click-to-call on mobile.
- **Hero** — headline, subhead, primary CTA (book), secondary (call), trust badges, image. 3 variants behind `hero.variant`.
- **Trust bar** — insurance logos, "accepting new patients", rating + review count.

**Body:**

- **Services grid** — icon cards (lucide icons named in config), each links to detail page.
- **Why choose us** — 3–4 differentiators with icons.
- **New-patient offer** — the lead magnet. Headline offer + capture form. This is your conversion centerpiece.
- **Before/after gallery** — slider/comparison. Huge for cosmetic credibility. Toggle via `showBeforeAfter`.
- **Meet the team** — dentist cards with photos + credentials.
- **Reviews** — Google-review-styled testimonial carousel with stars, names, source badge.
- **FAQ** — accordion (insurance, first visit, payment plans). Doubles as SEO content.
- **Location** — embedded map, NAP block, hours table.
- **Final CTA band** — book + call, repeated.

**Persistent:**

- **Footer** — hours, contact, quick links, socials, second CTA.
- **Floating mobile bar** — sticky bottom bar with one-tap Call + Book (mobile only). This single element noticeably lifts conversion on dental sites.

---

## 5. Conversion + SEO layer (what makes the clinic believe "this gets me patients")

This is the part the buyer actually judges. Don't skip it — it's the difference between "nice site" and "this is revenue."

**Conversion:**

- One-tap click-to-call everywhere on mobile (`tel:` links).
- Online booking front and center (Cal.com embed actually works in a live demo — better than a fake picker).
- Lead-capture offer form with real frontend validation + success state.
- Reviews and rating visible above the fold.

**Local SEO (build it in, then show it off in the pitch):**

- **JSON-LD `Dentist`/`LocalBusiness` schema** generated from config (NAP, geo, hours, services, rating). This is the single most impressive "we know SEO" signal.
- Per-page metadata via Next's metadata API, driven by config (titles include city + service).
- `sitemap.ts` and `robots.ts`.
- Dynamic OpenGraph images via `@vercel/og` built from config — every page gets a branded share card automatically. Strong "wow" detail.
- Semantic HTML, descriptive alt text, fast static rendering, optimized `next/image`.
- Lighthouse 90+ on mobile as a hard target — screenshot it for the pitch.

---

## 6. What's real vs. mocked

Re-skinnable quality means the **frontend** must feel complete. The backend can be thin — no prospect tests it in a meeting.

| Feature | Approach |

|---|---|
| Lead/offer form | Real validation + success UI. POST to `/api/lead` route that logs (optionally emails via Resend). Feels fully real. |
| Booking | Cal.com embed (free, real, works live). Or styled frontend-only picker if you'd rather not depend on Cal.com. |
| Map | Real Google Maps embed from config. |
| Auth, DB, patient portal, payments | **Don't build.** Not visible, not asked, pure time sink. If asked: "phase two." |

---

## 7. Claude Code build sequence (run in this order)

Each prompt is a self-contained instruction. Don't dump them all at once — go batch by batch, review, commit, then continue.

**Prompt 1 — Config + theme foundation**:
> Create the config architecture for a re-skinnable dental site. Build `config/clinic.config.ts` with the full typed schema [paste the schema above]. Build `config/themes.ts` with three presets (`modern`, `warm`, `luxury`), each defining CSS-variable color/radius values and a next/font heading+body pairing. Wire the active theme from `clinic.brand` into `globals.css` CSS variables and the Tailwind theme so the entire site re-skins by editing config. Provide a typed `useClinic()` accessor.

**Prompt 2 — Layout shell + section renderer**:
> Build the root layout: sticky responsive nav (logo, links, Book CTA, mobile click-to-call), footer, and a floating mobile bottom bar with one-tap Call + Book. Build a `<SectionRenderer>` that maps over `clinic.sections` and renders matching section components in that order, so section order and visibility are config-driven. Use shadcn components throughout.

**Prompt 3 — Hero, trust bar, services**:
> Build the hero (three variants behind `clinic.hero.variant`: split, centered, image-bg), the trust bar (rating, review count, insurance, accepting-new-patients), and the services grid (cards from `clinic.services` using named lucide icons, each linking to `/services/[slug]`). Mobile-first, polished, with subtle entrance animations.

**Prompt 4 — Offer, before/after, team, reviews**:
> Build the new-patient offer section with a lead-capture form (real validation, success state, POST to `/api/lead`), a before/after comparison gallery (toggle via `showBeforeAfter`), the team section (cards with photo + credentials), and a Google-review-styled testimonial carousel.

**Prompt 5 — FAQ, location, CTA band**  
> Build the FAQ accordion, the location section (Google Maps embed from config, NAP block, hours table), and a final CTA band. All from config.

**Prompt 6 — Service detail pages**  
> Build `/services/[slug]` using `generateStaticParams` from `clinic.services`, with per-service metadata (title includes city + service name), a related-services block, and a booking CTA.

**Prompt 7 — SEO layer**  
> Add a `JsonLd` component generating `Dentist`/`LocalBusiness` schema from config (NAP, geo, hours, services, aggregateRating). Add per-page metadata via the metadata API driven by config, `sitemap.ts`, `robots.ts`, and dynamic OpenGraph images via `@vercel/og` built from clinic branding.

**Prompt 8 — Polish pass**  
> Full responsive QA across breakpoints, accessibility audit (focus states, alt text, contrast, aria labels), loading/empty states, and tune for Lighthouse mobile 90+. Add tasteful scroll animations without hurting performance.

**Prompt 9 — Re-skin proof (do this, it matters)**:
> Duplicate `clinic.config.ts` into a second clinic with a different theme preset, different services, different copy and city. Verify the entire site re-skins with zero component edits. Fix anything that's hardcoded.

That last step validates the abstraction **and** hands you a second portfolio demo for free.

---

## 8. The content checklist (the part that actually decides whether this lands)

Do this with the same seriousness as the code:

- [ ] A coherent fictional clinic: name, city, brand personality, color story.
- [ ] Professional copy for every section — write it like a real clinic markets itself, not placeholder text.
- [ ] Curated photography (Unsplash/Pexels "dental clinic", "dentist", "smile"). Be ruthlessly picky — generic = template.
- [ ] 8–12 realistic services with real descriptions.
- [ ] 2–3 dentist bios with credentials and warm, specific copy.
- [ ] 6+ believable reviews with names and dates.
- [ ] A compelling new-patient offer.
- [ ] A real logo (even a clean wordmark beats a placeholder).

---

## 9. Note for the outreach play

When you personalize an instance for a real prospect ("I rebuilt your clinic's site — here's the live link"), you can use their name/city/services to make it land. Fine for a "here's what I'd build for you" pitch. Don't permanently publish their existing branding or imply they endorsed it — keep personalized demos on unindexed preview URLs.
