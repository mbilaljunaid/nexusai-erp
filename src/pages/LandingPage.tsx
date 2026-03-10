import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  Users,
  Package,
  TrendingUp,
  Star,
  GitFork,
  Github,
  Code2,
  Scale,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header, Footer } from "@/components/Navigation";
import {
  PremiumHero,
  GlassmorphismCard,
  GradientCard,
  CTASection,
  FeatureGrid,
  StatsCounter,
  Testimonial
} from "@/components/lovable";
import { colors } from "@/lib/design-tokens";
import { animations } from "@/lib/animations";
import { StandardPage } from "@/components/layout/StandardPage";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "NexusAI - Open Source AI-Powered ERP | AGPL-3.0 Licensed";
  }, []);

  const industries = [
    { name: "Healthcare", slug: "healthcare" },
    { name: "Retail", slug: "retail" },
    { name: "Telecom", slug: "telecom" },
    { name: "Hospitality", slug: "hospitality" },
    { name: "Banking", slug: "banking" },
    { name: "Automotive", slug: "automotive" },
    { name: "Insurance", slug: "insurance" },
    { name: "Government", slug: "government" },
    { name: "Education", slug: "education" },
    { name: "Energy & Utilities", slug: "energy" },
    { name: "Media & Entertainment", slug: "media" },
    { name: "Manufacturing", slug: "manufacturing" },
    { name: "Real Estate", slug: "real-estate" },
    { name: "Construction", slug: "construction" },
    { name: "Logistics", slug: "logistics" },
    { name: "SaaS", slug: "saas" },
    { name: "E-commerce", slug: "ecommerce" },
    { name: "Financial Services", slug: "financial-services" },
  ];

  const testimonials = [
    {
      quote: "NexusAI has completely transformed how we manage our multi-national supply chain. The open source nature allowed us to customize it perfectly to our needs.",
      author: "Sarah Chen",
      role: "CTO",
      company: "Global Logistics Corp",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    },
    {
      quote: "Finally, an ERP that doesn't cost a fortune and actually looks good. The user experience is lightyears ahead of SAP or Oracle.",
      author: "Marcus Johnson",
      role: "Operations Director",
      company: "TechFlow Manufacturing",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    },
    {
      quote: "We scaled from 50 to 500 employees using NexusAI. The HR and Payroll modules are incredibly robust and compliant.",
      author: "Elena Rodriguez",
      role: "VP of HR",
      company: "Innovate Health",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    }
  ];

  const moduleCategories = [
    {
      title: "Finance & Accounting",
      description: "GL, AP, AR, Cash Management, Tax, and Fixed Assets.",
      icon: <TrendingUp className="w-8 h-8 text-green-500" />,
      color: "bg-green-500/10"
    },
    {
      title: "HR & Payroll",
      description: "Core HR, Recruitment, Performance, and Global Payroll.",
      icon: <Users className="w-8 h-8 text-purple-500" />,
      color: "bg-purple-500/10"
    },
    {
      title: "CRM & Sales",
      description: "Lead Management, Opportunity Pipeline, and CPQ.",
      icon: <Globe className="w-8 h-8 text-blue-500" />,
      color: "bg-blue-500/10"
    },
    {
      title: "Supply Chain",
      description: "Inventory, Procurement, Manufacturing, and Logistics.",
      icon: <Package className="w-8 h-8 text-orange-500" />,
      color: "bg-orange-500/10"
    }
  ];

  const coreFeatures = [
    {
      icon: <Package className="w-6 h-6 text-primary" />,
      title: "85 Enterprise Modules",
      description: "Finance, HR, CRM, SCM, and specialized industry modules all in one platform"
    },
    {
      icon: <Globe className="w-6 h-6 text-primary" />,
      title: "18 Industry Solutions",
      description: "Pre-configured solutions for healthcare, manufacturing, SaaS, and more"
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "AI-Powered Automation",
      description: "Natural language processing, automated workflows, and intelligent insights"
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Enterprise Security",
      description: "RBAC, audit trails, data encryption, and SOX/GDPR compliance"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-primary" />,
      title: "Real-Time Analytics",
      description: "Smart dashboards, custom reports, and predictive forecasting"
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Multi-Tenant Ready",
      description: "Scale to 50,000+ users with complete data isolation"
    },
  ];

  const stats = [
    { value: "85+", label: "Modules", suffix: "" },
    { value: "18", label: "Industries", suffix: "" },
    { value: "50K+", label: "Users Supported", suffix: "" },
    { value: "100%", label: "Open Source", suffix: "" },
  ];

  return (
    <StandardPage title="Page Title">
      <Header />

      <main className="flex-1">
        {/* Premium Hero Section */}
        <PremiumHero
          title="The Open Source AI-Powered ERP"
          subtitle="Enterprise-grade platform for 18 industries. Free to use, modify, and distribute under AGPL-3.0."
          gradient="primary"
          primaryCTA={{
            label: "Get Started Free",
            onClick: () => setLocation("/signup")
          }}
          secondaryCTA={{
            label: "View on GitHub",
            onClick: () => window.open("https://github.com/mbilaljunaid/nexusai-erp", "_blank")
          }}
        >
          {/* Badges */}
          <div className="flex gap-3 justify-center flex-wrap">
            <Badge className="bg-green-600 text-white border-0 text-sm px-4 py-2">
              OPEN SOURCE
            </Badge>
            <Badge className="bg-purple-600 text-white border-0 text-sm px-4 py-2">
              AGPL-3.0 LICENSED
            </Badge>
            <Badge className="bg-blue-600 text-white border-0 text-sm px-4 py-2">
              100% FREE
            </Badge>
          </div>

          {/* GitHub Actions */}
          <div className="flex gap-3 justify-center flex-wrap mt-6">
            <a
              href="https://github.com/mbilaljunaid/nexusai-erp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-card/10 hover:bg-card/20 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white transition-all"
            >
              <Star className="w-4 h-4" /> Star on GitHub
            </a>
            <a
              href="https://github.com/mbilaljunaid/nexusai-erp/fork"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-card/10 hover:bg-card/20 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white transition-all"
            >
              <GitFork className="w-4 h-4" /> Fork
            </a>
            <Link to="/docs/contributing">
              <a className="inline-flex items-center gap-2 px-4 py-2 bg-card/10 hover:bg-card/20 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white transition-all">
                <Heart className="w-4 h-4" /> Contribute
              </a>
            </Link>
          </div>
        </PremiumHero>

        {/* Stats Section */}
        <section className="py-20 px-4" style={{ background: colors.gradients.glass }}>
          <div className="max-w-6xl mx-auto">
            <StatsCounter stats={stats} />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-16" {...animations.fadeInUp}>
              <Badge className="mb-4">Platform Capabilities</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything You Need to Run Your Business
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From finance to HR, CRM to supply chain - all modules work seamlessly together
              </p>
            </motion.div>

            <FeatureGrid features={coreFeatures} columns={3} />
          </div>
        </section>

        {/* Modules Overview */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="max-w-7xl mx-auto">
             <motion.div className="text-center mb-16" {...animations.fadeInUp}>
              <Badge className="mb-4">Comprehensive Modules</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Core Business Suites
              </h2>
              <p className="text-xl text-muted-foreground">
                Integrated modules for every department
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {moduleCategories.map((cat, idx) => (
                <motion.div
                  key={idx}
                  {...animations.fadeInUp}
                  transition={{ delay: idx * 0.1 }}
                >
                  <GlassmorphismCard className="h-full hover:border-primary/50 transition-colors">
                    <div className={cn(`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center mb-6`)}>
                      {cat.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{cat.title}</h3>
                    <p className="text-muted-foreground">{cat.description}</p>
                  </GlassmorphismCard>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-12">
               <Link to="/features">
                  <Button size="lg" variant="outline">View All 85+ Modules</Button>
               </Link>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-16" {...animations.fadeInUp}>
              <Badge className="mb-4">Success Stories</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Trusted by Industry Leaders
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.div 
                  key={i}
                  {...animations.fadeInUp}
                  transition={{ delay: i * 0.2 }}
                >
                  <Testimonial {...t} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Coverage */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-12" {...animations.fadeInUp}>
              <Badge className="mb-4">Industry Solutions</Badge>
              <h2 className="text-4xl font-bold mb-4">Built for Your Industry</h2>
              <p className="text-xl text-muted-foreground">
                Pre-configured solutions with industry-specific workflows
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {industries.map((industry, index) => (
                <Link key={index} to={`/industries/${industry.slug}`}>
                  <motion.div
                    {...animations.zoomIn}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <GlassmorphismCard className="text-center py-6">
                      <h3 className="font-semibold">{industry.name}</h3>
                    </GlassmorphismCard>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Open Source Benefits */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div {...animations.slideInLeft}>
                <Badge className="mb-4 bg-green-600 text-white">100% Open Source</Badge>
                <h2 className="text-4xl font-bold mb-6">
                  Freedom to Build, Modify, and Scale
                </h2>
                <div className="space-y-4 mb-8">
                  {[
                    "Full source code access - no proprietary lock-in",
                    "AGPL-3.0 license - commercially friendly",
                    "Active community of contributors",
                    "Self-host anywhere - your data, your control",
                    "No vendor lock-in or licensing fees",
                    "Contribute features back to the community"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <a
                    href="https://github.com/mbilaljunaid/nexusai-erp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg">
                      <Github className="mr-2 w-5 h-5" />
                      View on GitHub
                    </Button>
                  </a>
                  <Link to="/open-source">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div {...animations.slideInRight}>
                <GradientCard variant="dark" className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-card/10 flex items-center justify-center">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Open Source First</h3>
                      <p className="text-sm text-white/80">AGPL-3.0 Licensed</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-card/5 rounded-lg">
                      <span className="text-sm">Source Code</span>
                      <Badge className="bg-green-500/20 text-green-300 border-0">Public</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card/5 rounded-lg">
                      <span className="text-sm">License</span>
                      <Badge className="bg-blue-500/20 text-blue-300 border-0">AGPL-3.0</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card/5 rounded-lg">
                      <span className="text-sm">Commercial Use</span>
                      <Badge className="bg-purple-500/20 text-purple-300 border-0">Allowed</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card/5 rounded-lg">
                      <span className="text-sm">Self-Hosting</span>
                      <Badge className="bg-orange-500/20 text-orange-300 border-0">Unlimited</Badge>
                    </div>
                  </div>
                </GradientCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CTASection
          title="Ready to Transform Your Business?"
          subtitle="Join thousands of organizations already using NexusAI to power their operations"
          primaryCTA={{
            label: "Start Free Trial",
            onClick: () => setLocation("/signup")
          }}
          secondaryCTA={{
            label: "Schedule Demo",
            onClick: () => setLocation("/contact")
          }}
          gradient={true}
        />
      </main>

      <Footer />
    </StandardPage>
  );
}
