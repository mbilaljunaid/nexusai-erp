import React from'react';
import { motion} from'framer-motion';
import { cn} from'@/lib/utils';
import { colors, glassmorphism} from'@/lib/design-tokens';
import { animations, hoverAnimations} from'@/lib/animations';

interface GlassmorphismCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    gradient?:'primary' |'secondary' |'accent';
}

export function GlassmorphismCard({
    children,
    className,
    hover = true,
    gradient ='primary'
}: GlassmorphismCardProps) {
    const gradientColors = {
        primary: colors.gradients.primary,
        secondary: colors.gradients.secondary,
        accent: colors.gradients.accent,
   };

    return (
        <motion.div
            className={cn(
               "relative rounded-2xl p-6 overflow-hidden",
                hover &&"cursor-pointer",
                className
            )}
            style={{
                background: glassmorphism.background,
                backdropFilter: glassmorphism.backdropFilter,
                border: glassmorphism.border,
                boxShadow: glassmorphism.boxShadow,
           }}
            {...(hover ? hoverAnimations.hoverLift : {})}
            {...animations.fadeInUp}
        >
            {/* Gradient overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{ background: gradientColors[gradient]}}
            />

            {children}
        </motion.div>
    );
}

interface GradientCardProps {
    children: React.ReactNode;
    className?: string;
    variant?:'primary' |'secondary' |'accent' |'dark';
    hover?: boolean;
}

export function GradientCard({
    children,
    className,
    variant ='primary',
    hover = true
}: GradientCardProps) {
    const gradients = {
        primary: colors.gradients.primary,
        secondary: colors.gradients.secondary,
        accent: colors.gradients.accent,
        dark: colors.gradients.dark,
   };

    return (
        <motion.div
            className={cn(
               "relative rounded-2xl p-6 text-white overflow-hidden",
                hover &&"cursor-pointer",
                className
            )}
            style={{
                background: gradients[variant],
           }}
            {...(hover ? hoverAnimations.hoverLift : {})}
            {...animations.zoomIn}
        >
            {children}
        </motion.div>
    );
}

interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export function AnimatedCard({ children, className, delay = 0}: AnimatedCardProps) {
    return (
        <motion.div
            className={cn(
               "rounded-xl border bg-card p-6 shadow-lg transition-all hover:shadow-xl",
                className
            )}
            initial={{ opacity: 0, y: 20}}
            animate={{ opacity: 1, y: 0}}
            transition={{ duration: 0.5, delay}}
            whileHover={{ y: -5, transition: { duration: 0.2}}}
        >
            {children}
        </motion.div>
    );
}
