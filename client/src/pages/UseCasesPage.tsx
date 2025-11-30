import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, Users, BarChart3, Zap, Target, Lock, Coins, Workflow } from "lucide-react";
import { useEffect } from "react";

export default function UseCasesPage() {
  useEffect(() => {
    document.title = "Use Cases | NexusAI - Real-World Enterprise Solutions";
  }, []);

  const useCases = [
    {
      title: "Accelerate Sales Pipeline",
      description: "Use AI-powered lead scoring and predictive analytics to identify high-value opportunities, prioritize deals, and forecast revenue accurately.",
      icon: TrendingUp,
      metrics: ["3x faster deal closure", "45% higher conversion", "Real-time pipeline visibility"],
      industry: "Sales & CRM"
    },
    {
      title: "Optimize Supply Chain",
      description: "Automate procurement, inventory management, and logistics with real-time visibility and predictive demand forecasting.",
      icon: Workflow,
      metrics: ["40% reduction in lead times", "25% inventory optimization", "Supplier collaboration"],
      industry: "Operations"
    },
    {
      title: "Improve Financial Reporting",
      description: "Consolidate financial data from multiple entities with real-time dashboards, automated reconciliation, and compliance reporting.",
      icon: Coins,
      metrics: ["90% faster close", "99.9% accuracy", "Multi-entity support"],
      industry: "Finance"
    },
    {
      title: "Enhance Customer Experience",
      description: "360-degree customer view with omnichannel engagement, personalized interactions, and predictive customer service.",
      icon: Users,
      metrics: ["35% higher retention", "50% faster resolution", "Personalized engagement"],
      industry: "Customer Success"
    },
    {
      title: "Drive Data-Driven Decisions",
      description: "Transform raw data into actionable insights with advanced analytics, BI dashboards, and AI-powered recommendations.",
      icon: BarChart3,
      metrics: ["Real-time insights", "Predictive analytics", "Custom dashboards"],
      industry: "Analytics"
    },
    {
      title: "Automate Compliance & Governance",
      description: "Maintain regulatory compliance across multiple jurisdictions with automated controls, audit trails, and risk management.",
      icon: Lock,
      metrics: ["Zero compliance gaps", "Audit-ready reports", "Risk mitigation"],
      industry: "Compliance"
    },
    {
      title: "Streamline HR Operations",
      description: "Automate recruitment, onboarding, payroll, and performance management with AI-driven talent insights.",
      icon: Zap,
      metrics: ["50% faster hiring", "30% reduction in HR costs", "Better talent retention"],
      industry: "HR & Payroll"
    },
    {
      title: "Accelerate Project Delivery",
      description: "Manage complex projects with AI scheduling, resource optimization, and real-time collaboration tools.",
      icon: Target,
      metrics: ["25% faster delivery", "Budget control", "Team alignment"],
      industry: "Project Management"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <section className="px-4 py-16 border-b border-slate-700">
        <div className="max-w-6xl mx-auto">
          <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-500/50">USE CASES</Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Transform Your Business with NexusAI
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Discover how enterprises across industries leverage NexusAI to drive efficiency, reduce costs, and accelerate growth
          </p>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-20">
            {useCases.map((useCase, idx) => {
              const Icon = useCase.icon;
              return (
                <Card key={idx} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all p-6" data-testid={`card-usecase-${idx}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-blue-600/20 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{useCase.title}</h3>
                      <Badge className="mt-2 bg-slate-700 text-slate-300">{useCase.industry}</Badge>
                    </div>
                  </div>
                  <p className="text-slate-300 mb-4">{useCase.description}</p>
                  <div className="space-y-2">
                    {useCase.metrics.map((metric, m) => (
                      <div key={m} className="flex items-center gap-2 text-sm text-slate-400">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        {metric}
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="text-center py-12 border-t border-slate-700">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Let our experts show you how NexusAI can solve your specific challenges and drive measurable results
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/demo">
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-request-demo-usecases">
                  Request a Demo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" className="text-white border-white hover:bg-white/10" data-testid="button-learn-more">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="px-4 py-12 border-t border-slate-700 bg-slate-900/50">
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p>&copy; 2025 NexusAI. All rights reserved.</p>
        </div>
      </section>
    </div>
  );
}
