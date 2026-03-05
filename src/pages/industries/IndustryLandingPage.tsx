import { useParams, Redirect, Link, useLocation } from "wouter";
import { industries } from "@/data/industries";
import { PremiumHero, GlassmorphismCard, FeatureGrid, CTASection, StatsCounter } from "@/components/lovable";
import { Header, Footer } from "@/components/Navigation";
import { motion } from "framer-motion";
import { animations } from "@/lib/animations";
import { Button } from "@/components/ui/button";

export default function IndustryLandingPage() {
    const { slug } = useParams<{ slug: string }>();
    const [, setLocation] = useLocation();
    const industry = industries[slug || ""];

    if (!industry) {
        return <Redirect to="/404" />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <PremiumHero
                    title={industry.hero.title}
                    subtitle={industry.hero.subtitle}
                    gradient={industry.hero.gradient}
                    primaryCTA={
                        <Button size="lg" className="shadow-lg shadow-primary/25">
                            Start for Free
                        </Button>
                    }
                    secondaryCTA={
                        <Button size="lg" variant="outline" className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/20">
                            Request Demo
                        </Button>
                    }
                />

                {/* Stats Section */}
                <section className="py-12 bg-muted/30 border-y border-border/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <StatsCounter stats={industry.stats} />
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-24 px-4">
                    <div className="max-w-7xl mx-auto">
                        <motion.div className="text-center mb-16" {...animations.fadeInUp}>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Tailored for {industry.name}
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Specific modules and features designed to solve your industry's unique challenges.
                            </p>
                        </motion.div>

                        <FeatureGrid features={industry.features} columns={3} />
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 px-4 bg-muted/50">
                    <div className="max-w-7xl mx-auto">
                        <motion.div className="text-center mb-16" {...animations.fadeInUp}>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Why Choose NexusAI?
                            </h2>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {industry.benefits.map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <GlassmorphismCard className="h-full">
                                        <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                                        <p className="text-muted-foreground">{benefit.description}</p>
                                    </GlassmorphismCard>
                                </motion.div>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Link to="/features">
                                <Button variant="link" className="text-primary text-lg">
                                    Explore All Features &rarr;
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <CTASection
                    title={`Ready to transform your ${industry.name} business?`}
                    subtitle="Join thousands of organizations using NexusAI today."
                    primaryCTA={{
                        label: "Get Started Now",
                        onClick: () => { setLocation("/signup"); }
                    }}
                />
            </main>

            <Footer />
        </div>
    );
}
