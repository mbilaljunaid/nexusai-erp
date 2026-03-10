// Lovable Design System - Animation Utilities
// Provides entrance, interaction, and background animations

export const animations = {
    // Entrance Animations
    fadeInUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" }
    },

    fadeInDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" }
    },

    slideInLeft: {
        initial: { opacity: 0, x: -30 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.6, ease: "easeOut" }
    },

    slideInRight: {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.6, ease: "easeOut" }
    },

    zoomIn: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, ease: "easeOut" }
    },

    rotateIn: {
        initial: { opacity: 0, rotate: -10 },
        animate: { opacity: 1, rotate: 0 },
        transition: { duration: 0.6, ease: "easeOut" }
    },

    // Staggered Children
    staggerContainer: {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    },

    staggerItem: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
    }
};

// Hover Animation Variants
export const hoverAnimations = {
    hoverLift: {
        whileHover: { y: -5, transition: { duration: 0.2 } },
        whileTap: { scale: 0.98 }
    },

    hoverScale: {
        whileHover: { scale: 1.05, transition: { duration: 0.2 } },
        whileTap: { scale: 0.95 }
    },

    hoverGlow: {
        whileHover: {
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
            transition: { duration: 0.3 }
        }
    }
};

// Scroll-triggered animations (use with Intersection Observer)
export const scrollAnimations = {
    revealOnScroll: {
        initial: { opacity: 0, y: 50 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

// Page transition animations
export const pageTransitions = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 }
    },

    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.4, ease: "easeInOut" }
    }
};

// CSS Animation Classes (for non-Framer Motion animations)
export const cssAnimations = `
  @keyframes gradient-shift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient-shift 8s ease infinite;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .animate-shimmer {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }
`;
