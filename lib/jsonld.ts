import { ClinicConfig } from '@/config/clinic.config';

export function buildDentistSchema(clinic: ClinicConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Dentist', 'LocalBusiness'],
    name: clinic.meta.name,
    description: clinic.meta.tagline,
    url: 'https://brightsmile-dental.com', // placeholder — fine for template
    telephone: clinic.contact.phone,
    email: clinic.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.contact.address.street,
      addressLocality: clinic.contact.address.city,
      addressRegion: clinic.contact.address.state,
      postalCode: clinic.contact.address.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: clinic.contact.geo.lat,
      longitude: clinic.contact.geo.lng,
    },
    openingHoursSpecification: clinic.contact.hours
      .filter(h => !h.closed)
      .map(h => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.day,
        opens: h.open,
        closes: h.close,
      })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: clinic.meta.googleRating,
      reviewCount: clinic.meta.reviewCount,
      bestRating: 5,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Dental Services',
      itemListElement: clinic.services.map((s, i) => ({
        '@type': 'Offer',
        position: i + 1,
        itemOffered: {
          '@type': 'MedicalProcedure',
          name: s.name,
        },
      })),
    },
  };
}

export function buildServiceSchema(clinic: ClinicConfig, serviceName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: serviceName,
    provider: {
      '@type': 'Dentist',
      name: clinic.meta.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: clinic.contact.address.city,
        addressRegion: clinic.contact.address.state,
      },
    },
  };
}
