import { useParams } from "wouter";
import { Header, Footer } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const industryData: Record<string, { 
  name: string
  description: string
  modules: string[]
  features: string[]
  problems: string[]
  solutions: string[]
  valueChain: { stage: string; desc: string }[]
  benefits: string[]
}> = {
  "automotive": {
    name: "Automotive",
    description: "Comprehensive ERP solutions for automotive manufacturing, dealers, and supply chain",
    modules: ["Production Planning", "Dealer Inventory", "Sales CRM", "After-Sales Service", "Finance", "HR", "Supply Chain"],
    features: ["Quality Control", "Compliance Tracking", "Dealer Management", "Service Scheduling"],
    problems: [
      "Complex multi-tier supply chain coordination across suppliers, manufacturers, and dealers",
      "Quality control and recall management across production and dealer networks",
      "Fragmented dealer inventory and sales data visibility",
      "Compliance with automotive regulations (IATF, ISO, EPA)",
      "After-sales service and warranty management complexity"
    ],
    solutions: [
      "End-to-end supply chain visibility with real-time tracking from supplier to dealer",
      "Automated quality control with predictive defect detection using AI",
      "Unified dealer portal with centralized inventory and sales reporting",
      "Pre-configured compliance workflows for automotive standards",
      "Integrated service and warranty module with predictive maintenance"
    ],
    valueChain: [
      { stage: "Procurement", desc: "AI-powered supplier management with demand forecasting" },
      { stage: "Manufacturing", desc: "Production scheduling with quality assurance checkpoints" },
      { stage: "Distribution", desc: "Warehouse and logistics optimization across network" },
      { stage: "Sales", desc: "Dealer CRM and inventory integration" },
      { stage: "After-Sales", desc: "Service scheduling and warranty claims management" }
    ],
    benefits: [
      "50% reduction in supply chain visibility time",
      "One-stop solution eliminates need for multiple systems",
      "AI-first approach with predictive quality and maintenance",
      "Real-time compliance reporting and audit readiness",
      "Mobile app for dealer floor and service technicians"
    ]
  },
  "banking": {
    name: "Banking",
    description: "Enterprise banking and financial services platform",
    modules: ["Risk Management", "Portfolio Management", "Compliance", "Lending", "Finance", "Analytics"],
    features: ["Fraud Detection", "Regulatory Compliance", "Real-time Analytics", "Multi-currency Support"],
    problems: [
      "Complex regulatory compliance requirements across multiple jurisdictions",
      "Fraud detection and prevention with increasing sophistication of attacks",
      "Siloed customer data across multiple banking systems",
      "Manual reconciliation processes consuming significant resources",
      "Difficulty in real-time risk assessment and portfolio analysis"
    ],
    solutions: [
      "AI-driven fraud detection with machine learning pattern recognition",
      "Automated compliance workflow with audit trail and reporting",
      "360-degree customer view across all banking products",
      "Real-time reconciliation and settlement processes",
      "Predictive analytics for portfolio risk assessment"
    ],
    valueChain: [
      { stage: "Customer Acquisition", desc: "Digital onboarding with KYC/AML verification" },
      { stage: "Lending", desc: "AI-powered credit scoring and approval workflow" },
      { stage: "Treasury", desc: "Real-time fund management and currency trading" },
      { stage: "Risk Management", desc: "Portfolio monitoring with automated alerts" },
      { stage: "Compliance", desc: "Regulatory reporting and audit automation" }
    ],
    benefits: [
      "Reduce compliance violations by 90% with automated workflows",
      "Detect fraud 10x faster with AI pattern recognition",
      "One platform for retail, commercial, and investment banking",
      "Real-time regulatory reporting ready for audits",
      "Reduce manual processes by 70%"
    ]
  },
  "healthcare": {
    name: "Healthcare",
    description: "Healthcare provider and hospital management system",
    modules: ["Patient Management", "Clinical Data", "Billing", "Inventory", "HR", "Compliance"],
    features: ["HIPAA Compliance", "Medical Records", "Insurance Integration", "Appointment Scheduling"]
  },
  "retail": {
    name: "Retail & E-Commerce",
    description: "Omni-channel retail and e-commerce management",
    modules: ["POS", "Inventory", "E-Commerce", "CRM", "Finance", "Analytics"],
    features: ["Omni-channel Integration", "Loyalty Programs", "Real-time Inventory", "Sales Analytics"]
  },
  "manufacturing": {
    name: "Manufacturing",
    description: "Advanced manufacturing and production management",
    modules: ["MRP", "Production", "Quality", "Maintenance", "Supply Chain", "Finance"],
    features: ["Production Scheduling", "Quality Assurance", "Equipment Maintenance", "Supply Optimization"]
  },
  "logistics": {
    name: "Logistics",
    description: "Supply chain and logistics optimization",
    modules: ["Warehouse", "Transportation", "Tracking", "Procurement", "Finance", "Analytics"],
    features: ["Real-time Tracking", "Route Optimization", "Warehouse Management", "Predictive Analytics"]
  },
  "education": {
    name: "Education",
    description: "Educational institution and learning management",
    modules: ["Student Management", "Curriculum", "Assessments", "Finance", "HR", "Analytics"],
    features: ["Online Learning", "Grading System", "Parent Portal", "Alumni Management"]
  },
  "government": {
    name: "Government",
    description: "Public sector and government agency solutions",
    modules: ["Finance", "HR", "Compliance", "Citizen Services", "Analytics", "Reporting"],
    features: ["Budget Management", "Audit Trails", "Compliance Reporting", "Citizen Engagement"]
  },
};

export default function IndustryDetail() {
  const params = useParams();
  const slug = (params.slug || "").toLowerCase();
  const industry = industryData[slug] || {
    name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
    description: "Industry-specific ERP solutions",
    modules: ["Core ERP", "CRM", "Finance", "HR", "Analytics", "Compliance"],
    features: ["Pre-configured", "AI-Powered", "Multi-tenant", "Scalable"]
  };

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="public-hero px-4 py-24 max-w-7xl mx-auto">
          <h1 className="public-hero-title text-6xl font-bold mb-6">{industry.name} ERP Solution</h1>
          <p className="public-hero-subtitle text-2xl mb-12 max-w-3xl">{industry.description}</p>

          {/* Problems & Solutions */}
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="text-3xl font-bold mb-6">Common Challenges</h2>
              <ul className="space-y-3">
                {(industry as any).problems?.map((problem: string, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-red-500 font-bold">✕</span>
                    <span className="text-lg">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">How NexusAI Solves It</h2>
              <ul className="space-y-3">
                {(industry as any).solutions?.map((solution: string, i: number) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-lg">{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Value Chain Analysis */}
          {(industry as any).valueChain && (
            <div className="mb-20">
              <h2 className="text-3xl font-bold mb-8">Value Chain Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {(industry as any).valueChain.map((stage: any, i: number) => (
                  <Card key={i} className="p-6 hover-elevate">
                    <div className="text-sm font-bold text-primary mb-2">{i + 1}. {stage.stage}</div>
                    <p className="text-sm text-muted-foreground">{stage.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {(industry as any).benefits && (
            <div className="mb-20">
              <h2 className="text-3xl font-bold mb-8">Key Benefits of One-Stop AI-First Solution</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {(industry as any).benefits.map((benefit: string, i: number) => (
                  <div key={i} className="flex gap-3 p-4 bg-muted rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modules & Features */}
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="text-3xl font-bold mb-6">Modules Included</h2>
              <div className="space-y-3">
                {industry.modules.map((module, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" style={{ color: `hsl(var(--primary))` }} />
                    <span className="text-lg">{module}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">Key Features</h2>
              <div className="space-y-3">
                {industry.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" style={{ color: `hsl(var(--primary))` }} />
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card className="p-8 text-center border-l-4 public-accent-border" style={{ backgroundColor: `hsl(var(--primary) / 0.15)`, borderColor: `hsl(var(--primary) / 0.4)` }}>
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
            <p style={{ color: `hsl(var(--muted-foreground))` }} className="mb-6 text-lg">Get instant access to a fully seeded demo environment for {industry.name}</p>
            <Button size="lg" className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white font-bold" data-testid="button-request-demo">
              Request Demo <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
