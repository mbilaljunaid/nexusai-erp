import { useParams, Link } from "wouter";
import { Header, Footer } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Bot, Sparkles, Brain, Zap } from "lucide-react";

import healthcareHero from "@assets/stock_images/modern_hospital_heal_f0393426.jpg";
import retailHero from "@assets/stock_images/retail_store_shoppin_143d3777.jpg";
import manufacturingHero from "@assets/stock_images/industrial_manufactu_283e69f0.jpg";
import logisticsHero from "@assets/stock_images/logistics_warehouse__5ce59285.jpg";
import educationHero from "@assets/stock_images/modern_education_uni_aed4c4fe.jpg";
import governmentHero from "@assets/stock_images/government_building__65e1f24d.jpg";
import automotiveHero from "@assets/stock_images/automotive_car_deale_62f1f498.jpg";
import bankingHero from "@assets/stock_images/banking_finance_corp_f11367f7.jpg";

interface IndustryInfo {
  name: string;
  description: string;
  modules: string[];
  features: string[];
  problems?: string[];
  solutions?: string[];
  valueChain?: { stage: string; desc: string }[];
  benefits?: string[];
  heroImage?: string;
  aiFeatures?: { title: string; desc: string }[];
}

const industryData: Record<string, IndustryInfo> = {
  "automotive": {
    name: "Automotive",
    description: "Comprehensive ERP solutions for automotive manufacturing, dealers, and supply chain",
    heroImage: automotiveHero,
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
    ],
    aiFeatures: [
      { title: "Predictive Quality Control", desc: "AI detects defects before they occur using production data patterns" },
      { title: "Demand Forecasting", desc: "ML models predict parts demand across dealer network" },
      { title: "Smart Warranty Claims", desc: "Automated claim processing with fraud detection" }
    ]
  },
  "banking-finance": {
    name: "Banking & Finance",
    description: "Enterprise banking and financial services platform",
    heroImage: bankingHero,
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
    ],
    aiFeatures: [
      { title: "AI Fraud Detection", desc: "Real-time transaction monitoring with ML-based anomaly detection" },
      { title: "Credit Scoring Engine", desc: "Predictive models for loan approval and risk assessment" },
      { title: "Regulatory Copilot", desc: "AI assistant for compliance questions and audit preparation" }
    ]
  },
  "healthcare": {
    name: "Healthcare",
    description: "Healthcare provider and hospital management system",
    heroImage: healthcareHero,
    modules: ["Patient Management", "Clinical Data", "Billing", "Inventory", "HR", "Compliance"],
    features: ["HIPAA Compliance", "Medical Records", "Insurance Integration", "Appointment Scheduling"],
    problems: [
      "Managing patient data across departments while maintaining HIPAA compliance",
      "Complex insurance billing and claims management processes",
      "Coordinating care across multiple providers and facilities",
      "Inventory management for medical supplies and pharmaceuticals",
      "Staff scheduling and resource allocation challenges"
    ],
    solutions: [
      "Unified patient records with role-based access control and audit trails",
      "Automated insurance verification and claims submission",
      "Care coordination platform with real-time provider communication",
      "Smart inventory management with automated reordering",
      "AI-powered staff scheduling based on patient volume predictions"
    ],
    valueChain: [
      { stage: "Patient Intake", desc: "Digital registration with insurance verification" },
      { stage: "Clinical Care", desc: "EMR integration with decision support" },
      { stage: "Billing", desc: "Automated coding and claims submission" },
      { stage: "Follow-up", desc: "Patient engagement and care continuity" },
      { stage: "Analytics", desc: "Population health and outcomes tracking" }
    ],
    benefits: [
      "100% HIPAA compliance with built-in security controls",
      "Reduce claim denials by 60% with automated verification",
      "Improve patient satisfaction with streamlined workflows",
      "Real-time visibility into bed capacity and resources",
      "Predictive analytics for patient outcomes"
    ],
    aiFeatures: [
      { title: "Clinical Decision Support", desc: "AI-assisted diagnosis suggestions and treatment recommendations" },
      { title: "Predictive Patient Flow", desc: "ML models forecast admission rates and resource needs" },
      { title: "Smart Scheduling", desc: "Optimized appointment booking based on provider capacity" }
    ]
  },
  "retail-e-commerce": {
    name: "Retail & E-Commerce",
    description: "Omni-channel retail and e-commerce management",
    heroImage: retailHero,
    modules: ["POS", "Inventory", "E-Commerce", "CRM", "Finance", "Analytics"],
    features: ["Omni-channel Integration", "Loyalty Programs", "Real-time Inventory", "Sales Analytics"],
    problems: [
      "Disconnected online and offline customer experiences",
      "Inventory discrepancies across channels and locations",
      "Ineffective customer loyalty and retention programs",
      "Limited visibility into customer behavior and preferences",
      "Complex pricing and promotion management"
    ],
    solutions: [
      "Unified commerce platform with seamless channel integration",
      "Real-time inventory sync across all sales channels",
      "AI-powered loyalty engine with personalized rewards",
      "360-degree customer view with purchase history and preferences",
      "Dynamic pricing engine with automated promotion management"
    ],
    valueChain: [
      { stage: "Merchandising", desc: "AI-driven assortment planning and pricing" },
      { stage: "Inventory", desc: "Real-time stock visibility across channels" },
      { stage: "Sales", desc: "Unified POS and e-commerce transactions" },
      { stage: "Fulfillment", desc: "Omni-channel order management" },
      { stage: "Loyalty", desc: "Personalized customer engagement" }
    ],
    benefits: [
      "20% increase in customer retention with AI-powered loyalty",
      "Real-time inventory accuracy across all channels",
      "Personalized shopping experiences at scale",
      "Reduce stockouts by 40% with predictive replenishment",
      "Unified view of customer across all touchpoints"
    ],
    aiFeatures: [
      { title: "Demand Forecasting", desc: "Predict sales by product, location, and season" },
      { title: "Personalization Engine", desc: "AI-powered product recommendations and offers" },
      { title: "Price Optimization", desc: "Dynamic pricing based on demand and competition" }
    ]
  },
  "manufacturing": {
    name: "Manufacturing",
    description: "Advanced manufacturing and production management",
    heroImage: manufacturingHero,
    modules: ["MRP", "Production", "Quality", "Maintenance", "Supply Chain", "Finance"],
    features: ["Production Scheduling", "Quality Assurance", "Equipment Maintenance", "Supply Optimization"],
    problems: [
      "Inefficient production planning leading to delays and excess inventory",
      "Quality control issues causing costly rework and recalls",
      "Unplanned equipment downtime impacting production targets",
      "Complex supply chain coordination with multiple suppliers",
      "Difficulty tracking costs and profitability by product"
    ],
    solutions: [
      "AI-optimized production scheduling with constraint management",
      "Real-time quality monitoring with automated defect detection",
      "Predictive maintenance to prevent equipment failures",
      "Supplier collaboration portal with performance tracking",
      "Activity-based costing with real-time profitability analysis"
    ],
    valueChain: [
      { stage: "Planning", desc: "Demand-driven production scheduling" },
      { stage: "Procurement", desc: "Automated supplier management and ordering" },
      { stage: "Production", desc: "Real-time shop floor monitoring" },
      { stage: "Quality", desc: "Inline inspection and defect tracking" },
      { stage: "Delivery", desc: "Order fulfillment and logistics" }
    ],
    benefits: [
      "30% improvement in production efficiency",
      "Reduce quality defects by 50% with AI inspection",
      "25% reduction in unplanned downtime",
      "Real-time visibility into production costs",
      "Seamless supplier collaboration and tracking"
    ],
    aiFeatures: [
      { title: "Predictive Maintenance", desc: "ML models predict equipment failures before they occur" },
      { title: "Quality Vision AI", desc: "Computer vision for automated defect detection" },
      { title: "Production Optimizer", desc: "AI scheduling for maximum throughput" }
    ]
  },
  "logistics-transportation": {
    name: "Logistics & Transportation",
    description: "Supply chain and logistics optimization",
    heroImage: logisticsHero,
    modules: ["Warehouse", "Transportation", "Tracking", "Procurement", "Finance", "Analytics"],
    features: ["Real-time Tracking", "Route Optimization", "Warehouse Management", "Predictive Analytics"],
    problems: [
      "Inefficient route planning leading to higher fuel costs and delays",
      "Limited visibility into shipment status and location",
      "Warehouse space utilization and picking efficiency challenges",
      "Driver scheduling and fleet management complexity",
      "Difficulty managing carrier contracts and rates"
    ],
    solutions: [
      "AI-powered route optimization considering traffic and constraints",
      "Real-time GPS tracking with automated customer notifications",
      "Smart warehouse management with optimized picking routes",
      "Automated driver scheduling with compliance tracking",
      "Carrier management platform with rate comparison"
    ],
    valueChain: [
      { stage: "Order Receipt", desc: "Automated order processing and validation" },
      { stage: "Warehouse", desc: "Pick, pack, and ship optimization" },
      { stage: "Transportation", desc: "Route planning and carrier selection" },
      { stage: "Delivery", desc: "Real-time tracking and proof of delivery" },
      { stage: "Returns", desc: "Reverse logistics management" }
    ],
    benefits: [
      "15% reduction in fuel costs with optimized routing",
      "Real-time shipment visibility for customers",
      "30% improvement in warehouse picking efficiency",
      "Automated carrier selection based on cost and service",
      "Reduce empty miles with load optimization"
    ],
    aiFeatures: [
      { title: "Route Intelligence", desc: "AI optimizes routes based on traffic, weather, and constraints" },
      { title: "Demand Prediction", desc: "Forecast shipping volumes for capacity planning" },
      { title: "Smart Warehouse", desc: "ML-optimized slotting and picking paths" }
    ]
  },
  "education": {
    name: "Education",
    description: "Educational institution and learning management",
    heroImage: educationHero,
    modules: ["Student Management", "Curriculum", "Assessments", "Finance", "HR", "Analytics"],
    features: ["Online Learning", "Grading System", "Parent Portal", "Alumni Management"],
    problems: [
      "Managing student lifecycle from admission to graduation",
      "Tracking academic progress and identifying at-risk students",
      "Coordinating schedules across courses, faculty, and facilities",
      "Parent and student communication challenges",
      "Accreditation compliance and reporting requirements"
    ],
    solutions: [
      "Complete student information system from inquiry to alumni",
      "AI-powered early warning system for student success",
      "Automated scheduling with conflict detection",
      "Multi-channel communication hub for all stakeholders",
      "Automated accreditation reporting and compliance tracking"
    ],
    valueChain: [
      { stage: "Enrollment", desc: "Online applications and admissions workflow" },
      { stage: "Academics", desc: "Course management and grading" },
      { stage: "Engagement", desc: "Student activities and support services" },
      { stage: "Assessment", desc: "Testing and outcome measurement" },
      { stage: "Alumni", desc: "Graduate tracking and fundraising" }
    ],
    benefits: [
      "Improve student retention with early intervention",
      "Reduce administrative burden by 40%",
      "Real-time parent and student communication",
      "Automated compliance reporting for accreditation",
      "Complete visibility into student success metrics"
    ],
    aiFeatures: [
      { title: "Student Success Predictor", desc: "Identify at-risk students early with ML analytics" },
      { title: "Adaptive Learning", desc: "Personalized learning paths based on performance" },
      { title: "Smart Scheduling", desc: "AI-optimized class and resource scheduling" }
    ]
  },
  "government-public-sector": {
    name: "Government & Public Sector",
    description: "Public sector and government agency solutions",
    heroImage: governmentHero,
    modules: ["Finance", "HR", "Compliance", "Citizen Services", "Analytics", "Reporting"],
    features: ["Budget Management", "Audit Trails", "Compliance Reporting", "Citizen Engagement"],
    problems: [
      "Budget management across multiple departments and fiscal years",
      "Citizen service delivery inefficiencies and long wait times",
      "Compliance with government regulations and audit requirements",
      "Inter-agency coordination and data sharing challenges",
      "Grant management and reporting complexity"
    ],
    solutions: [
      "Comprehensive fund accounting with budget controls",
      "Digital citizen services portal with self-service options",
      "Automated compliance tracking with complete audit trails",
      "Secure inter-agency data sharing and collaboration",
      "Grant lifecycle management with automated reporting"
    ],
    valueChain: [
      { stage: "Planning", desc: "Strategic planning and budget formulation" },
      { stage: "Procurement", desc: "Compliant purchasing and vendor management" },
      { stage: "Service Delivery", desc: "Citizen-facing programs and services" },
      { stage: "Compliance", desc: "Regulatory adherence and auditing" },
      { stage: "Reporting", desc: "Transparency and public accountability" }
    ],
    benefits: [
      "100% audit compliance with automated trail",
      "50% reduction in citizen service wait times",
      "Real-time budget visibility across agencies",
      "Streamlined grant management and reporting",
      "Improved inter-agency collaboration"
    ],
    aiFeatures: [
      { title: "Budget Forecasting", desc: "AI predicts revenue and expenditure trends" },
      { title: "Fraud Detection", desc: "ML identifies anomalies in transactions and claims" },
      { title: "Citizen Chatbot", desc: "AI-powered service assistant for common inquiries" }
    ]
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

  const aiIcons = [Bot, Sparkles, Brain, Zap];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section with Image */}
        {industry.heroImage && (
          <section className="relative h-[400px] overflow-hidden">
            <img 
              src={industry.heroImage} 
              alt={`${industry.name} industry`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
            <div className="relative z-10 h-full flex items-center px-4">
              <div className="max-w-7xl mx-auto w-full">
                <Badge className="mb-4 bg-blue-600/80 text-white border-blue-400">INDUSTRY SOLUTION</Badge>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{industry.name} ERP</h1>
                <p className="text-xl text-gray-200 max-w-2xl mb-6">{industry.description}</p>
                <div className="flex flex-wrap gap-3">
                  <Link to={`/demo?industry=${industry.name}`}>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-request-demo-hero">
                      Request Demo <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/marketplace">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-marketplace">
                      Browse Marketplace
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Fallback hero without image */}
        {!industry.heroImage && (
          <section className="public-hero px-4 py-24 max-w-7xl mx-auto">
            <h1 className="public-hero-title text-6xl font-bold mb-6">{industry.name} ERP Solution</h1>
            <p className="public-hero-subtitle text-2xl mb-12 max-w-3xl">{industry.description}</p>
          </section>
        )}

        <section className="px-4 py-16 max-w-7xl mx-auto">
          {/* AI Features Section */}
          {industry.aiFeatures && industry.aiFeatures.length > 0 && (
            <div className="mb-20">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="w-8 h-8 text-blue-500" />
                <h2 className="text-3xl font-bold">AI-Powered Capabilities</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {industry.aiFeatures.map((feature, i) => {
                  const IconComponent = aiIcons[i % aiIcons.length];
                  return (
                    <Card key={i} className="p-6 border-l-4 border-l-blue-500 hover-elevate">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <IconComponent className="w-5 h-5 text-blue-500" />
                        </div>
                        <h3 className="font-bold text-lg">{feature.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Problems & Solutions */}
          {industry.problems && industry.solutions && (
            <div className="grid md:grid-cols-2 gap-12 mb-20">
              <div>
                <h2 className="text-3xl font-bold mb-6">Common Challenges</h2>
                <ul className="space-y-3">
                  {industry.problems.map((problem: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-red-500 font-bold flex-shrink-0">X</span>
                      <span className="text-lg">{problem}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">How NexusAI Solves It</h2>
                <ul className="space-y-3">
                  {industry.solutions.map((solution: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-lg">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Value Chain Analysis */}
          {industry.valueChain && (
            <div className="mb-20">
              <h2 className="text-3xl font-bold mb-8">Value Chain Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {industry.valueChain.map((stage, i: number) => (
                  <Card key={i} className="p-6 hover-elevate">
                    <div className="text-sm font-bold text-primary mb-2">{i + 1}. {stage.stage}</div>
                    <p className="text-sm text-muted-foreground">{stage.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {industry.benefits && (
            <div className="mb-20">
              <h2 className="text-3xl font-bold mb-8">Key Benefits of One-Stop AI-First Solution</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {industry.benefits.map((benefit: string, i: number) => (
                  <div key={i} className="flex gap-3 p-4 bg-muted rounded-md">
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
                    <CheckCircle className="w-5 h-5 text-primary" />
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
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <Card className="p-8 text-center bg-gradient-to-r from-blue-600 to-blue-700 border-none">
            <h2 className="text-3xl font-bold mb-4 text-white">Ready to Transform Your Business?</h2>
            <p className="text-blue-100 mb-6 text-lg">Get instant access to a fully seeded demo environment for {industry.name}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={`/demo?industry=${industry.name}`}>
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50" data-testid="button-request-demo">
                  Request Demo <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-view-marketplace">
                  View Marketplace
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
