import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/Navigation';
import {
    PremiumHero,
    GlassmorphismCard,
    FeatureGrid,
    CTASection
} from '@/components/lovable';
import { animations } from '@/lib/animations';

export interface IndustryModule {
    name: string;
    slug: string;
    description: string;
    icon?: React.ReactNode;
}

export interface IndustryPageProps {
    // Basic Info
    name: string;
    slug: string;
    tagline: string;
    description: string;

    // Hero
    heroImage?: string;

    // Stats
    stats?: Array<{
        value: string;
        label: string;
    }>;

    // Relevant Modules
    modules: IndustryModule[];

    // Industry-Specific Features
    features: Array<{
        title: string;
        description: string;
        icon: React.ReactNode;
    }>;

    // Compliance & Regulations
    compliance?: string[];

    // Success Stories
    successStories?: Array<{
        company: string;
        quote: string;
        result: string;
    }>;

    // Use Cases
    useCases?: Array<{
        title: string;
        description: string;
    }>;
}

export function IndustryPageTemplate({
    name,
    slug,
    tagline,
    description,
    heroImage,
    stats,
    modules,
    features,
    compliance,
    successStories,
    useCases
}: IndustryPageProps) {
    React.useEffect(() => {
        document.title = `${name} ERP Solutions | NexusAI`;
    }, [name]);
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <PremiumHero
                    title={`${name} ERP Solutions`}
                    subtitle={tagline}
                    gradient="secondary"
                    backgroundImage={heroImage}
                    primaryCTA={{
                        label: "Request Demo",
                        onClick: () => setLocation('/contact')
                    }}
                    secondaryCTA={{
                        label: "View Modules",
                        onClick: () => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                >
                    <Badge className="bg-card/20 text-white border-white/30 text-sm px-4 py-2">
                        Industry Solution
                    </Badge>
                </PremiumHero>

                {/* Overview */}
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto">
                        <motion.div {...animations.fadeInUp}>
                            <h2 className="text-3xl font-bold mb-6">Overview</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {description}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Stats (if provided) */}
                {stats && stats.length > 0 && (
                    <section className="py-12 px-4 bg-muted/30">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="text-center"
                                        {...animations.zoomIn}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="text-4xl font-bold text-primary mb-2">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {stat.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Relevant Modules */}
                <section id="modules" className="py-20 px-4">
                    <div className="max-w-7xl mx-auto">
                        <motion.div className="text-center mb-12" {...animations.fadeInUp}>
                            <Badge className="mb-4">Tailored Solutions</Badge>
                            <h2 className="text-4xl font-bold mb-4">
                                Modules for {name}
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                                Pre-configured modules designed specifically for your industry
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {modules.map((module, index) => (
                                <Link key={index} to={`/modules/${module.slug}`}>
                                    <motion.div
                                        {...animations.fadeInUp}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <GlassmorphismCard className="p-6 cursor-pointer h-full">
                                            {module.icon && (
                                                <div className="mb-4">{module.icon}</div>
                                            )}
                                            <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
                                            <p className="text-muted-foreground text-sm mb-4">
                                                {module.description}
                                            </p>
                                            <span className="text-primary text-sm font-medium flex items-center gap-1">
                                                Learn more <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </GlassmorphismCard>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Industry-Specific Features */}
                <section className="py-20 px-4 bg-muted/30">
                    <div className="max-w-7xl mx-auto">
                        <motion.div className="text-center mb-12" {...animations.fadeInUp}>
                            <Badge className="mb-4">Key Capabilities</Badge>
                            <h2 className="text-4xl font-bold mb-4">
                                Built for {name} Challenges
                            </h2>
                        </motion.div>

                        <FeatureGrid features={features} columns={3} />
                    </div>
                </section>

                {/* Compliance (if provided) */}
                {compliance && compliance.length > 0 && (
                    <section className="py-20 px-4">
                        <div className="max-w-7xl mx-auto">
                            <motion.div className="text-center mb-12" {...animations.fadeInUp}>
                                <Badge className="mb-4 bg-green-600 text-white">Compliance Ready</Badge>
                                <h2 className="text-4xl font-bold mb-4">
                                    Regulatory Compliance
                                </h2>
                                <p className="text-xl text-muted-foreground">
                                    Built-in support for industry standards and regulations
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                                {compliance.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-center gap-3 p-4 rounded-lg border bg-card"
                                        {...animations.fadeInUp}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <span className="font-medium">{item}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Use Cases (if provided) */}
                {useCases && useCases.length > 0 && (
                    <section className="py-20 px-4 bg-muted/30">
                        <div className="max-w-7xl mx-auto">
                            <motion.div className="text-center mb-12" {...animations.fadeInUp}>
                                <Badge className="mb-4">Real-World Applications</Badge>
                                <h2 className="text-4xl font-bold mb-4">
                                    Common Use Cases
                                </h2>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {useCases.map((useCase, index) => (
                                    <motion.div
                                        key={index}
                                        className="p-6 rounded-xl border bg-card"
                                        {...animations.fadeInUp}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                                        <p className="text-muted-foreground">{useCase.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Success Stories (if provided) */}
                {successStories && successStories.length > 0 && (
                    <section className="py-20 px-4">
                        <div className="max-w-7xl mx-auto">
                            <motion.div className="text-center mb-12" {...animations.fadeInUp}>
                                <Badge className="mb-4 bg-purple-600 text-white">Customer Success</Badge>
                                <h2 className="text-4xl font-bold mb-4">
                                    Proven Results
                                </h2>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {successStories.map((story, index) => (
                                    <motion.div
                                        key={index}
                                        className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border"
                                        {...animations.fadeInUp}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <p className="text-lg mb-4 italic">"{story.quote}"</p>
                                        <div className="font-semibold text-primary mb-2">{story.company}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Result: {story.result}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA Section */}
                <CTASection
                    title={`Ready to Transform ${name}?`}
                    subtitle="See how NexusAI can streamline your operations and drive growth"
                    primaryCTA={{
                        label: "Schedule Demo",
                        onClick: () => setLocation('/contact')
                    }}
                    secondaryCTA={{
                        label: "Download Industry Brief",
                        onClick: () => window.location.href = `/resources/${slug}-brief.pdf`
                    }}
                    gradient={true}
                />
            </main>

            <Footer />
        </div>
    );
}
