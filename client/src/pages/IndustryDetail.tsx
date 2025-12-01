import { useParams } from "wouter";
import { Header, Footer } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const industryData: Record<string, { name: string; description: string; modules: string[]; features: string[] }> = {
  "automotive": {
    name: "Automotive"
    description: "Comprehensive ERP solutions for automotive manufacturing, dealers, and supply chain"
    modules: ["Production Planning", "Dealer Inventory", "Sales CRM", "After-Sales Service", "Finance", "HR", "Supply Chain"]
    features: ["Quality Control", "Compliance Tracking", "Dealer Management", "Service Scheduling"]
  }
  "banking": {
    name: "Banking"
    description: "Enterprise banking and financial services platform"
    modules: ["Risk Management", "Portfolio Management", "Compliance", "Lending", "Finance", "Analytics"]
    features: ["Fraud Detection", "Regulatory Compliance", "Real-time Analytics", "Multi-currency Support"]
  }
  "healthcare": {
    name: "Healthcare"
    description: "Healthcare provider and hospital management system"
    modules: ["Patient Management", "Clinical Data", "Billing", "Inventory", "HR", "Compliance"]
    features: ["HIPAA Compliance", "Medical Records", "Insurance Integration", "Appointment Scheduling"]
  }
  "retail": {
    name: "Retail & E-Commerce"
    description: "Omni-channel retail and e-commerce management"
    modules: ["POS", "Inventory", "E-Commerce", "CRM", "Finance", "Analytics"]
    features: ["Omni-channel Integration", "Loyalty Programs", "Real-time Inventory", "Sales Analytics"]
  }
  "manufacturing": {
    name: "Manufacturing"
    description: "Advanced manufacturing and production management"
    modules: ["MRP", "Production", "Quality", "Maintenance", "Supply Chain", "Finance"]
    features: ["Production Scheduling", "Quality Assurance", "Equipment Maintenance", "Supply Optimization"]
  }
  "logistics": {
    name: "Logistics"
    description: "Supply chain and logistics optimization"
    modules: ["Warehouse", "Transportation", "Tracking", "Procurement", "Finance", "Analytics"]
    features: ["Real-time Tracking", "Route Optimization", "Warehouse Management", "Predictive Analytics"]
  }
  "education": {
    name: "Education"
    description: "Educational institution and learning management"
    modules: ["Student Management", "Curriculum", "Assessments", "Finance", "HR", "Analytics"]
    features: ["Online Learning", "Grading System", "Parent Portal", "Alumni Management"]
  }
  "government": {
    name: "Government"
    description: "Public sector and government agency solutions"
    modules: ["Finance", "HR", "Compliance", "Citizen Services", "Analytics", "Reporting"]
    features: ["Budget Management", "Audit Trails", "Compliance Reporting", "Citizen Engagement"]
  }
};

export default function IndustryDetail() {
  const params = useParams();
  const slug = (params.slug || "").toLowerCase();
  const industry = industryData[slug] || {
    name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ")
    description: "Industry-specific ERP solutions"
    modules: ["Core ERP", "CRM", "Finance", "HR", "Analytics", "Compliance"]
    features: ["Pre-configured", "AI-Powered", "Multi-tenant", "Scalable"]
  };

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="public-hero px-4 py-24 max-w-7xl mx-auto">
          <h1 className="public-hero-title text-6xl font-bold mb-6">{industry.name} ERP Solution</h1>
          <p className="public-hero-subtitle text-2xl mb-12 max-w-3xl">{industry.description}</p>

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
            <p style={{ color: `hsl(var(--muted-foreground))` }} className="mb-6 text-lg">Get instant access to a fully seeded demo environment</p>
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
