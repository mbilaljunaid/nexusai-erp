// Lovable Design System - Design Tokens
// Color palettes, typography, spacing, and other design constants

export const colors = {
    // Primary Gradients (Purple to Blue)
    gradients: {
        primary: "linear-gradient(135deg, hsl(270, 70%, 60%) 0%, hsl(220, 90%, 60%) 100%)",
        secondary: "linear-gradient(135deg, hsl(160, 70%, 50%) 0%, hsl(200, 90%, 50%) 100%)",
        accent: "linear-gradient(135deg, hsl(330, 80%, 60%) 0%, hsl(280, 80%, 60%) 100%)",
        dark: "linear-gradient(135deg, hsl(220, 20%, 15%) 0%, hsl(220, 25%, 25%) 100%)",
        glass: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
    },

    // Solid Colors (HSL for easy manipulation)
    brand: {
        purple: "hsl(270, 70%, 60%)",
        blue: "hsl(220, 90%, 60%)",
        emerald: "hsl(160, 70%, 50%)",
        pink: "hsl(330, 80%, 60%)",
    },

    // Semantic Colors
    success: "hsl(142, 76%, 36%)",
    warning: "hsl(38, 92%, 50%)",
    error: "hsl(0, 84%, 60%)",
    info: "hsl(199, 89%, 48%)",
};

export const typography = {
    fonts: {
        heading: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        mono: "'Roboto Mono', 'Courier New', monospace",
    },

    sizes: {
        xs: "0.75rem",    // 12px
        sm: "0.875rem",   // 14px
        base: "1rem",     // 16px
        lg: "1.125rem",   // 18px
        xl: "1.25rem",    // 20px
        "2xl": "1.5rem",  // 24px
        "3xl": "1.875rem", // 30px
        "4xl": "2.25rem", // 36px
        "5xl": "3rem",    // 48px
        "6xl": "3.75rem", // 60px
        "7xl": "4.5rem",  // 72px
    },

    weights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
    },

    lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
        loose: 2,
    }
};

export const spacing = {
    // Base spacing scale (4px increments)
    "0": "0",
    "1": "0.25rem",  // 4px
    "2": "0.5rem",   // 8px
    "3": "0.75rem",  // 12px
    "4": "1rem",     // 16px
    "5": "1.25rem",  // 20px
    "6": "1.5rem",   // 24px
    "8": "2rem",     // 32px
    "10": "2.5rem",  // 40px
    "12": "3rem",    // 48px
    "16": "4rem",    // 64px
    "20": "5rem",    // 80px
    "24": "6rem",    // 96px
    "32": "8rem",    // 128px
};

export const shadows = {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    glow: "0 0 20px rgba(139, 92, 246, 0.5)",
    glowLarge: "0 0 40px rgba(139, 92, 246, 0.6)",
};

export const borderRadius = {
    none: "0",
    sm: "0.125rem",   // 2px
    base: "0.25rem",  // 4px
    md: "0.375rem",   // 6px
    lg: "0.5rem",     // 8px
    xl: "0.75rem",    // 12px
    "2xl": "1rem",    // 16px
    "3xl": "1.5rem",  // 24px
    full: "9999px",
};

export const breakpoints = {
    sm: "640px",   // Mobile
    md: "768px",   // Tablet
    lg: "1024px",  // Desktop
    xl: "1280px",  // Large Desktop
    "2xl": "1536px", // Extra Large
};

export const zIndex = {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
};

// Glassmorphism effect
export const glassmorphism = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
};

// Neumorphism effect
export const neumorphism = {
    light: {
        boxShadow: "8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.9)",
    },
    dark: {
        boxShadow: "8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.05)",
    }
};
