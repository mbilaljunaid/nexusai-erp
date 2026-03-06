import React from'react';
import { motion} from'framer-motion';
import { Button} from'@/components/ui/button';
import { ArrowRight} from'lucide-react';
import { cn} from'@/lib/utils';
import { colors} from'@/lib/design-tokens';
import { animations, hoverAnimations} from'@/lib/animations';

interface PrimaryCTAProps {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    gradient?:'primary' |'secondary' |'accent';
    size?:'md' |'lg' |'xl';
}

export function PrimaryCTA({
    label,
    onClick,
    icon,
    gradient ='primary',
    size ='lg'
}: PrimaryCTAProps) {
    const gradients = {
        primary: colors.gradients.primary,
        secondary: colors.gradients.secondary,
        accent: colors.gradients.accent,
   };

    const sizes = {
        md:"px-6 py-3 text-base",
        lg:"px-8 py-4 text-lg",
        xl:"px-12 py-5 text-xl"
   };

    return (
        <motion.button
            onClick={onClick}
            className={cn(
               "relative overflow-hidden rounded-full font-semibold text-white",
               "transition-all duration-300 shadow-lg hover:shadow-2xl",
                sizes[size]
            )}
            style={{ background: gradients[gradient]}}
            {...hoverAnimations.hoverLift}
        >
            <span className="relative flex items-center gap-2">
                {label}
                {icon || <ArrowRight className="w-5 h-5" />}
            </span>

            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </motion.button>
    );
}

interface SecondaryCTAProps {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
}

export function SecondaryCTA({ label, onClick, icon}: SecondaryCTAProps) {
    return (
        <Button
            variant="outline"
            size="lg"
            onClick={onClick}
            className="border-2 hover:bg-primary/5 text-lg px-8"
        >
            {label}
            {icon && <span className="ml-2">{icon}</span>}
        </Button>
    );
}

interface CTASectionProps {
    title: string;
    subtitle?: string;
    primaryCTA?: {
        label: string;
        onClick: () => void;
   };
    secondaryCTA?: {
        label: string;
        onClick: () => void;
   };
    gradient?: boolean;
}

export function CTASection({
    title,
    subtitle,
    primaryCTA,
    secondaryCTA,
    gradient = true
}: CTASectionProps) {
    return (
        <section
            className={cn(
               "py-20 px-4",
                gradient &&"relative overflow-hidden"
            )}
            style={gradient ? { background: colors.gradients.primary} : undefined}
        >
            {/* Particle effects for gradient background */}
            {gradient && (
                <div className="absolute inset-0">
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3 bg-white/20 rounded-full"
                            style={{
                                left:`${Math.random() * 100}%`,
                                top:`${Math.random() * 100}%`,
                           }}
                            animate={{
                                y: [0, -20, 0],
                                opacity: [0.2, 0.6, 0.2],
                                scale: [1, 1.2, 1],
                           }}
                            transition={{
                                duration: 4 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                           }}
                        />
                    ))}
                </div>
            )}

            <div className={cn(
               "max-w-4xl mx-auto text-center relative",
                gradient &&"text-white"
            )}>
                <motion.h2
                    className="text-4xl md:text-5xl font-bold mb-4"
                    {...animations.fadeInUp}
                >
                    {title}
                </motion.h2>

                {subtitle && (
                    <motion.p
                        className={cn(
                           "text-xl mb-8",
                            gradient ?"text-white/90" :"text-muted-foreground"
                        )}
                        {...animations.fadeInUp}
                        transition={{ delay: 0.2}}
                    >
                        {subtitle}
                    </motion.p>
                )}

                <motion.div
                    className="flex gap-4 justify-center flex-wrap"
                    {...animations.fadeInUp}
                    transition={{ delay: 0.4}}
                >
                    {primaryCTA && (
                        <PrimaryCTA
                            label={primaryCTA.label}
                            onClick={primaryCTA.onClick}
                            gradient={gradient ?'primary' :'accent'}
                        />
                    )}
                    {secondaryCTA && (
                        <Button
                            variant={gradient ?"outline" :"default"}
                            size="lg"
                            onClick={secondaryCTA.onClick}
                            className={cn(
                               "text-lg px-8",
                                gradient &&"border-white text-white hover:bg-white/10"
                            )}
                        >
                            {secondaryCTA.label}
                        </Button>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
