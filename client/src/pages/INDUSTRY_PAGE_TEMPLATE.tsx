// Template for public-facing industry pages
// Example: Create file client/src/pages/IndustryTemplate.tsx and duplicate for each industry

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ArrowRight, Check, Globe, Zap, Shield } from "lucide-react";

interface IndustryPageProps {
  industry: string;
  description: string;
  modules: string[];
  benefits: string[];
  processFlows: { name: string; steps: string[] }[];
}

export default function IndustryPage({ 
  industry, 
  description, 
  modules, 
  benefits, 
  processFlows 
}: IndustryPageProps) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [demoRequested, setDemoRequested] = useState(false);

  const handleDemoRequest = async () => {
    try {
      const res = await fetch("/api/demos/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, industry }),
      });
      if (res.ok) {
        setDemoRequested(true);
        setTimeout(() => setDemoRequested(false), 5000);
      }
    } catch (error) {
      console.error("Demo request failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* SEO Meta */}
      <head>
        <title>{industry} ERP Solutions | NexusAI</title>
        <meta name="description" content={`${industry} enterprise ERP software with AI-driven automation, real-time analytics, and industry-specific modules. See demo.`} />
        <meta name="keywords" content={`${industry}, ERP, enterprise software, automation, analytics`} />
        <meta property="og:title" content={`${industry} ERP Solutions | NexusAI`} />
        <meta property="og:description" content={`Transform your ${industry.toLowerCase()} operations with NexusAI's comprehensive ERP platform.`} />
      </head>

      {/* Hero Section */}
      <section className="px-4 py-20 text-center text-white">
        <h1 className="text-5xl font-bold mb-4">{industry} Enterprise Solutions</h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">{description}</p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Explore Now</Button>
          <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">Learn More</Button>
        </div>
      </section>

      {/* Modules Covered */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Auto-Enabled Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module, idx) => (
            <Card key={idx} className="bg-slate-800 border-slate-700 p-4 text-white">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <span>{module}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Process Flows */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">End-to-End Process Flows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processFlows.map((flow, idx) => (
            <Card key={idx} className="bg-slate-800 border-slate-700 p-6 text-white">
              <h3 className="font-bold text-lg mb-4">{flow.name}</h3>
              <ol className="space-y-2 text-sm">
                {flow.steps.map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-blue-400 font-bold">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 py-16 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Why NexusAI for {industry}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="text-white">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  <p>{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="px-4 py-16 max-w-2xl mx-auto">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Transform Your {industry} Operations?</h2>
          <p className="text-blue-100 mb-6">Get instant access to a fully seeded demo environment tailored for {industry}.</p>
          
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
            <Button 
              onClick={handleDemoRequest}
              className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold"
              data-testid="button-demo-request"
            >
              {demoRequested ? "Demo Request Sent!" : "Click Here to See Demo"} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            {demoRequested && (
              <p className="text-center text-white text-sm">Check your email for demo access details!</p>
            )}
          </div>
        </Card>
      </section>

      {/* USPs */}
      <section className="px-4 py-16 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">NexusAI Advantages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700 p-4 text-white">
              <Globe className="w-8 h-8 text-blue-400 mb-2" />
              <p className="font-bold">All-in-One Platform</p>
              <p className="text-sm text-slate-300">No need for multiple systems</p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4 text-white">
              <Zap className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="font-bold">AI-Driven Insights</p>
              <p className="text-sm text-slate-300">Real-time recommendations</p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4 text-white">
              <Shield className="w-8 h-8 text-green-400 mb-2" />
              <p className="font-bold">Enterprise Security</p>
              <p className="text-sm text-slate-300">RBAC + Multi-tenant</p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-4 text-white">
              <Check className="w-8 h-8 text-blue-400 mb-2" />
              <p className="font-bold">Ready-to-Use</p>
              <p className="text-sm text-slate-300">Pre-configured for your industry</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
