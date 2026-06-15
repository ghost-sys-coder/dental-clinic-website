export const themes = {
  modern: {
    cssVars: {
      light: {
        "--primary": "oklch(0.62 0.21 255)",
        "--primary-foreground": "oklch(1 0 0)",
        "--secondary": "oklch(0.96 0.02 255)",
        "--secondary-foreground": "oklch(0.20 0.04 255)",
        "--accent": "oklch(0.70 0.18 154)",
        "--accent-foreground": "oklch(1 0 0)",
        "--muted": "oklch(0.97 0.01 255)",
        "--muted-foreground": "oklch(0.50 0.02 255)",
        "--border": "oklch(0.90 0.02 255)",
        "--ring": "oklch(0.62 0.21 255)",
      },
    },
    headingFontVar: "--font-geist-sans",
  },

  warm: {
    cssVars: {
      light: {
        "--primary": "oklch(0.75 0.18 75)",
        "--primary-foreground": "oklch(0.15 0 0)",
        "--background": "oklch(0.99 0.01 75)",
        "--foreground": "oklch(0.20 0.03 60)",
        "--accent": "oklch(0.65 0.15 35)",
        "--accent-foreground": "oklch(1 0 0)",
        "--muted": "oklch(0.96 0.02 75)",
        "--muted-foreground": "oklch(0.45 0.04 60)",
        "--border": "oklch(0.88 0.03 75)",
        "--ring": "oklch(0.75 0.18 75)",
      },
    },
    headingFontVar: "--font-lora",
  },

  luxury: {
    cssVars: {
      light: {
        "--background": "oklch(0.10 0.02 270)",
        "--foreground": "oklch(0.95 0.02 75)",
        "--card": "oklch(0.14 0.02 270)",
        "--card-foreground": "oklch(0.95 0.02 75)",
        "--primary": "oklch(0.75 0.10 85)",
        "--primary-foreground": "oklch(0.10 0.02 270)",
        "--secondary": "oklch(0.18 0.02 270)",
        "--secondary-foreground": "oklch(0.95 0.02 75)",
        "--accent": "oklch(0.70 0.12 85)",
        "--accent-foreground": "oklch(0.10 0.02 270)",
        "--muted": "oklch(0.16 0.02 270)",
        "--muted-foreground": "oklch(0.65 0.03 75)",
        "--border": "oklch(0.25 0.03 270)",
        "--ring": "oklch(0.75 0.10 85)",
      },
    },
    headingFontVar: "--font-cormorant",
  },
} as const;

export type ThemePreset = keyof typeof themes;
