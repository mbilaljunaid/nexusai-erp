import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Zap, Shield, Globe, TrendingUp, Sparkles, Package, Users, Briefcase, BarChart3, DollarSign, Factory, CheckCircle, Settings, Mail, Bot, Layers, Filter, FileUp, Github, Star, GitFork, Scale, Heart, Code2 } from "lucide-react";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";

export default function LandingPage() {
  useEffect(() => {
    document.title = "NexusAI - Open Source AI-Powered ERP | AGPL-3.0 Licensed";
  }, []);

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
        <div className="flex gap-2 justify-center flex-wrap mb-4">
          <Badge className="bg-green-600 text-white">OPEN SOURCE</Badge>
          <Badge className="landing-hero-badge">AGPL-3.0 LICENSED</Badge>
        </div>
        <h1 className="landing-hero-title text-6xl font-bold mb-6">
          NexusAI — The Open Source AI-Powered ERP
        </h1>
        <p className="landing-hero-subtitle text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
          Enterprise-grade ERP platform for 40+ industries. Free to use, modify, and distribute under AGPL-3.0.
        </p>
        <div className="flex gap-4 justify-center flex-wrap mb-8">
          <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-slate-800 hover:bg-slate-700 text-white text-lg" data-testid="button-github-hero">
              <Github className="mr-2 w-5 h-5" /> View on GitHub
            </Button>
          </a>
          <Link to="/login">
            <Button size="lg" className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white text-lg" data-testid="button-login">
              Sign In <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/open-source">
            <Button size="lg" variant="outline" data-testid="button-open-source">
              <Scale className="mr-2 w-5 h-5" /> Open Source
            </Button>
          </Link>
        </div>
        {/* GitHub Badges */}
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-sm transition-colors">
            <Star className="w-4 h-4" /> Star
          </a>
          <a href="https://github.com/mbilaljunaid/nexusai-erp/fork" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-sm transition-colors">
            <GitFork className="w-4 h-4" /> Fork
          </a>
          <Link to="/docs/contributing">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm transition-colors cursor-pointer">
              <Heart className="w-4 h-4" /> Contribute
            </span>
          </Link>
        </div>
      </section>

      {/* Contributor Ecosystem Infographic */}
      <section className="px-4 py-16" style={{ background: `hsl(var(--muted) / 0.3)` }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-purple-600 text-white mb-4">Join the Community</Badge>
            <h2 className="text-3xl font-bold mb-4">Contribute & Grow Together</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Be part of building the world's most powerful open-source ERP. Your contributions help thousands while earning rewards.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 text-center hover-elevate" data-testid="card-contribute-community">
              <Users className="w-10 h-10 mx-auto mb-3" style={{ color: `hsl(var(--primary))` }} />
              <h3 className="font-bold mb-2">Build Communities</h3>
              <p className="text-sm text-muted-foreground">Create and moderate industry communities</p>
            </Card>
            <Card className="p-6 text-center hover-elevate" data-testid="card-contribute-apps">
              <Package className="w-10 h-10 mx-auto mb-3" style={{ color: `hsl(var(--primary))` }} />
              <h3 className="font-bold mb-2">Develop Apps</h3>
              <p className="text-sm text-muted-foreground">Build and share apps & integrations</p>
            </Card>
            <Card className="p-6 text-center hover-elevate" data-testid="card-contribute-training">
              <Sparkles className="w-10 h-10 mx-auto mb-3" style={{ color: `hsl(var(--primary))` }} />
              <h3 className="font-bold mb-2">Create Training</h3>
              <p className="text-sm text-muted-foreground">Make tutorials and training videos</p>
            </Card>
            <Card className="p-6 text-center hover-elevate" data-testid="card-contribute-qa">
              <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: `hsl(var(--primary))` }} />
              <h3 className="font-bold mb-2">Quality Assurance</h3>
              <p className="text-sm text-muted-foreground">Help test and improve the platform</p>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Earn rewards:</strong> Sell services in marketplace, earn badges, get recognized
            </p>
            <Link to="/contribution">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white" data-testid="button-learn-contribute">
                Learn How to Contribute <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Open Source Banner */}
      <section className="px-4 py-12 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <Code2 className="w-10 h-10 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-1">100% Open Source</h3>
              <p className="text-white/80 text-sm">Full source code access</p>
            </div>
            <div>
              <Scale className="w-10 h-10 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-1">AGPL-3.0 License</h3>
              <p className="text-white/80 text-sm">Free to use & modify</p>
            </div>
            <div>
              <Users className="w-10 h-10 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-1">Community Driven</h3>
              <p className="text-white/80 text-sm">Built by developers</p>
            </div>
            <div>
              <Shield className="w-10 h-10 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-1">No Vendor Lock-in</h3>
              <p className="text-white/80 text-sm">Self-host anywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Coverage */}
      <section className="landing-section px-4 py-20 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Industry Coverage</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {industries.map((ind, i) => (
            <Link key={i} to={`/industry/${ind.toLowerCase().replace(/ /g, "-")}`}>
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
                <Link key={i} to={mod.href}>
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

      {/* Reports & Analytics Section */}
      <section className="landing-section px-4 py-20" style={{ background: `hsl(var(--muted) / 0.5)` }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Advanced Reports & Analytics</h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">Build custom reports, create smart views, analyze data, and export insights</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: BarChart3, title: "50+ Pre-built Reports", desc: "Transactional & periodical reports across all modules" },
              { icon: Filter, title: "SmartViews", desc: "Save custom filtered views with advanced filtering" },
              { icon: FileUp, title: "Excel Integration", desc: "Import/export data with full Excel compatibility" },
              { icon: Layers, title: "Pivot Tables & Charts", desc: "Interactive spreadsheets with visualizations" },
            ].map((item, i) => (
              <Card key={i} className="landing-card p-6 hover-elevate">
                <item.icon className="w-8 h-8" style={{ color: `hsl(var(--primary))` }} />
                <h3 className="font-bold text-lg mb-2 mt-4">{item.title}</h3>
                <p className="text-sm" style={{ color: `hsl(var(--muted-foreground))` }}>{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Open Source */}
      <section className="landing-section px-4 py-20 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Why Choose Open Source ERP?</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Unlike proprietary solutions, NexusAI gives you complete control over your enterprise software
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Code2, title: "Full Source Access", desc: "Inspect, audit, and understand every line of code running your business" },
            { icon: Shield, title: "Security & Privacy", desc: "Self-host on your infrastructure. Your data never leaves your control" },
            { icon: Heart, title: "Community Support", desc: "Get help from a global community of developers and enterprises" },
            { icon: Sparkles, title: "AI-Driven Automation", desc: "Real-time recommendations & predictive insights powered by AI" },
            { icon: Zap, title: "Rapid Deployment", desc: "Pre-configured workflows get you running in days, not months" },
            { icon: Globe, title: "No Vendor Lock-in", desc: "Fork, customize, or switch providers without losing your investment" },
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
                  <th className="text-center p-3">SAP</th>
                  <th className="text-center p-3">Odoo</th>
                  <th className="text-center p-3">ERPNext</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Open Source (AGPL-3.0)", "✅", "❌", "❌", "⚠️", "✅"],
                  ["AI-Powered Insights", "✅", "⚠️", "⚠️", "❌", "❌"],
                  ["40+ Industries", "✅", "✅", "✅", "❌", "❌"],
                  ["Self-Hosting Option", "✅", "❌", "❌", "✅", "✅"],
                  ["No Vendor Lock-in", "✅", "❌", "❌", "⚠️", "✅"],
                  ["Community Contributions", "✅", "❌", "❌", "✅", "✅"],
                  ["Enterprise Security", "✅", "✅", "✅", "⚠️", "⚠️"],
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

      {/* GitHub CTA */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 bg-gradient-to-br from-slate-800 to-slate-900 text-white text-center">
            <Github className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Join the Open Source Movement</h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Star our repository, fork it for your organization, or contribute code. 
              Every contribution helps make enterprise software accessible to everyone.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" data-testid="button-star-github">
                  <Star className="mr-2 w-5 h-5" /> Star on GitHub
                </Button>
              </a>
              <a href="https://github.com/mbilaljunaid/nexusai-erp/fork" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-fork-github">
                  <GitFork className="mr-2 w-5 h-5" /> Fork Repository
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </section>

      {/* Featured Section */}
      <section className="px-4 py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Featured</h2>
        <div className="flex justify-center">
          <a href="https://startupfa.me/s/nexusai?utm_source=nexusaifirst.cloud" target="_blank" rel="noopener noreferrer" data-testid="link-startup-fame">
            <img src="https://startupfa.me/badges/featured-badge.webp" alt="Nexus AI First ERP - Featured on Startup Fame" width="171" height="54" />
          </a>
        </div>
      </section>

      </main>

      <Footer />
    </div>
  );
}
