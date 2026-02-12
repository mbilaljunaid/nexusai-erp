import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { colors } from '@/lib/design-tokens';
import { animations } from '@/lib/animations';

interface PremiumHeroProps {
    title: string;
    subtitle: string;
    primaryCTA?: {
        label: string;
        onClick: () => void;
    };
    secondaryCTA?: {
        label: string;
        onClick: () => void;
    };
    gradient?: 'primary' | 'secondary' | 'accent';
    backgroundImage?: string;
    children?: React.ReactNode;
}

export function PremiumHero({
    title,
    subtitle,
    primaryCTA,
    secondaryCTA,
    gradient = 'primary',
    backgroundImage,
    children
}: PremiumHeroProps) {
    const gradients = {
        primary: colors.gradients.primary,
        secondary: colors.gradients.secondary,
        accent: colors.gradients.accent,
    };

    return (
        <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Gradient Background */}
            <div
                className="absolute inset-0 -z-10"
                style={{ background: gradients[gradient] }}
            />

            {/* Optional Background Image */}
            {backgroundImage && (
                <div
                    className="absolute inset-0 opacity-20 -z-5"
                    style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
            )}

            {/* Animated Particles */}
            <div className="absolute inset-0 -z-5">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white">
                <motion.h1
                    className="text-6xl md:text-7xl font-bold mb-6"
                    {...animations.fadeInUp}
                >
                    {title}
                </motion.h1>

                <motion.p
                    className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto"
                    {...animations.fadeInUp}
                    transition={{ delay: 0.2 }}
                >
                    {subtitle}
                </motion.p>

                {(primaryCTA || secondaryCTA) && (
                    <motion.div
                        className="flex gap-4 justify-center flex-wrap"
                        {...animations.fadeInUp}
                        transition={{ delay: 0.4 }}
                    >
                        {primaryCTA && (
                            <Button
                                size="lg"
                                onClick={primaryCTA.onClick}
                                className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8"
                            >
                                {primaryCTA.label}
                            </Button>
                        )}
                        {secondaryCTA && (
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={secondaryCTA.onClick}
                                className="border-white text-white hover:bg-white/10 text-lg px-8"
                            >
                                {secondaryCTA.label}
                            </Button>
                        )}
                    </motion.div>
                )}

                {children && (
                    <motion.div
                        className="mt-12"
                        {...animations.fadeInUp}
                        transition={{ delay: 0.6 }}
                    >
                        {children}
                    </motion.div>
                )}
            </div>
        </section>
    );
}

interface SplitHeroProps {
    title: string;
    subtitle: string;
    features: string[];
    image: string;
    imageAlt: string;
    primaryCTA?: {
        label: string;
        onClick: () => void;
    };
    reversed?: boolean;
}

export function SplitHero({
    title,
    subtitle,
    features,
    image,
    imageAlt,
    primaryCTA,
    reversed = false
}: SplitHeroProps) {
    const content = (
        <div className="flex-1 py-12">
            <motion.h1
                className="text-5xl font-bold mb-4"
                {...animations.fadeInUp}
            >
                {title}
            </motion.h1>

            <motion.p
                className="text-xl text-muted-foreground mb-8"
                {...animations.fadeInUp}
                transition={{ delay: 0.2 }}
            >
                {subtitle}
            </motion.p>

            <motion.ul
                className="space-y-3 mb-8"
                {...animations.staggerContainer}
            >
                {features.map((feature, i) => (
                    <motion.li
                        key={i}
                        className="flex items-center gap-2"
                        {...animations.staggerItem}
                    >
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                        </div>
                        <span>{feature}</span>
                    </motion.li>
                ))}
            </motion.ul>

            {primaryCTA && (
                <Button size="lg" onClick={primaryCTA.onClick} className="text-lg px-8">
                    {primaryCTA.label}
                </Button>
            )}
        </div>
    );

    const visual = (
        <div className="flex-1 py-12">
            <motion.img
                src={image}
                alt={imageAlt}
                className="w-full rounded-2xl shadow-2xl"
                {...animations.zoomIn}
                transition={{ delay: 0.3 }}
            />
        </div>
    );

    return (
        <section className="py-20 px-4">
            <div className={cn(
                "max-w-7xl mx-auto flex flex-col gap-12",
                "lg:flex-row lg:items-center",
                reversed && "lg:flex-row-reverse"
            )}>
                {content}
                {visual}
            </div>
        </section>
    );
}
