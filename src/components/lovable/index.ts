// Lovable Design System - Component Library Index
// Export all Lovable components for easy imports

// Core Components
export { GlassmorphismCard, GradientCard, AnimatedCard } from './Cards';
export { PremiumHero, SplitHero } from './Hero';
export { PrimaryCTA, SecondaryCTA, CTASection } from './CTA';
export { FeatureGrid, StatsCounter, Testimonial, CodeBlock } from './Content';

// Utilities
export { animations, hoverAnimations, scrollAnimations, pageTransitions, cssAnimations } from '../../lib/animations';
export { colors, typography, spacing, shadows, borderRadius, breakpoints, zIndex, glassmorphism, neumorphism } from '../../lib/design-tokens';

// Usage Example:
/*
import { 
  PremiumHero, 
  GlassmorphismCard, 
  PrimaryCTA,
  FeatureGrid 
} from '@/components/lovable';

function MyPage() {
  return (
    <>
      <PremiumHero 
        title="Welcome to NexusAI"
        subtitle="Enterprise-grade ERP for modern businesses"
        primary CTA={{ label: "Get Started", onClick: () => {} }}
       />
      
      <FeatureGrid 
        features={[
          { icon: <Icon />, title: "Feature 1", description: "..." }
        ]}
      />
    </>
  );
}
*/
