import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Zap, Shield, Globe, TrendingUp, Sparkles, Package, Users, Briefcase, BarChart3, DollarSign, Factory, CheckCircle, Settings, Mail, Bot, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "NexusAI - AI-Powered ERP for Enterprise | 40+ Industries";
  }, []);

  const handleDemo = async () => {
    try {
      const res = await fetch("/api/demos/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, industry: "General" }),
      });
      if (res.ok) setSubmitted(true);
    } catch (e) {
      console.error(e);
    }
  };

  const industries = [
    "Automotive", "Banking", "Healthcare", "Education", "Retail", "Manufacturing",
    "Logistics", "Telecom", "Insurance", "Fashion", "Government", "Hospitality"
  ];

  const modules = [
    { title: "ERP Core", icon: Package, href: "/module/erp-core" },
    { title: "CRM", icon: Users, href: "/module/crm" },
    { title: "HR & Payroll", icon: Briefcase, href: "/module/hr" },
    { title: "Projects", icon: BarChart3, href: "/module/projects" },
    { title: "EPM", icon: TrendingUp, href: "/module/epm" },
    { title: "Finance", icon: DollarSign, href: "/module/finance" },
    { title: "Inventory", icon: Factory, href: "/module/inventory" },
    { title: "Compliance", icon: CheckCircle, href: "/module/compliance" },
    { title: "BPM", icon: Settings, href: "/module/bpm" },
    { title: "Website", icon: Globe, href: "/module/website" },
    { title: "Email", icon: Mail, href: "/module/email" },
    { title: "BI & Analytics", icon: BarChart3, href: "/module/analytics" },
    { title: "AI Copilot", icon: Bot, href: "/module/ai-copilot" },
    { title: "Consolidation", icon: Layers, href: "/module/consolidation" },
    { title: "Financial Close", icon: Sparkles, href: "/module/financial-close" },
  ];

  return (
    <div className="landing-page min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
      {/* Hero Section */}
      <section className="px-4 py-24 text-center">
        <Badge className="landing-hero-badge mb-4">NOW AVAILABLE</Badge>
        <h1 className="landing-hero-title text-6xl font-bold mb-6">
          Nexus AI — Your All-in-One AI-Powered ERP
        </h1>
        <p className="landing-hero-subtitle text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
          Transforming Enterprises Across 40+ Industries with AI, Automation & End-to-End Modules
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white text-lg" data-testid="button-request-demo">
            Request a Demo <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" data-testid="button-explore-modules">
              Explore Modules <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Industry Coverage */}
      <section className="landing-section px-4 py-20 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Industry Coverage</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {industries.map((ind, i) => (
            <Link key={i} href={`/industry/${ind.toLowerCase().replace(/ /g, "-")}`}>
              <Card className="landing-card cursor-pointer p-4 text-center transition-all hover-elevate" data-testid={`card-industry-${ind.toLowerCase()}`}>
                <p className="font-semibold">{ind}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Modules Overview */}
      <section className="landing-section px-4 py-20" style={{ background: `hsl(var(--muted) / 0.5)` }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">15 Enterprise Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {modules.map((mod, i) => {
              const ModuleIcon = mod.icon;
              return (
                <Link key={i} href={mod.href}>
                  <Card className="landing-card p-4 text-center hover-elevate cursor-pointer transition-all" data-testid={`card-module-${mod.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <ModuleIcon className="w-8 h-8 mx-auto mb-2" style={{ color: `hsl(var(--primary))` }} />
                    <p className="font-semibold">{mod.title}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="landing-section px-4 py-20 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose NexusAI</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Sparkles, title: "AI-Driven Automation", desc: "Real-time recommendations & predictive insights" },
            { icon: Zap, title: "Pre-Configured Workflows", desc: "Industry-specific templates ready to use" },
            { icon: Globe, title: "All-in-One Platform", desc: "No need for multiple disconnected systems" },
            { icon: Shield, title: "Enterprise Security", desc: "RBAC, multi-tenant isolation, audit logging" },
            { icon: TrendingUp, title: "Faster Implementation", desc: "50% faster deployment vs traditional ERP" },
            { icon: ArrowRight, title: "Scalable Architecture", desc: "From SMB to Fortune 500 ready" },
          ].map((item, i) => (
            <Card key={i} className="landing-card p-6">
              <item.icon className="w-8 h-8" style={{ color: `hsl(var(--primary))` }} />
              <h3 className="font-bold text-lg mb-2 mt-4">{item.title}</h3>
              <p className="text-sm" style={{ color: `hsl(var(--muted-foreground))` }}>{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="landing-section px-4 py-20" style={{ background: `hsl(var(--muted) / 0.5)` }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">vs Competitors</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderColor: `hsl(var(--border))` }} className="border-b">
                  <th className="text-left p-3">Feature</th>
                  <th className="text-center p-3">NexusAI</th>
                  <th className="text-center p-3">Oracle</th>
                  <th className="text-center p-3">Salesforce</th>
                  <th className="text-center p-3">Odoo</th>
                  <th className="text-center p-3">Jira</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["AI-Powered Insights", "✅", "❌", "⚠️", "❌", "❌"],
                  ["Fast Implementation", "✅", "❌", "⚠️", "⚠️", "✅"],
                  ["Pre-configured Workflows", "✅", "❌", "⚠️", "⚠️", "✅"],
                  ["40+ Industries", "✅", "❌", "❌", "❌", "❌"],
                  ["Transparent Pricing", "✅", "❌", "❌", "✅", "✅"],
                  ["Multi-tenant Ready", "✅", "⚠️", "✅", "✅", "✅"],
                ].map((row, i) => (
                  <tr key={i} className="border-b hover:bg-[hsl(var(--muted)/0.3)]" style={{ borderColor: `hsl(var(--border))` }}>
                    <td className="p-3 font-semibold">{row[0]}</td>
                    {row.slice(1).map((cell, j) => (
                      <td key={j} className="text-center p-3">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="px-4 py-20 max-w-2xl mx-auto">
        <Card className="landing-cta-gradient p-8">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Transform?</h2>
          <p className="mb-6" style={{ color: `hsl(var(--primary) / 0.2)` }}>Get instant access to a fully seeded demo environment for your industry.</p>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded border text-white placeholder-white/50"
              style={{ backgroundColor: `hsl(var(--primary) / 0.2)`, borderColor: `hsl(var(--primary) / 0.4)`, color: 'white' }}
              data-testid="input-demo-email"
            />
            <input
              type="text"
              placeholder="Your Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-4 py-2 rounded border text-white placeholder-white/50"
              style={{ backgroundColor: `hsl(var(--primary) / 0.2)`, borderColor: `hsl(var(--primary) / 0.4)`, color: 'white' }}
              data-testid="input-demo-company"
            />
            <Button onClick={handleDemo} className="w-full bg-white text-[hsl(var(--primary))] hover:bg-white/90 font-bold text-lg" data-testid="button-demo-cta">
              {submitted ? "Demo Request Sent!" : "Click Here to See Demo"}
            </Button>
            {submitted && <p className="text-center text-white/70">Check your email for access details!</p>}
          </div>
        </Card>
      </section>

      </main>

      <Footer />
    </div>
  );
}
