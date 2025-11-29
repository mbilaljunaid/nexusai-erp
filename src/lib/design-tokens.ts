/**
 * Design Tokens System for ERP Shell
 * Enterprise-grade token definitions with light/dark mode support
 */

// ============================================================================
// SPACING SCALE (8px base unit)
// ============================================================================
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================
export const fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
} as const;

export const lineHeight = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
  loose: '2',
} as const;

export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const borderRadius = {
  none: '0',
  xs: '0.125rem',   // 2px
  sm: '0.1875rem',  // 3px
  md: '0.375rem',   // 6px
  lg: '0.5625rem',  // 9px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

// ============================================================================
// ELEVATION / SHADOWS
// ============================================================================
export const shadow = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const;

// ============================================================================
// COLOR PALETTE: ENTERPRISE-BLUE (Primary)
// ============================================================================
export const colorPalette = {
  primary: {
    light: {
      '50': '#eff6ff',
      '100': '#dbeafe',
      '200': '#bfdbfe',
      '300': '#93c5fd',
      '400': '#60a5fa',
      '500': '#3b82f6',
      '600': '#2563eb',
      '700': '#1d4ed8',
      '800': '#1e40af',
      '900': '#1e3a8a',
    },
    dark: {
      '50': '#0f172a',
      '100': '#0f172a',
      '200': '#1e293b',
      '300': '#334155',
      '400': '#475569',
      '500': '#64748b',
      '600': '#3b82f6',
      '700': '#60a5fa',
      '800': '#93c5fd',
      '900': '#dbeafe',
    },
  },

  // ============================================================================
  // COLOR PALETTE: WARM-ACCENT (Secondary)
  // ============================================================================
  secondary: {
    light: {
      '50': '#fef3c7',
      '100': '#fde68a',
      '200': '#fcd34d',
      '300': '#fbbf24',
      '400': '#f59e0b',
      '500': '#f97316',
      '600': '#ea580c',
      '700': '#c2410c',
      '800': '#92400e',
      '900': '#78350f',
    },
    dark: {
      '50': '#78350f',
      '100': '#92400e',
      '200': '#b45309',
      '300': '#d97706',
      '400': '#f97316',
      '500': '#fb923c',
      '600': '#fdba74',
      '700': '#fed7aa',
      '800': '#fecaca',
      '900': '#fef3c7',
    },
  },

  // ============================================================================
  // SEMANTIC COLORS
  // ============================================================================
  semantic: {
    success: {
      light: '#10b981',
      dark: '#34d399',
    },
    warning: {
      light: '#f59e0b',
      dark: '#fbbf24',
    },
    error: {
      light: '#ef4444',
      dark: '#f87171',
    },
    info: {
      light: '#3b82f6',
      dark: '#60a5fa',
    },
  },

  // ============================================================================
  // NEUTRAL PALETTE
  // ============================================================================
  neutral: {
    light: {
      '50': '#f9fafb',
      '100': '#f3f4f6',
      '200': '#e5e7eb',
      '300': '#d1d5db',
      '400': '#9ca3af',
      '500': '#6b7280',
      '600': '#4b5563',
      '700': '#374151',
      '800': '#1f2937',
      '900': '#111827',
    },
    dark: {
      '50': '#111827',
      '100': '#1f2937',
      '200': '#374151',
      '300': '#4b5563',
      '400': '#6b7280',
      '500': '#9ca3af',
      '600': '#d1d5db',
      '700': '#e5e7eb',
      '800': '#f3f4f6',
      '900': '#f9fafb',
    },
  },
} as const;

// ============================================================================
// TRANSITION TIMING
// ============================================================================
export const transition = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

export const easing = {
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================================================
// BREAKPOINTS (Mobile-First)
// ============================================================================
export const breakpoints = {
  xs: '0',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================
export const zIndex = {
  hide: '-1',
  base: '0',
  dropdown: '1000',
  sticky: '1100',
  fixed: '1200',
  backdrop: '1300',
  modal: '1400',
  popover: '1500',
  tooltip: '1600',
  notification: '1700',
} as const;

// ============================================================================
// ACCESSIBILITY: FOCUS STATES
// ============================================================================
export const focus = {
  outline: '2px solid',
  outlineOffset: '2px',
  light: '#3b82f6',
  dark: '#93c5fd',
} as const;

// ============================================================================
// MOTION: PREFERS REDUCED MOTION
// ============================================================================
export const motion = {
  prefersReduced: '@media (prefers-reduced-motion: reduce)',
} as const;

// ============================================================================
// EXPORT ALL TOKENS
// ============================================================================
export const designTokens = {
  spacing,
  fontSize,
  lineHeight,
  fontWeight,
  borderRadius,
  shadow,
  colorPalette,
  transition,
  easing,
  breakpoints,
  zIndex,
  focus,
  motion,
} as const;

export type DesignTokens = typeof designTokens;
