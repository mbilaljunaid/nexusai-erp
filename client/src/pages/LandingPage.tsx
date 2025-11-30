import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Zap, Shield, Globe, TrendingUp, Sparkles } from "lucide-react";
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
    { title: "ERP Core", icon: "📦" },
    { title: "CRM", icon: "👥" },
    { title: "HR & Payroll", icon: "👔" },
    { title: "Projects", icon: "📊" },
    { title: "EPM", icon: "📈" },
    { title: "Finance", icon: "💰" },
    { title: "Inventory", icon: "🏭" },
    { title: "Compliance", icon: "✅" },
    { title: "BPM", icon: "⚙️" },
    { title: "Website", icon: "🌐" },
    { title: "Email", icon: "📧" },
    { title: "BI & Analytics", icon: "📉" },
    { title: "AI Copilot", icon: "🤖" },
    { title: "Consolidation", icon: "🔗" },
    { title: "Financial Close", icon: "✨" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1">
      {/* Hero Section */}
      <section className="px-4 py-24 text-center">
        <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-500/50">NOW AVAILABLE</Badge>
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Nexus AI — Your All-in-One AI-Powered ERP
        </h1>
        <p className="text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
          Transforming Enterprises Across 40+ Industries with AI, Automation & End-to-End Modules
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg" data-testid="button-request-demo">
            Request a Demo <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
            Explore Modules
          </Button>
        </div>
      </section>

      {/* Industry Coverage */}
      <section className="px-4 py-20 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Industry Coverage</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {industries.map((ind, i) => (
            <Link key={i} href={`/industry/${ind.toLowerCase().replace(/ /g, "-")}`}>
              <Card className="bg-slate-800 hover:bg-blue-700 border-slate-700 cursor-pointer p-4 text-center transition-all hover-elevate" data-testid={`card-industry-${ind.toLowerCase()}`}>
                <p className="font-semibold">{ind}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Modules Overview */}
      <section className="px-4 py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">15 Enterprise Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {modules.map((mod, i) => (
              <Card key={i} className="bg-slate-700 border-slate-600 p-4 text-center hover-elevate">
                <p className="text-3xl mb-2">{mod.icon}</p>
                <p className="font-semibold">{mod.title}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="px-4 py-20 max-w-7xl mx-auto">
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
            <Card key={i} className="bg-slate-800 border-slate-700 p-6">
              <item.icon className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-slate-300 text-sm">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="px-4 py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">vs Competitors</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
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
                  <tr key={i} className="border-b border-slate-600/50 hover:bg-slate-700/30">
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
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 p-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform?</h2>
          <p className="text-blue-100 mb-6">Get instant access to a fully seeded demo environment for your industry.</p>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-blue-200"
              data-testid="input-demo-email"
            />
            <input
              type="text"
              placeholder="Your Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-blue-200"
              data-testid="input-demo-company"
            />
            <Button onClick={handleDemo} className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg" data-testid="button-demo-cta">
              {submitted ? "Demo Request Sent!" : "Click Here to See Demo"}
            </Button>
            {submitted && <p className="text-center text-blue-100">Check your email for access details!</p>}
          </div>
        </Card>
      </section>

      </main>

      <Footer />
    </div>
  );
}
