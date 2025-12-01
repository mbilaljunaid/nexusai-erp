import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Zap, Lock, Cpu, BarChart3, Workflow } from "lucide-react";
import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    document.title = "NexusAI - Enterprise AI Platform";
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            NexusAI
          </div>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              Access Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Enterprise AI Platform for <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Every Industry</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Manage your entire enterprise with AI-powered automation across 40+ industries. 809 pre-built applications covering CRM, ERP, HR, Finance, and more.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-slate-50 dark:bg-slate-900/50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Cpu className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
                  title: "AI-Powered Automation",
                  description: "Automate workflows with intelligent AI assistance and real-time insights"
                },
                {
                  icon: <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
                  title: "Enterprise Security",
                  description: "Role-based access control, multi-tenant isolation, and compliance standards"
                },
                {
                  icon: <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
                  title: "Advanced Analytics",
                  description: "Real-time dashboards and predictive analytics for data-driven decisions"
                },
                {
                  icon: <Workflow className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
                  title: "800+ Pre-Built Forms",
                  description: "Ready-to-use applications for sales, finance, HR, supply chain, and more"
                },
                {
                  icon: <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
                  title: "Lightning Fast",
                  description: "Optimized performance with PostgreSQL backend and real-time updates"
                },
                {
                  icon: <ArrowRight className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
                  title: "Easy Integration",
                  description: "Connect with your existing tools and systems seamlessly"
                }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
                  {feature.icon}
                  <h3 className="text-xl font-semibold mt-4 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted Across Industries</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {["Manufacturing", "Finance", "Healthcare", "Retail", "Logistics", "Technology", "Education", "Government", "Automotive", "Telecom", "Energy", "Construction"].map((industry, i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <p className="font-medium text-sm">{industry}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 py-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Enterprise?</h2>
            <p className="text-blue-100 mb-8 text-lg">Access the complete NexusAI dashboard with 809 pre-built applications.</p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
                Launch Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-600 dark:text-slate-400 text-sm">
          <p>&copy; 2025 NexusAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
