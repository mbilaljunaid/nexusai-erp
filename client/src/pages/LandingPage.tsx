import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Zap, Lock, TrendingUp, Users, Gauge, Sparkles, ChevronRight } from "lucide-react";
import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    document.title = "NexusAI - Enterprise Platform for Every Business";
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--primary)/0.1)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[hsl(var(--primary)/0.05)] rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[hsl(var(--background)/0.8)] backdrop-blur-md border-b border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-[hsl(var(--primary))]" data-testid="link-logo-landing">
            NexusAI
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" data-testid="button-nav-dashboard">
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-[hsl(var(--primary))] hover:opacity-90 text-[hsl(var(--primary-foreground))]" data-testid="button-nav-start">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="space-y-8 text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)]">
            <p className="text-sm font-medium text-[hsl(var(--primary))]">Trusted by business leaders across 40+ industries</p>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold leading-tight">
            Enterprise Software That <span className="text-[hsl(var(--primary))]">Scales With You</span>
          </h1>

          <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed">
            Manage your entire business with 800+ pre-built applications. From CRM to ERP, HR to Finance—everything you need in one unified platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-[hsl(var(--primary))] hover:opacity-90 text-[hsl(var(--primary-foreground))] w-full sm:w-auto" data-testid="button-hero-start">
                Start Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-hero-learn">
              Learn More
            </Button>
          </div>

          <p className="text-sm text-[hsl(var(--muted-foreground))]">No credit card required. 30-day free trial.</p>
        </div>

        {/* Dashboard Preview Placeholder */}
        <div className="mt-20 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 md:p-12">
          <div className="aspect-video bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--secondary))] rounded-lg flex items-center justify-center">
            <div className="text-center space-y-3">
              <Gauge className="w-12 h-12 mx-auto text-[hsl(var(--muted-foreground))]" />
              <p className="text-[hsl(var(--muted-foreground))] font-medium">Your dashboard preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Everything You Need To Grow</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-6 h-6 text-[hsl(var(--primary))]" />,
              title: "800+ Pre-Built Forms",
              description: "Ready-to-use applications for sales, finance, HR, operations, and more. No setup required."
            },
            {
              icon: <Users className="w-6 h-6 text-[hsl(var(--primary))]" />,
              title: "Unified Workspace",
              description: "All your business data in one place. Seamlessly collaborate across teams and departments."
            },
            {
              icon: <TrendingUp className="w-6 h-6 text-[hsl(var(--primary))]" />,
              title: "Real-Time Analytics",
              description: "Get instant insights with built-in dashboards and predictive analytics. Make data-driven decisions."
            },
            {
              icon: <Sparkles className="w-6 h-6 text-[hsl(var(--primary))]" />,
              title: "AI-Powered Automation",
              description: "Let AI handle repetitive tasks. Automate workflows across your entire organization."
            },
            {
              icon: <Lock className="w-6 h-6 text-[hsl(var(--primary))]" />,
              title: "Enterprise Security",
              description: "Bank-level encryption, role-based access, and compliance with SOC 2, ISO 27001, and GDPR."
            },
            {
              icon: <Gauge className="w-6 h-6 text-[hsl(var(--primary))]" />,
              title: "Lightning Fast",
              description: "Optimized for speed. Handles millions of transactions without breaking a sweat."
            }
          ].map((feature, i) => (
            <div 
              key={i} 
              className="group p-6 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.1)] transition-all bg-[hsl(var(--card))]"
              data-testid={`card-feature-${i}`}
            >
              <div className="mb-4 p-3 rounded-lg bg-[hsl(var(--primary)/0.1)] w-fit">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Industries Section */}
      <section className="bg-[hsl(var(--secondary)/0.3)] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Built For Every Industry</h2>
          <p className="text-center text-[hsl(var(--muted-foreground))] mb-16 max-w-2xl mx-auto">
            Whether you're in manufacturing, finance, healthcare, or retail—NexusAI has industry-specific solutions ready to deploy.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["Manufacturing", "Finance", "Healthcare", "Retail", "Logistics", "Technology", "Education", "Government", "Automotive", "Telecom", "Energy", "Real Estate"].map((industry, i) => (
              <div 
                key={i} 
                className="p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-center hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md transition-all cursor-pointer"
                data-testid={`industry-card-${industry.toLowerCase()}`}
              >
                <p className="font-medium text-sm">{industry}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { number: "809", label: "Pre-Built Apps" },
            { number: "40+", label: "Industries Covered" },
            { number: "1M+", label: "Transactions/Day" },
            { number: "99.9%", label: "Uptime SLA" }
          ].map((stat, i) => (
            <div key={i} className="text-center" data-testid={`stat-${i}`}>
              <p className="text-4xl md:text-5xl font-bold text-[hsl(var(--primary))] mb-2">
                {stat.number}
              </p>
              <p className="text-[hsl(var(--muted-foreground))]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules Section */}
      <section className="bg-[hsl(var(--secondary)/0.3)] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Core Modules</h2>
          <p className="text-center text-[hsl(var(--muted-foreground))] mb-16 max-w-2xl mx-auto">
            All the modules you need to run your business, integrated into one powerful platform.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "CRM & Sales", pages: "85" },
              { name: "ERP & Finance", pages: "120" },
              { name: "HR & Talent", pages: "95" },
              { name: "Projects & Portfolio", pages: "60" },
              { name: "Service & Support", pages: "70" },
              { name: "Analytics & BI", pages: "50" }
            ].map((module, i) => (
              <div 
                key={i}
                className="p-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md transition-all cursor-pointer group"
                data-testid={`module-${module.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{module.name}</h3>
                  <ChevronRight className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors" />
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">{module.pages} pre-built forms</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-[hsl(var(--primary))] rounded-2xl p-12 md:p-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--primary-foreground))] mb-4">Ready to Transform Your Business?</h2>
          <p className="text-[hsl(var(--primary-foreground)/0.9)] mb-8 text-lg max-w-2xl mx-auto">
            Get started with NexusAI today. No credit card required. Full access to all 800+ applications.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))] hover:bg-opacity-90" data-testid="button-cta-start">
              Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] py-12 bg-[hsl(var(--secondary)/0.2)]">
        <div className="max-w-7xl mx-auto px-6 text-center text-[hsl(var(--muted-foreground))] text-sm">
          <p>&copy; 2025 NexusAI. Built for business users. Trusted by enterprises worldwide.</p>
        </div>
      </footer>
    </div>
  );
}
