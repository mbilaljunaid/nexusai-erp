import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { ArrowRight, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/Navigation';
import {
    PremiumHero,
    GlassmorphismCard,
    GradientCard,
    FeatureGrid,
    CTASection,
    StatsCounter
} from '@/components/lovable';
import { animations } from '@/lib/animations';

export interface ModuleFeature {
    title: string;
    description: string;
    icon: React.ReactNode;
}

export interface ModulePageProps {
    // Basic Info
    name: string;
    slug: string;
    tagline: string;
    description: string;
    category: string; // Finance, HR, CRM, SCM, etc.

    // Hero
    heroImage?: string;

    // Key Features (6-8)
    features: ModuleFeature[];

    // Benefits (3-4 key value props)
    benefits?: Array<{
        title: string;
        description: string;
    }>;

    // Use Cases (3-4)
    useCases?: Array<{
        title: string;
        description: string;
    }>;

    // Integration Points
    integrations?: string[];

    // Relevant Industries
    industries?: Array<{
        name: string;
        slug: string;
    }>;

    // Related Modules
    relatedModules?: Array<{
        name: string;
        slug: string;
    }>;

    // Pricing (if applicable)
    pricing?: {
        model: string; // "Included", "Add-on", "Usage-based"
        description: string;
    };

    // Screenshots/Demo
    screenshots?: string[];

    // Customer Testimonials
    testimonials?: Array<{
        quote: string;
        author: string;
        company: string;
        role?: string;
    }>;
}

export function ModulePageTemplate({
    name,
    slug,
    tagline,
    description,
    category,
    heroImage,
    features,
    benefits,
    useCases,
    integrations,
    industries,
    relatedModules,
    pricing,
    screenshots,
    testimonials
}: ModulePageProps) {
    React.useEffect(() => {
        document.title = `${name} | NexusAI ERP`;
    }, [name]);
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <PremiumHero
                    title={name}
                    subtitle={tagline}
                    gradient="primary"
                    backgroundImage={heroImage}
                    primaryCTA={{
                        label: "Start Free Trial",
                        onClick: () => setLocation('/signup')
                    }}
                    secondaryCTA={{
                        label: "Schedule Demo",
                        onClick: () => setLocation('/contact')
                    }}
                >
                    <div className="flex gap-2 flex-wrap">
                        <Badge className="bg-white/20 text-white border-white/30">
                            {category}
                        </Badge>
                        {pricing && (
                            <Badge className="bg-green-600/20 text-green-200 border-green-400/30">
                                {pricing.model}
                            </Badge>
                        )}
                    </div>
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

                {/* Key Features */}
                <section className="py-20 px-4 bg-muted/30">
                    <div className="max-w-7xl mx-auto">
                        <motion.div className="text-center mb-12" {...animations.fadeInUp}>
                            <Badge className="mb-4">Key Capabilities</Badge>
                            <h2 className="text-4xl font-bold mb-4">
                                What {name} Can Do
                            </h2>
                        </motion.div>

                        <FeatureGrid features={features} columns={3} />
                    </div>
                </section>

                {/* Benefits (if provided) */}
                {benefits && benefits.length > 0 && (
                    <section className="py-20 px-4">
                        <div className="max-w-7xl mx-auto">
                            <motion.div className="text-center mb-12" {...animations.fadeInUp}>
                                <Badge className="mb-4 bg-purple-600 text-white">Value Delivered</Badge>
                                <h2 className="text-4xl font-bold mb-4">
                                    Why Choose {name}
                                </h2>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        {...animations.fadeInUp}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <GradientCard variant="primary" className="h-full p-8">
                                            <h3 className="text-2xl font-semibold mb-3 text-white">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-white/90">
                                                {benefit.description}
                                            </p>
                                        </GradientCard>
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

                {/* Integrations (if provided) */}
                {integrations && integrations.length > 0 && (
                    <section className="py-20 px-4">
                        <div className="max-w-7xl mx-auto">
                            <motion.div className="text-center mb-12" {...animations.fadeInUp}>
                                <Badge className="mb-4 bg-blue-600 text-white">Seamless Integration</Badge>
                                <h2 className="text-4xl font-bold mb-4">
                                    Works With Other Modules
                                </h2>
                            </motion.div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                                {integrations.map((integration, index) => (
                                    <motion.div
                                        key={index}
                                        className="p-4 rounded-lg border bg-card text-center font-medium"
                                        {...animations.fadeInUp}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        {integration}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Relevant Industries */}
                {industries && industries.length > 0 && (
                    <section className="py-20 px-4 bg-muted/30">
                        <div className="max-w-7xl mx-auto">
                            <motion.div className="text-center mb-12" {...animations.fadeInUp}>
                                <Badge className="mb-4">Industry Applications</Badge>
                                <h2 className="text-4xl font-bold mb-4">
                                    Perfect For These Industries
                                </h2>
                            </motion.div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {industries.map((industry, index) => (
                                    <Link key={index} to={`/industries/${industry.slug}`}>
                                        <motion.div
                                            className="p-6 rounded-xl border bg-card hover:border-primary transition-colors cursor-pointer"
                                            {...animations.fadeInUp}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <span className="font-semibold">{industry.name}</span>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Testimonials (if provided) */}
                {testimonials && testimonials.length > 0 && (
                    <section className="py-20 px-4">
                        <div className="max-w-7xl mx-auto">
                            <motion.div className="text-center mb-12" {...animations.fadeInUp}>
                                <Badge className="mb-4 bg-green-600 text-white">Customer Success</Badge>
                                <h2 className="text-4xl font-bold mb-4">
                                    What Customers Say
                                </h2>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {testimonials.map((testimonial, index) => (
                                    <motion.div
                                        key={index}
                                        {...animations.fadeInUp}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <GlassmorphismCard className="p-8 h-full">
                                            <p className="text-lg mb-4 italic">"{testimonial.quote}"</p>
                                            <div className="font-semibold">{testimonial.author}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {testimonial.role && `${testimonial.role}, `}{testimonial.company}
                                            </div>
                                        </GlassmorphismCard>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Related Modules */}
                {relatedModules && relatedModules.length > 0 && (
                    <section className="py-20 px-4 bg-muted/30">
                        <div className="max-w-7xl mx-auto">
                            <motion.div className="text-center mb-12" {...animations.fadeInUp}>
                                <Badge className="mb-4">Complementary Solutions</Badge>
                                <h2 className="text-4xl font-bold mb-4">
                                    Related Modules
                                </h2>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedModules.map((module, index) => (
                                    <Link key={index} to={`/modules/${module.slug}`}>
                                        <motion.div
                                            className="p-6 rounded-xl border bg-card hover:border-primary transition-colors cursor-pointer"
                                            {...animations.fadeInUp}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
                                            <span className="text-primary text-sm font-medium flex items-center gap-1">
                                                Learn more <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA Section */}
                <CTASection
                    title={`Ready to Get Started with ${name}?`}
                    subtitle="See how it can transform your operations"
                    primaryCTA={{
                        label: "Start Free Trial",
                        onClick: () => setLocation('/signup')
                    }}
                    secondaryCTA={{
                        label: "Download Product Sheet",
                        onClick: () => window.location.href = `/resources/${slug}-datasheet.pdf`
                    }}
                    gradient={true}
                />
            </main>

            <Footer />
        </div>
    );
}
