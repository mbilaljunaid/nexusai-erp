import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, Users, BarChart3, Zap, Target, Lock, Coins, Workflow, Brain, Shield, FileCheck, Layers, Megaphone, Gauge, Factory, Briefcase, HeartHandshake, Banknote, ClipboardList, Database, Truck, Settings, PieChart, BookOpen, AlertCircle, GitBranch } from "lucide-react";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";

export default function UseCasesPage() {
  useEffect(() => {
    document.title = "Use Cases | NexusAI - Real-World Enterprise Solutions";
  }, []);

  const useCases = [
    // Core Modules (15)
    {
      title: "Accelerate Sales Pipeline"
      description: "Use AI-powered lead scoring and predictive analytics to identify high-value opportunities, prioritize deals, and forecast revenue accurately."
      icon: TrendingUp
      metrics: ["3x faster deal closure", "45% higher conversion", "Real-time pipeline visibility"]
      module: "CRM & Customer Management"
      category: "Core"
    }
    {
      title: "Optimize Supply Chain"
      description: "Automate procurement, inventory management, and logistics with real-time visibility and predictive demand forecasting."
      icon: Workflow
      metrics: ["40% reduction in lead times", "25% inventory optimization", "Supplier collaboration"]
      module: "Inventory & Procurement"
      category: "Core"
    }
    {
      title: "Improve Financial Reporting"
      description: "Consolidate financial data from multiple entities with real-time dashboards, automated reconciliation, and compliance reporting."
      icon: Coins
      metrics: ["90% faster close", "99.9% accuracy", "Multi-entity support"]
      module: "Financial Management & ERP"
      category: "Core"
    }
    {
      title: "Enhance Customer Experience"
      description: "360-degree customer view with omnichannel engagement, personalized interactions, and predictive customer service."
      icon: Users
      metrics: ["35% higher retention", "50% faster resolution", "Personalized engagement"]
      module: "CRM & Customer Management"
      category: "Core"
    }
    {
      title: "Drive Data-Driven Decisions"
      description: "Transform raw data into actionable insights with advanced analytics, BI dashboards, and AI-powered recommendations."
      icon: BarChart3
      metrics: ["Real-time insights", "Predictive analytics", "Custom dashboards"]
      module: "Business Intelligence & Analytics"
      category: "Core"
    }
    {
      title: "Automate Compliance & Governance"
      description: "Maintain regulatory compliance across multiple jurisdictions with automated controls, audit trails, and risk management."
      icon: Lock
      metrics: ["Zero compliance gaps", "Audit-ready reports", "Risk mitigation"]
      module: "Compliance & Governance"
      category: "Core"
    }
    {
      title: "Streamline HR Operations"
      description: "Automate recruitment, onboarding, payroll, and performance management with AI-driven talent insights."
      icon: Zap
      metrics: ["50% faster hiring", "30% reduction in HR costs", "Better talent retention"]
      module: "HR & Payroll Management"
      category: "Core"
    }
    {
      title: "Accelerate Project Delivery"
      description: "Manage complex projects with AI scheduling, resource optimization, and real-time collaboration tools."
      icon: Target
      metrics: ["25% faster delivery", "Budget control", "Team alignment"]
      module: "Projects & Task Management"
      category: "Core"
    }
    {
      title: "Intelligent AI Copilot Assistance"
      description: "Empower employees with AI-driven insights for smarter decision-making, document generation, and workflow optimization."
      icon: Brain
      metrics: ["60% faster task completion", "AI-generated reports", "Intelligent recommendations"]
      module: "AI & Cognitive Services"
      category: "Core"
    }
    {
      title: "Automate Business Workflows"
      description: "Design and execute complex business processes with low-code automation, reducing manual work and errors."
      icon: Workflow
      metrics: ["80% reduction in manual tasks", "Higher accuracy", "Scalable workflows"]
      module: "Automations & Workflows"
      category: "Core"
    }
    {
      title: "Enforce Enterprise Security"
      description: "Implement granular role-based and attribute-based access controls with real-time audit logging and threat detection."
      icon: Shield
      metrics: ["Zero unauthorized access", "Complete audit trails", "Multi-layer security"]
      module: "Security & RBAC"
      category: "Core"
    }
    {
      title: "Accelerate Month/Year End Close"
      description: "Consolidate multi-entity financials, auto-reconcile accounts, and streamline audit processes for faster closing cycles."
      icon: FileCheck
      metrics: ["70% faster close cycle", "Reduced errors", "Complete transparency"]
      module: "Financial Close & Consolidation"
      category: "Core"
    }
    {
      title: "Support Multi-Tenant Operations"
      description: "Manage multiple business units, subsidiaries, or franchises with complete data isolation and unified reporting."
      icon: Layers
      metrics: ["Complete isolation", "Unified reporting", "Independent operations"]
      module: "Multi-Tenant Architecture"
      category: "Core"
    }
    {
      title: "Engage via Omnichannel Communications"
      description: "Reach customers across email, SMS, portals, and web with unified messaging and personalized campaigns."
      icon: Megaphone
      metrics: ["Higher engagement rates", "Unified messaging", "Better customer reach"]
      module: "Communications & Portal"
      category: "Core"
    }
    {
      title: "Track User Activity & Audit"
      description: "Maintain complete audit trails of all user actions with role-based visibility and compliance-ready reports."
      icon: Gauge
      metrics: ["100% action tracking", "Compliance ready", "Forensic analysis"]
      module: "Audit & Activity Logging"
      category: "Core"
    }

    // Industry-Specific Modules (13+)
    {
      title: "Optimize Manufacturing Operations"
      description: "Manage production orders, quality control, equipment scheduling, and supply chain integration for efficient manufacturing."
      icon: Factory
      metrics: ["20% increase in efficiency", "Reduced defects", "Better asset utilization"]
      module: "Manufacturing & Operations"
      category: "Industry Pack"
    }
    {
      title: "Drive Marketing Campaign ROI"
      description: "Plan, execute, and measure marketing campaigns with attribution tracking, audience segmentation, and performance analytics."
      icon: Megaphone
      metrics: ["35% higher ROI", "Better targeting", "Automated workflows"]
      module: "Marketing & Campaigns"
      category: "Industry Pack"
    }
    {
      title: "Deliver Exceptional Service"
      description: "Manage service requests, technician scheduling, field service operations, and customer satisfaction tracking."
      icon: HeartHandshake
      metrics: ["30% faster resolution", "Higher CSAT", "Reduced downtime"]
      module: "Service & Support"
      category: "Industry Pack"
    }
    {
      title: "Optimize Cash Flow Management"
      description: "Forecast cash needs, manage working capital, optimize payment schedules, and improve liquidity."
      icon: Banknote
      metrics: ["Improved cash position", "Better forecasting", "Optimized payments"]
      module: "Cash Management"
      category: "Industry Pack"
    }
    {
      title: "Streamline Demand Planning"
      description: "Use predictive analytics to forecast demand, optimize inventory, and reduce stockouts and overstock situations."
      icon: TrendingUp
      metrics: ["20% inventory reduction", "Better accuracy", "Faster response"]
      module: "Demand Forecasting"
      category: "Industry Pack"
    }
    {
      title: "Maintain Data Governance"
      description: "Define data policies, enforce data quality, manage master data, and ensure regulatory compliance."
      icon: Database
      metrics: ["Single source of truth", "Higher data quality", "Full compliance"]
      module: "Data Governance"
      category: "Industry Pack"
    }
    {
      title: "Track Goods Receipt & Inspection"
      description: "Automate receiving processes, quality inspection, and supplier performance tracking."
      icon: ClipboardList
      metrics: ["Faster processing", "Better quality", "Supplier insights"]
      module: "Goods Receipt & QA"
      category: "Industry Pack"
    }
    {
      title: "Manage Logistics & Transportation"
      description: "Optimize delivery routes, track shipments, manage fleet operations, and reduce transportation costs."
      icon: Truck
      metrics: ["20% cost reduction", "Faster delivery", "Real-time tracking"]
      module: "Logistics & Transport"
      category: "Industry Pack"
    }
    {
      title: "Centralize System Administration"
      description: "Monitor system health, manage user access, configure integrations, and maintain operational excellence."
      icon: Settings
      metrics: ["99.9% uptime", "Reduced incidents", "Better governance"]
      module: "Admin Console & Monitoring"
      category: "Industry Pack"
    }
    {
      title: "Generate Business Intelligence"
      description: "Create custom reports, dashboards, and visualizations to uncover trends and drive strategic decisions."
      icon: PieChart
      metrics: ["Faster insights", "Custom reports", "Data-driven culture"]
      module: "Advanced BI & Reporting"
      category: "Industry Pack"
    }
    {
      title: "Manage Training & Development"
      description: "Track employee training, certifications, skill development, and create learning pathways."
      icon: BookOpen
      metrics: ["Better skill tracking", "Career paths", "Compliance training"]
      module: "Learning & Development"
      category: "Industry Pack"
    }
    {
      title: "Monitor Compliance Alerts"
      description: "Real-time monitoring of regulatory requirements, risk indicators, and compliance violations."
      icon: AlertCircle
      metrics: ["Zero missed alerts", "Proactive mitigation", "Complete visibility"]
      module: "Compliance Monitoring"
      category: "Industry Pack"
    }
    {
      title: "Manage Release Cycles"
      description: "Plan, coordinate, and track software/product releases with automated deployments and rollback capabilities."
      icon: GitBranch
      metrics: ["Faster releases", "Zero downtime", "Better coordination"]
      module: "Release Management"
      category: "Industry Pack"
    }
  ];

  const coreUseCases = useCases.filter(uc => uc.category === "Core");
  const industryUseCases = useCases.filter(uc => uc.category === "Industry Pack");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="px-4 py-16 border-b border-slate-700">
          <div className="max-w-6xl mx-auto">
            <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-500/50">USE CASES</Badge>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Transform Your Business with NexusAI
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl">
              Discover how enterprises across industries leverage NexusAI's 28+ modules to drive efficiency, reduce costs, and accelerate growth
            </p>
          </div>
        </section>

        {/* Core Modules Use Cases */}
        <section className="px-4 py-20 border-b border-slate-700">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <Badge className="mb-4 bg-green-600/20 text-green-300 border-green-500/50">15 CORE MODULES</Badge>
              <h2 className="text-3xl font-bold mb-2">Enterprise Core Solutions</h2>
              <p className="text-slate-300">Foundation modules powering enterprise operations</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {coreUseCases.map((useCase, idx) => {
                const Icon = useCase.icon;
                return (
                  <Card key={idx} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all p-6" data-testid={`card-usecase-core-${idx}`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-blue-600/20 rounded-lg flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{useCase.title}</h3>
                        <Badge className="mt-2 bg-slate-700 text-slate-300 text-xs">{useCase.module}</Badge>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-4 text-sm">{useCase.description}</p>
                    <div className="space-y-1">
                      {useCase.metrics.map((metric, m) => (
                        <div key={m} className="flex items-center gap-2 text-xs text-slate-400">
                          <div className="w-1 h-1 bg-blue-400 rounded-full" />
                          {metric}
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Industry-Specific Modules Use Cases */}
        <section className="px-4 py-20 border-b border-slate-700">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <Badge className="mb-4 bg-purple-600/20 text-purple-300 border-purple-500/50">13+ INDUSTRY PACKS</Badge>
              <h2 className="text-3xl font-bold mb-2">Industry-Specific Capabilities</h2>
              <p className="text-slate-300">Specialized modules for unique business needs</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {industryUseCases.map((useCase, idx) => {
                const Icon = useCase.icon;
                return (
                  <Card key={idx} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all p-6" data-testid={`card-usecase-industry-${idx}`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-purple-600/20 rounded-lg flex-shrink-0">
                        <Icon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{useCase.title}</h3>
                        <Badge className="mt-2 bg-slate-700 text-slate-300 text-xs">{useCase.module}</Badge>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-4 text-sm">{useCase.description}</p>
                    <div className="space-y-1">
                      {useCase.metrics.map((metric, m) => (
                        <div key={m} className="flex items-center gap-2 text-xs text-slate-400">
                          <div className="w-1 h-1 bg-purple-400 rounded-full" />
                          {metric}
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Summary Stats */}
        <section className="px-4 py-20 border-b border-slate-700">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">28+</div>
                <div className="text-sm text-slate-300">Total Modules</div>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">41</div>
                <div className="text-sm text-slate-300">Industry Verticals</div>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">800+</div>
                <div className="text-sm text-slate-300">REST APIs</div>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">∞</div>
                <div className="text-sm text-slate-300">Scalability</div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 border-b border-slate-700">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
            <p className="text-slate-300 mb-8">
              Let our experts show you how NexusAI can solve your specific challenges and drive measurable results
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/demo">
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-request-demo-usecases">
                  Request a Demo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/industries">
                <Button variant="outline" className="text-white border-white hover:bg-white/10" data-testid="button-explore-industries">
                  Explore Industries
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
