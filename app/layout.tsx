import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Lora,
  Cormorant_Garamond,
} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getClinic, getTheme } from "@/lib/useClinic";
import JsonLd from "@/components/seo/JsonLd";
import { buildDentistSchema } from "@/lib/jsonld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const clinic = getClinic();
  return {
    metadataBase: new URL("https://dental.veilcode.studio"),
    title: {
      template: `%s | ${clinic.meta.name}`,
      default: `${clinic.meta.name} — ${clinic.meta.tagline}`,
    },
    description: `${clinic.meta.name} in ${clinic.meta.city}, ${clinic.meta.region}. ${clinic.meta.tagline}. Call ${clinic.contact.phone}.`,
    openGraph: {
      type: "website",
      siteName: clinic.meta.name,
      title: `${clinic.meta.name} — ${clinic.meta.tagline}`,
      description: `Accepting new patients in ${clinic.meta.city}, ${clinic.meta.region}.`,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clinic = getClinic();
  const theme = getTheme();

  const cssVars: Record<string, string> = {
    ...theme.cssVars.light,
    "--radius": clinic.brand.radius,
    ...(clinic.brand.colors.primary && {
      "--primary": clinic.brand.colors.primary,
    }),
    ...(clinic.brand.colors.secondary && {
      "--secondary": clinic.brand.colors.secondary,
    }),
    ...(clinic.brand.colors.accent && {
      "--accent": clinic.brand.colors.accent,
    }),
    "--font-heading-active": `var(${theme.headingFontVar})`,
  };

  const fontVariables = [
    geistSans.variable,
    geistMono.variable,
    lora.variable,
    cormorant.variable,
  ].join(" ");

  return (
    <html
      lang="en"
      className={`${fontVariables} h-full antialiased`}
      data-theme-preset={clinic.brand.themePreset}
      style={cssVars as React.CSSProperties}
    >
      <head>
        <JsonLd data={buildDentistSchema(clinic)} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
