import { useParams } from "wouter";
import { Header, Footer } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Sparkles, Zap, Target, BarChart3, Settings, Users } from "lucide-react";
import { moduleData } from "@/lib/moduleData";
import { useEffect } from "react";

export default function ModuleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const module = moduleData[slug || ""];

  useEffect(() => {
    if (module) {
      document.title = `${module.name} | NexusAIFirst Enterprise Platform`;
    }
  }, [module]);

  if (!module) {
    return (
      <div className="public-page min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4">Module Not Found</h1>
            <p style={{ color: `hsl(var(--muted-foreground))` }} className="mb-6">
              The module you're looking for doesn't exist.
            </p>
            <Button onClick={() => window.location.href = "/"}>Back to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const featureIcons = [Zap, Target, BarChart3, Settings, Users, CheckCircle];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="public-hero px-4 py-24 max-w-7xl mx-auto">
          <div className="mb-6">
            <Badge className="public-badge">{module.name}</Badge>
          </div>
          <h1 className="public-hero-title text-6xl font-bold mb-6">{module.tagline}</h1>
          <p className="public-hero-subtitle text-2xl mb-8 max-w-4xl leading-relaxed">
            {module.description}
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white" data-testid={`button-module-cta-${slug}`}>
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" data-testid={`button-module-demo-${slug}`}>
              Request Demo
            </Button>
          </div>
        </section>

        {/* Core Features */}
        <section className="public-section-alt px-4 py-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 text-center">Core Features</h2>
            <p style={{ color: `hsl(var(--muted-foreground))` }} className="text-center mb-12 max-w-2xl mx-auto">
              Comprehensive capabilities designed to streamline your operations
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {module.features.map((feature, i) => {
                const IconComponent = featureIcons[i % featureIcons.length];
                return (
                  <Card key={i} className="public-card p-6" data-testid={`card-feature-${i}`}>
                    <div className="flex items-start gap-4">
                      <IconComponent className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: `hsl(var(--primary))` }} />
                      <div>
                        <h3 className="font-bold mb-2">{feature}</h3>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* AI-Powered Features */}
        <section className="public-section px-4 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8" style={{ color: `hsl(var(--primary))` }} />
              <h2 className="text-4xl font-bold">AI-Powered Intelligence</h2>
            </div>
            <p style={{ color: `hsl(var(--muted-foreground))` }} className="mb-12 max-w-2xl">
              Harness the power of artificial intelligence to automate complex processes, gain predictive insights, and make data-driven decisions faster
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {module.aiFeatures.map((feature, i) => (
                <Card key={i} className="public-card p-6 border-l-4 public-accent-border" data-testid={`card-ai-feature-${i}`}>
                  <div className="flex items-start gap-4">
                    <Sparkles className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: `hsl(var(--primary))` }} />
                    <div>
                      <h3 className="font-bold">{feature}</h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Business Benefits */}
        <section className="public-section-alt px-4 py-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">Business Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {module.businessBenefits?.map((benefit, i) => (
                <div key={i} className="public-card p-6 rounded-lg" data-testid={`card-benefit-${i}`}>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: `hsl(var(--primary))` }} />
                    <p className="font-semibold">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries */}
        {module.industries && (
          <section className="public-section px-4 py-20">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold mb-12 text-center">Optimized For Industries</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {module.industries.map((industry, i) => (
                  <Card key={i} className="public-card p-4 text-center" data-testid={`card-industry-${i}`}>
                    <p className="font-semibold text-sm">{industry}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="public-section-alt px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your {module.name}?</h2>
            <p style={{ color: `hsl(var(--muted-foreground))` }} className="text-lg mb-8">
              Join leading enterprises using NexusAIFirst to streamline operations and drive growth
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white" data-testid={`button-module-start-${slug}`}>
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" data-testid={`button-module-contact-${slug}`}>
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
