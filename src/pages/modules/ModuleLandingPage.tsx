import { useParams, Redirect, Link } from "wouter";
import { modules } from "@/data/modules";
import { PremiumHero, GlassmorphismCard, FeatureGrid, CTASection } from "@/components/lovable"; // StatsCounter removed if not in data yet
import { Header, Footer } from "@/components/Navigation";
import { motion } from "framer-motion";
import { animations } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function ModuleLandingPage() {
    const { slug } = useParams<{ slug: string }>();
    const moduleData = modules[slug || ""];

    if (!moduleData) {
        return <Redirect to="/404" />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <PremiumHero
                    title={moduleData.title}
                    subtitle={moduleData.description}
                    gradient={moduleData.heroGradient}
                    primaryCTA={
                        <Link to="/demo">
                            <Button size="lg" className="shadow-lg shadow-primary/25">
                                Request Demo
                            </Button>
                        </Link>
                    }
                    secondaryCTA={
                        <Link to="/contact">
                            <Button size="lg" variant="outline" className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/20">
                                Contact Sales
                            </Button>
                        </Link>
                    }
                />

                {/* Features Grid */}
                <section className="py-24 px-4">
                    <div className="max-w-7xl mx-auto">
                        <motion.div className="text-center mb-16" {...animations.fadeInUp}>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Key Capabilities
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Comprehensive features designed to streamline your {moduleData.category} operations.
                            </p>
                        </motion.div>

                        <FeatureGrid features={moduleData.features} columns={3} />
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 px-4 bg-muted/50">
                    <div className="max-w-7xl mx-auto">
                        <motion.div className="text-center mb-16" {...animations.fadeInUp}>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Business Value
                            </h2>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {moduleData.benefits.map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <GlassmorphismCard className="h-full flex flex-col justify-center p-8">
                                        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                            <ChevronRight className="w-5 h-5 text-primary" />
                                            {benefit.title}
                                        </h3>
                                        <p className="text-muted-foreground pl-7">{benefit.description}</p>
                                    </GlassmorphismCard>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <CTASection
                    title={`Ready to optimize your ${moduleData.title}?`}
                    subtitle="Join thousands of organizations using NexusAI."
                    primaryCTA={{
                        label: "Get Started",
                        onClick: () => { window.location.href = "/signup"; }
                    }}
                />
            </main>

            <Footer />
        </div>
    );
}
