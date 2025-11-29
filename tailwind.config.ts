import type { Config } from "tailwindcss";
import { spacing, fontSize, borderRadius, shadow, colorPalette, transition, easing, zIndex } from "./src/lib/design-tokens";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // ========================================================================
      // SPACING
      // ========================================================================
      spacing: {
        xs: spacing.xs,
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
        xl: spacing.xl,
        '2xl': spacing['2xl'],
        '3xl': spacing['3xl'],
        '4xl': spacing['4xl'],
      },

      // ========================================================================
      // TYPOGRAPHY
      // ========================================================================
      fontSize: {
        xs: fontSize.xs,
        sm: fontSize.sm,
        base: fontSize.base,
        lg: fontSize.lg,
        xl: fontSize.xl,
        '2xl': fontSize['2xl'],
        '3xl': fontSize['3xl'],
        '4xl': fontSize['4xl'],
        '5xl': fontSize['5xl'],
      },

      lineHeight: {
        tight: "1.25",
        normal: "1.5",
        relaxed: "1.75",
        loose: "2",
      },

      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },

      // ========================================================================
      // BORDER RADIUS
      // ========================================================================
      borderRadius: {
        none: borderRadius.none,
        xs: borderRadius.xs,
        sm: borderRadius.sm,
        md: borderRadius.md,
        lg: borderRadius.lg,
        xl: borderRadius.xl,
        '2xl': borderRadius['2xl'],
        full: borderRadius.full,
      },

      // ========================================================================
      // SHADOWS / ELEVATION
      // ========================================================================
      boxShadow: {
        none: shadow.none,
        xs: shadow.xs,
        sm: shadow.sm,
        md: shadow.md,
        lg: shadow.lg,
        xl: shadow.xl,
        '2xl': shadow['2xl'],
        inner: shadow.inner,
        // Enterprise-specific elevations
        'elevation-1': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'elevation-2': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'elevation-3': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },

      // ========================================================================
      // COLORS: PRIMARY (Enterprise Blue)
      // ========================================================================
      colors: {
        // Flat / base colors (regular buttons)
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
          50: colorPalette.primary.light['50'],
          100: colorPalette.primary.light['100'],
          200: colorPalette.primary.light['200'],
          300: colorPalette.primary.light['300'],
          400: colorPalette.primary.light['400'],
          500: colorPalette.primary.light['500'],
          600: colorPalette.primary.light['600'],
          700: colorPalette.primary.light['700'],
          800: colorPalette.primary.light['800'],
          900: colorPalette.primary.light['900'],
        },
        
        // ====================================================================
        // SECONDARY (Warm Accent)
        // ====================================================================
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
          50: colorPalette.secondary.light['50'],
          100: colorPalette.secondary.light['100'],
          200: colorPalette.secondary.light['200'],
          300: colorPalette.secondary.light['300'],
          400: colorPalette.secondary.light['400'],
          500: colorPalette.secondary.light['500'],
          600: colorPalette.secondary.light['600'],
          700: colorPalette.secondary.light['700'],
          800: colorPalette.secondary.light['800'],
          900: colorPalette.secondary.light['900'],
        },
        
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        
        ring: "hsl(var(--ring) / <alpha-value>)",
        
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)"
        },
        
        // Semantic colors
        success: {
          light: colorPalette.semantic.success.light,
          dark: colorPalette.semantic.success.dark,
        },
        warning: {
          light: colorPalette.semantic.warning.light,
          dark: colorPalette.semantic.warning.dark,
        },
        error: {
          light: colorPalette.semantic.error.light,
          dark: colorPalette.semantic.error.dark,
        },
        info: {
          light: colorPalette.semantic.info.light,
          dark: colorPalette.semantic.info.dark,
        },
        
        status: {
          online: "rgb(34 197 94)",
          away: "rgb(245 158 11)",
          busy: "rgb(239 68 68)",
          offline: "rgb(156 163 175)",
        },
      },

      // ========================================================================
      // FONTS
      // ========================================================================
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },

      // ========================================================================
      // TRANSITIONS
      // ========================================================================
      transitionDuration: {
        fast: transition.fast,
        base: transition.base,
        slow: transition.slow,
        slower: transition.slower,
      },

      transitionTimingFunction: {
        in: easing.in,
        out: easing.out,
        'in-out': easing.inOut,
      },

      // ========================================================================
      // Z-INDEX
      // ========================================================================
      zIndex: {
        hide: zIndex.hide,
        base: zIndex.base,
        dropdown: zIndex.dropdown,
        sticky: zIndex.sticky,
        fixed: zIndex.fixed,
        backdrop: zIndex.backdrop,
        modal: zIndex.modal,
        popover: zIndex.popover,
        tooltip: zIndex.tooltip,
        notification: zIndex.notification,
      },

      // ========================================================================
      // ANIMATIONS
      // ========================================================================
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },

  // ============================================================================
  // CUSTOM UTILITIES
  // ============================================================================
  corePlugins: {},

  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    
    // Custom focus outline utility for accessibility
    function ({ addUtilities }: any) {
      addUtilities({
        '.focus-outline': {
          '@apply outline-2 outline-offset-2 outline-blue-500 dark:outline-blue-400': {},
        },
        '.focus-outline-ring': {
          '@apply ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400': {},
        },
        
        // Reduced motion support
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            'animation-duration': '0.01ms !important',
            'animation-iteration-count': '1 !important',
            'transition-duration': '0.01ms !important',
            'scroll-behavior': 'auto !important',
          },
        },
      });
    },

    // Custom utilities for enterprise design
    function ({ addComponents, theme }: any) {
      addComponents({
        '.card-elevated': {
          '@apply bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700': {},
        },
        '.input-base': {
          '@apply px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus-outline transition-colors': {},
        },
        '.button-base': {
          '@apply px-4 py-2 rounded-md font-medium transition-all duration-200 focus-outline': {},
        },
        '.button-primary': {
          '@apply button-base bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95': {},
        },
        '.button-secondary': {
          '@apply button-base bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95': {},
        },
        '.text-sm-medium': {
          '@apply text-sm font-medium': {},
        },
        '.text-base-semibold': {
          '@apply text-base font-semibold': {},
        },
        '.text-lg-bold': {
          '@apply text-lg font-bold': {},
        },
      });
    },
  ],
} satisfies Config;
