import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { animations } from '@/lib/animations';

interface FeatureGridProps {
    features: Array<{
        icon: React.ReactNode;
        title: string;
        description: string;
        link?: string;
    }>;
    columns?: 2 | 3 | 4;
}

export function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {
    const gridCols = {
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    };

    return (
        <div className={cn("grid gap-8", gridCols[columns])}>
            {(features || []).map((feature, index) => (
                <motion.div
                    key={index}
                    className="flex flex-col items-start p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
                    {...animations.fadeInUp}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        {feature.icon}
                    </div>

                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>

                    <p className="text-muted-foreground mb-4 flex-1">{feature.description}</p>

                    {feature.link && (
                        <a
                            href={feature.link}
                            className="text-primary hover:underline font-medium flex items-center gap-1"
                        >
                            Learn more →
                        </a>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

interface StatsCounterProps {
    stats: Array<{
        value: string | number;
        label: string;
        suffix?: string;
    }>;
}

export function StatsCounter({ stats }: StatsCounterProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    className="text-center"
                    {...animations.zoomIn}
                    transition={{ delay: index * 0.1 }}
                >
                    <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                        {stat.value}{stat.suffix}
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">
                        {stat.label}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

interface TestimonialProps {
    quote: string;
    author: string;
    role: string;
    company?: string;
    avatar?: string;
}

export function Testimonial({ quote, author, role, company, avatar }: TestimonialProps) {
    return (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border">
            <p className="text-lg mb-6 italic">"{quote}"</p>

            <div className="flex items-center gap-4">
                {avatar && (
                    <img
                        src={avatar}
                        alt={author}
                        className="w-12 h-12 rounded-full"
                    />
                )}

                <div>
                    <div className="font-semibold">{author}</div>
                    <div className="text-sm text-muted-foreground">
                        {role}{company && ` at ${company}`}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface CodeBlockProps {
    code: string;
    language?: string;
    title?: string;
}

export function CodeBlock({ code, language = 'typescript', title }: CodeBlockProps) {
    return (
        <div className="rounded-xl overflow-hidden border bg-slate-950">
            {title && (
                <div className="px-6 py-3 border-b border-slate-800 bg-slate-900 text-sm font-medium text-slate-200">
                    {title}
                </div>
            )}

            <pre className="p-6 overflow-x-auto">
                <code className={`language-${language} text-sm text-slate-100`}>
                    {code}
                </code>
            </pre>
        </div>
    );
}
