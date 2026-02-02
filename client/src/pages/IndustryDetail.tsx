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
  "telecom": {
    name: "Telecom",
    description: "Telecommunications and network service management",
    modules: ["Network Operations", "Billing", "CRM", "Service Provisioning", "Analytics", "Support"],
    features: ["Real-time Network Monitoring", "Usage Billing", "Subscriber Management", "Service Activation"],
    problems: [
      "Network outages and service quality issues affecting customer satisfaction",
      "Complex billing systems with multiple rate plans and usage patterns",
      "Subscriber churn due to competitive market pressures",
      "Managing infrastructure across distributed locations",
      "Real-time fraud detection in call and data usage"
    ],
    solutions: [
      "AI-powered network monitoring with predictive maintenance",
      "Unified billing platform supporting complex rate structures",
      "Churn prediction with proactive retention programs",
      "Centralized infrastructure management with remote diagnostics",
      "Real-time fraud detection using ML pattern recognition"
    ],
    valueChain: [
      { stage: "Network Ops", desc: "Infrastructure monitoring and maintenance" },
      { stage: "Provisioning", desc: "Service activation and configuration" },
      { stage: "Billing", desc: "Usage metering and invoicing" },
      { stage: "Customer Care", desc: "Support and issue resolution" },
      { stage: "Analytics", desc: "Performance and customer insights" }
    ],
    benefits: [
      "99.9% network uptime with predictive maintenance",
      "30% reduction in customer churn with AI retention",
      "Real-time fraud detection preventing revenue loss",
      "Automated service provisioning in minutes",
      "Unified view of subscriber across all services"
    ],
    aiFeatures: [
      { title: "Network Intelligence", desc: "Predict and prevent outages before they occur" },
      { title: "Churn Predictor", desc: "Identify at-risk subscribers for retention" },
      { title: "Usage Anomaly Detection", desc: "Real-time fraud detection in traffic patterns" }
    ]
  },
  "insurance": {
    name: "Insurance",
    description: "Insurance policy and claims management platform",
    modules: ["Policy Admin", "Claims Processing", "Underwriting", "Actuarial", "CRM", "Compliance"],
    features: ["Policy Lifecycle", "Claims Automation", "Risk Assessment", "Agent Portal"],
    problems: [
      "Lengthy claims processing times frustrating policyholders",
      "Inaccurate risk assessment leading to underpriced policies",
      "Fraudulent claims costing significant revenue",
      "Complex regulatory compliance across jurisdictions",
      "Agent productivity and commission tracking challenges"
    ],
    solutions: [
      "AI-powered claims automation with instant processing",
      "ML-based underwriting with real-time risk scoring",
      "Fraud detection engine analyzing claim patterns",
      "Automated compliance monitoring with regulatory updates",
      "Agent portal with real-time commission visibility"
    ],
    valueChain: [
      { stage: "Sales", desc: "Quote generation and policy binding" },
      { stage: "Underwriting", desc: "Risk assessment and pricing" },
      { stage: "Policy Admin", desc: "Lifecycle management and renewals" },
      { stage: "Claims", desc: "Processing and settlement" },
      { stage: "Retention", desc: "Customer engagement and renewals" }
    ],
    benefits: [
      "80% faster claims processing with automation",
      "Reduce fraudulent claims by 40% with AI detection",
      "Improved loss ratios with accurate risk scoring",
      "Automated regulatory compliance reporting",
      "Higher agent productivity with self-service tools"
    ],
    aiFeatures: [
      { title: "Instant Claims", desc: "AI processes simple claims in minutes" },
      { title: "Fraud Shield", desc: "ML detects suspicious claim patterns" },
      { title: "Smart Underwriting", desc: "Risk scoring using multiple data sources" }
    ]
  },
  "fashion": {
    name: "Fashion & Apparel",
    description: "Fashion retail and apparel manufacturing management",
    modules: ["Design", "Manufacturing", "Inventory", "Retail", "E-Commerce", "Analytics"],
    features: ["Trend Analysis", "Size/Color Management", "Season Planning", "Supplier Management"],
    problems: [
      "Rapid trend cycles requiring quick design-to-market",
      "Size and color inventory complexity across channels",
      "Seasonal demand forecasting challenges",
      "Sustainability tracking and ethical sourcing requirements",
      "Returns management for online sales"
    ],
    solutions: [
      "AI trend analysis with social media integration",
      "Advanced size/color matrix management",
      "Season-based demand forecasting with ML",
      "Supply chain transparency with sustainability metrics",
      "Optimized returns processing with resale integration"
    ],
    valueChain: [
      { stage: "Design", desc: "Trend-based collection planning" },
      { stage: "Sourcing", desc: "Sustainable supplier management" },
      { stage: "Production", desc: "Manufacturing coordination" },
      { stage: "Distribution", desc: "Omni-channel fulfillment" },
      { stage: "Retail", desc: "Store and e-commerce operations" }
    ],
    benefits: [
      "50% faster design-to-market cycle",
      "Reduce inventory markdowns by 30%",
      "Complete supply chain sustainability tracking",
      "Improved size/color availability optimization",
      "Streamlined returns and resale management"
    ],
    aiFeatures: [
      { title: "Trend Predictor", desc: "AI analyzes social media for emerging trends" },
      { title: "Size Optimization", desc: "ML recommends optimal size distribution" },
      { title: "Demand Sensing", desc: "Real-time demand signals from multiple sources" }
    ]
  },
  "hospitality": {
    name: "Hospitality",
    description: "Hotel and hospitality operations management",
    modules: ["Property Management", "Reservations", "Revenue Management", "F&B", "Housekeeping", "Analytics"],
    features: ["Booking Engine", "Dynamic Pricing", "Guest Experience", "Staff Scheduling"],
    problems: [
      "Revenue leakage from suboptimal pricing strategies",
      "Guest experience inconsistency across properties",
      "Housekeeping and maintenance coordination",
      "Staff scheduling during variable demand",
      "Managing multiple distribution channels"
    ],
    solutions: [
      "AI-powered dynamic pricing maximizing revenue",
      "Unified guest profiles with personalized experiences",
      "Real-time housekeeping and maintenance coordination",
      "Demand-based staff scheduling optimization",
      "Central reservation system with channel management"
    ],
    valueChain: [
      { stage: "Booking", desc: "Multi-channel reservation management" },
      { stage: "Check-in", desc: "Guest arrival and room assignment" },
      { stage: "Stay", desc: "Service delivery and guest experience" },
      { stage: "Check-out", desc: "Billing and departure process" },
      { stage: "Loyalty", desc: "Post-stay engagement and retention" }
    ],
    benefits: [
      "15% increase in RevPAR with dynamic pricing",
      "Higher guest satisfaction with personalization",
      "30% improvement in housekeeping efficiency",
      "Optimized labor costs with smart scheduling",
      "Unified view across all booking channels"
    ],
    aiFeatures: [
      { title: "Smart Pricing", desc: "Dynamic rates based on demand signals" },
      { title: "Guest Intelligence", desc: "Personalized recommendations and offers" },
      { title: "Operations Optimizer", desc: "AI scheduling for staff and maintenance" }
    ]
  },
  "pharma": {
    name: "Pharmaceuticals",
    description: "Pharmaceutical manufacturing and distribution",
    modules: ["R&D", "Manufacturing", "Quality", "Regulatory", "Supply Chain", "Sales"],
    features: ["Batch Tracking", "FDA Compliance", "Clinical Trials", "Drug Safety"],
    problems: [
      "Complex regulatory compliance requirements globally",
      "Drug development lifecycle management",
      "Batch traceability and recall management",
      "Clinical trial data management and reporting",
      "Drug safety monitoring and adverse event reporting"
    ],
    solutions: [
      "Pre-configured regulatory workflows for FDA, EMA, etc.",
      "End-to-end R&D lifecycle management",
      "Complete batch genealogy with instant recall capability",
      "Integrated clinical trial management system",
      "Automated adverse event detection and reporting"
    ],
    valueChain: [
      { stage: "Research", desc: "Drug discovery and development" },
      { stage: "Clinical", desc: "Trial management and data collection" },
      { stage: "Manufacturing", desc: "GMP-compliant production" },
      { stage: "Distribution", desc: "Cold chain and logistics" },
      { stage: "Pharmacovigilance", desc: "Safety monitoring and reporting" }
    ],
    benefits: [
      "100% regulatory compliance with audit trails",
      "Accelerate drug development with integrated workflows",
      "Complete batch traceability in seconds",
      "Streamlined clinical trial management",
      "Proactive drug safety monitoring with AI"
    ],
    aiFeatures: [
      { title: "Drug Discovery AI", desc: "ML accelerates compound screening" },
      { title: "Safety Signals", desc: "AI detects adverse event patterns" },
      { title: "Compliance Assistant", desc: "Automated regulatory document preparation" }
    ]
  },
  "cpg": {
    name: "Consumer Packaged Goods",
    description: "CPG manufacturing and distribution management",
    modules: ["Production", "Inventory", "Trade Promotion", "Distribution", "Analytics", "CRM"],
    features: ["Demand Planning", "Trade Spending", "Shelf Analytics", "Route Optimization"],
    problems: [
      "Demand volatility and forecast accuracy challenges",
      "Trade promotion effectiveness measurement",
      "Retail execution and shelf compliance",
      "Route-to-market optimization",
      "Consumer preference data integration"
    ],
    solutions: [
      "AI-powered demand sensing with external signals",
      "Trade promotion optimization with ROI analytics",
      "Image recognition for shelf compliance auditing",
      "Route optimization for direct store delivery",
      "Consumer insights integration from multiple sources"
    ],
    valueChain: [
      { stage: "Innovation", desc: "New product development" },
      { stage: "Planning", desc: "Demand and supply planning" },
      { stage: "Manufacturing", desc: "Production scheduling" },
      { stage: "Distribution", desc: "Warehouse and logistics" },
      { stage: "Retail", desc: "Trade execution and promotion" }
    ],
    benefits: [
      "25% improvement in forecast accuracy",
      "Better trade promotion ROI visibility",
      "Real-time shelf compliance monitoring",
      "Optimized route-to-market efficiency",
      "Deeper consumer insight integration"
    ],
    aiFeatures: [
      { title: "Demand Sensing", desc: "Real-time demand signals from POS data" },
      { title: "Promo Optimizer", desc: "AI recommends optimal trade spending" },
      { title: "Shelf Vision", desc: "Image recognition for retail execution" }
    ]
  },
  "energy": {
    name: "Energy & Utilities",
    description: "Energy production and utility management",
    modules: ["Asset Management", "Grid Operations", "Billing", "Customer Service", "Compliance", "Analytics"],
    features: ["Smart Grid", "Outage Management", "Meter Data", "Demand Response"],
    problems: [
      "Aging infrastructure and maintenance planning",
      "Grid reliability and outage management",
      "Renewable energy integration challenges",
      "Customer billing accuracy and disputes",
      "Regulatory compliance across jurisdictions"
    ],
    solutions: [
      "Predictive maintenance for critical assets",
      "Real-time grid monitoring with automated restoration",
      "Renewable energy forecasting and integration",
      "Smart meter data management with accurate billing",
      "Automated regulatory compliance and reporting"
    ],
    valueChain: [
      { stage: "Generation", desc: "Power production optimization" },
      { stage: "Transmission", desc: "Grid operations and monitoring" },
      { stage: "Distribution", desc: "Local delivery and metering" },
      { stage: "Customer", desc: "Billing and service management" },
      { stage: "Compliance", desc: "Regulatory adherence and reporting" }
    ],
    benefits: [
      "30% reduction in unplanned downtime",
      "Improved grid reliability with real-time monitoring",
      "Better renewable energy forecasting accuracy",
      "Reduced billing disputes with smart meter data",
      "Automated regulatory compliance"
    ],
    aiFeatures: [
      { title: "Asset Intelligence", desc: "Predict equipment failures before they occur" },
      { title: "Grid Optimizer", desc: "AI balances supply and demand in real-time" },
      { title: "Renewable Forecast", desc: "ML predicts solar and wind generation" }
    ]
  },
  "audit": {
    name: "Audit & Compliance",
    description: "Audit, risk, and compliance management platform",
    modules: ["Internal Audit", "Risk Management", "Compliance", "GRC", "Analytics", "Reporting"],
    features: ["Audit Planning", "Risk Assessment", "Control Testing", "Issue Tracking"],
    problems: [
      "Manual audit processes consuming significant resources",
      "Risk identification across multiple business units",
      "Compliance monitoring across regulations",
      "Audit evidence management and documentation",
      "Reporting to board and regulators"
    ],
    solutions: [
      "Automated audit workflows with risk-based planning",
      "Continuous risk monitoring with real-time alerts",
      "Multi-regulation compliance framework mapping",
      "Digital evidence collection and management",
      "Automated board and regulatory reporting"
    ],
    valueChain: [
      { stage: "Planning", desc: "Risk-based audit planning" },
      { stage: "Fieldwork", desc: "Testing and evidence collection" },
      { stage: "Reporting", desc: "Finding documentation and communication" },
      { stage: "Remediation", desc: "Issue tracking and resolution" },
      { stage: "Monitoring", desc: "Continuous control assessment" }
    ],
    benefits: [
      "50% reduction in audit cycle time",
      "Real-time risk visibility across organization",
      "Unified compliance view for multiple regulations",
      "Digital audit trail for all evidence",
      "Automated regulatory reporting"
    ],
    aiFeatures: [
      { title: "Risk Intelligence", desc: "AI identifies emerging risk areas" },
      { title: "Anomaly Detection", desc: "ML flags unusual transactions for review" },
      { title: "Control Testing", desc: "Automated testing with continuous monitoring" }
    ]
  },
  "business-services": {
    name: "Business Services",
    description: "Professional and business services management",
    modules: ["Project Management", "Time & Expense", "Resource Planning", "Billing", "CRM", "Analytics"],
    features: ["Project Tracking", "Utilization Management", "Client Billing", "Skills Management"],
    problems: [
      "Resource utilization and capacity planning",
      "Accurate time tracking and billing",
      "Project profitability visibility",
      "Skills matching and workforce planning",
      "Client engagement and satisfaction tracking"
    ],
    solutions: [
      "AI-optimized resource allocation and scheduling",
      "Mobile time capture with intelligent categorization",
      "Real-time project profitability dashboards",
      "Skills-based resource matching",
      "Client 360 with engagement analytics"
    ],
    valueChain: [
      { stage: "Sales", desc: "Opportunity and proposal management" },
      { stage: "Staffing", desc: "Resource allocation and scheduling" },
      { stage: "Delivery", desc: "Project execution and tracking" },
      { stage: "Billing", desc: "Time capture and invoicing" },
      { stage: "Analytics", desc: "Profitability and utilization insights" }
    ],
    benefits: [
      "15% improvement in billable utilization",
      "Real-time project profitability visibility",
      "Faster resource allocation with AI matching",
      "Reduced billing disputes with accurate tracking",
      "Improved client satisfaction and retention"
    ],
    aiFeatures: [
      { title: "Resource Matcher", desc: "AI recommends optimal team composition" },
      { title: "Project Predictor", desc: "ML forecasts project completion and risks" },
      { title: "Time Intelligence", desc: "Smart time categorization and reminders" }
    ]
  },
  "carrier": {
    name: "Carrier & Shipping",
    description: "Carrier and freight management solutions",
    modules: ["Fleet Management", "Dispatch", "Tracking", "Rating", "Billing", "Analytics"],
    features: ["Route Optimization", "Load Matching", "Driver Management", "Rate Management"],
    problems: [
      "Empty miles and load optimization",
      "Driver scheduling and HOS compliance",
      "Real-time shipment visibility",
      "Rate management and contract compliance",
      "Fuel cost management"
    ],
    solutions: [
      "AI-powered load matching and route optimization",
      "Automated HOS tracking with compliance alerts",
      "Real-time GPS tracking with customer notifications",
      "Dynamic rating engine with contract management",
      "Fuel optimization with route planning"
    ],
    valueChain: [
      { stage: "Booking", desc: "Load acquisition and matching" },
      { stage: "Dispatch", desc: "Driver assignment and routing" },
      { stage: "Transit", desc: "Real-time tracking and updates" },
      { stage: "Delivery", desc: "POD capture and confirmation" },
      { stage: "Settlement", desc: "Billing and payment processing" }
    ],
    benefits: [
      "20% reduction in empty miles",
      "100% HOS compliance with automation",
      "Real-time visibility for all shipments",
      "Optimized rates with market intelligence",
      "Reduced fuel costs with smart routing"
    ],
    aiFeatures: [
      { title: "Load Matcher", desc: "AI optimizes load-to-truck matching" },
      { title: "Route Intelligence", desc: "ML considers traffic, weather, and constraints" },
      { title: "Fuel Optimizer", desc: "Predicts optimal fuel stops and purchasing" }
    ]
  },
  "clinical": {
    name: "Clinical Services",
    description: "Clinical research and laboratory management",
    modules: ["Lab Management", "Sample Tracking", "Data Management", "Compliance", "Reporting", "Analytics"],
    features: ["LIMS Integration", "Protocol Management", "Quality Assurance", "Regulatory Reporting"],
    problems: [
      "Sample chain of custody and tracking",
      "Protocol compliance and deviation management",
      "Data integrity and 21 CFR Part 11 compliance",
      "Equipment calibration and maintenance",
      "Regulatory submission preparation"
    ],
    solutions: [
      "Complete sample lifecycle tracking with chain of custody",
      "Electronic protocol management with deviation workflows",
      "Compliant data management with audit trails",
      "Automated equipment management and calibration",
      "Regulatory submission document assembly"
    ],
    valueChain: [
      { stage: "Sample Receipt", desc: "Accessioning and storage" },
      { stage: "Testing", desc: "Protocol execution and data capture" },
      { stage: "QC", desc: "Quality review and approval" },
      { stage: "Reporting", desc: "Results delivery and interpretation" },
      { stage: "Archiving", desc: "Long-term storage and retrieval" }
    ],
    benefits: [
      "100% sample traceability and chain of custody",
      "Regulatory compliance with full audit trails",
      "Reduced turnaround time with workflow automation",
      "Improved data quality with validation rules",
      "Faster regulatory submission preparation"
    ],
    aiFeatures: [
      { title: "Quality Predictor", desc: "AI flags potential quality issues early" },
      { title: "Protocol Assistant", desc: "Guided workflow execution with checks" },
      { title: "Data Validator", desc: "Automated data quality and integrity checks" }
    ]
  },
  "credit": {
    name: "Credit & Lending",
    description: "Credit and lending operations management",
    modules: ["Origination", "Underwriting", "Servicing", "Collections", "Compliance", "Analytics"],
    features: ["Credit Scoring", "Loan Management", "Payment Processing", "Risk Management"],
    problems: [
      "Lengthy loan origination and approval processes",
      "Inconsistent credit decisioning across channels",
      "Collection efficiency and delinquency management",
      "Regulatory compliance complexity",
      "Portfolio risk management"
    ],
    solutions: [
      "Digital loan origination with automated decisioning",
      "ML-based credit scoring with consistent policies",
      "AI-powered collection prioritization and strategies",
      "Automated compliance monitoring and reporting",
      "Real-time portfolio risk analytics"
    ],
    valueChain: [
      { stage: "Origination", desc: "Application capture and verification" },
      { stage: "Underwriting", desc: "Credit assessment and approval" },
      { stage: "Funding", desc: "Loan disbursement and documentation" },
      { stage: "Servicing", desc: "Payment processing and account management" },
      { stage: "Collections", desc: "Delinquency management and recovery" }
    ],
    benefits: [
      "70% faster loan processing time",
      "Improved credit decisioning accuracy",
      "Higher collection rates with AI prioritization",
      "Automated regulatory compliance",
      "Real-time portfolio risk visibility"
    ],
    aiFeatures: [
      { title: "Smart Scoring", desc: "ML credit models with alternative data" },
      { title: "Collection Intelligence", desc: "AI prioritizes collection actions" },
      { title: "Risk Monitor", desc: "Real-time portfolio health monitoring" }
    ]
  },
  "equipment": {
    name: "Equipment Manufacturing",
    description: "Heavy equipment and machinery manufacturing",
    modules: ["Engineering", "Production", "Quality", "Service", "Parts", "Analytics"],
    features: ["BOM Management", "Work Orders", "Equipment Tracking", "Warranty Management"],
    problems: [
      "Complex engineering change management",
      "Long lead times for custom configurations",
      "Field service and maintenance scheduling",
      "Parts availability and inventory management",
      "Warranty claims and service contracts"
    ],
    solutions: [
      "Integrated PLM with engineering change automation",
      "Configure-to-order with automated BOMs",
      "Field service scheduling with mobile apps",
      "Parts demand forecasting and inventory optimization",
      "Automated warranty claims processing"
    ],
    valueChain: [
      { stage: "Engineering", desc: "Design and change management" },
      { stage: "Manufacturing", desc: "Production and assembly" },
      { stage: "Sales", desc: "Configuration and quoting" },
      { stage: "Service", desc: "Installation and maintenance" },
      { stage: "Parts", desc: "Spare parts and fulfillment" }
    ],
    benefits: [
      "30% faster engineering change implementation",
      "Reduced lead times for custom orders",
      "Improved field service first-time-fix rates",
      "Better parts availability with AI forecasting",
      "Streamlined warranty claims processing"
    ],
    aiFeatures: [
      { title: "Predictive Service", desc: "IoT-based maintenance scheduling" },
      { title: "Parts Predictor", desc: "ML forecasts spare parts demand" },
      { title: "Config Optimizer", desc: "AI recommends optimal configurations" }
    ]
  },
  "events": {
    name: "Events Management",
    description: "Event planning and management platform",
    modules: ["Event Planning", "Registration", "Venue", "Vendor", "Finance", "Analytics"],
    features: ["Online Registration", "Badge Printing", "Session Management", "Exhibitor Portal"],
    problems: [
      "Complex event logistics coordination",
      "Registration and attendee management",
      "Vendor and exhibitor coordination",
      "On-site operations and check-in",
      "Post-event analytics and ROI measurement"
    ],
    solutions: [
      "Integrated event planning with timeline management",
      "Online registration with payment processing",
      "Vendor portal with task and deadline tracking",
      "Mobile check-in with real-time badge printing",
      "Comprehensive event analytics and surveys"
    ],
    valueChain: [
      { stage: "Planning", desc: "Event design and budgeting" },
      { stage: "Marketing", desc: "Promotion and registration" },
      { stage: "Logistics", desc: "Vendor and venue coordination" },
      { stage: "Execution", desc: "On-site operations" },
      { stage: "Follow-up", desc: "Analysis and engagement" }
    ],
    benefits: [
      "50% reduction in planning time with automation",
      "Seamless online registration experience",
      "Real-time event operations visibility",
      "Improved vendor coordination and communication",
      "Comprehensive post-event insights"
    ],
    aiFeatures: [
      { title: "Attendance Predictor", desc: "ML forecasts registration and attendance" },
      { title: "Session Recommender", desc: "Personalized session recommendations" },
      { title: "Sentiment Analysis", desc: "Real-time feedback analysis" }
    ]
  },
  "export-import": {
    name: "Export & Import",
    description: "International trade and customs management",
    modules: ["Trade Compliance", "Customs", "Documentation", "Logistics", "Finance", "Analytics"],
    features: ["Customs Filing", "Trade Agreements", "Document Management", "Duty Calculation"],
    problems: [
      "Complex customs regulations across countries",
      "Trade agreement compliance and documentation",
      "Duty and tax calculation accuracy",
      "Denied party screening requirements",
      "Supply chain visibility for international shipments"
    ],
    solutions: [
      "Automated customs filing with country-specific rules",
      "Trade agreement management with FTA utilization",
      "Real-time duty calculation with tariff updates",
      "Integrated denied party screening",
      "End-to-end international shipment tracking"
    ],
    valueChain: [
      { stage: "Sourcing", desc: "Supplier qualification and compliance" },
      { stage: "Documentation", desc: "Export/import document preparation" },
      { stage: "Customs", desc: "Classification and filing" },
      { stage: "Logistics", desc: "International transportation" },
      { stage: "Compliance", desc: "Trade regulation adherence" }
    ],
    benefits: [
      "Zero customs penalties with automated compliance",
      "Maximize FTA benefits with agreement tracking",
      "Accurate duty calculation reducing unexpected costs",
      "100% denied party screening compliance",
      "Complete visibility for international shipments"
    ],
    aiFeatures: [
      { title: "HS Classifier", desc: "AI-assisted product classification" },
      { title: "Trade Optimizer", desc: "Recommends optimal trade routes and agreements" },
      { title: "Risk Screener", desc: "Automated denied party and sanction screening" }
    ]
  },
  "finance-investment": {
    name: "Finance & Investment",
    description: "Investment and asset management platform",
    modules: ["Portfolio Management", "Trading", "Risk", "Compliance", "Reporting", "Analytics"],
    features: ["Order Management", "Position Tracking", "Performance Attribution", "Client Reporting"],
    problems: [
      "Real-time portfolio visibility and risk exposure",
      "Order management across multiple asset classes",
      "Performance attribution and reporting",
      "Regulatory compliance (MiFID II, SEC)",
      "Client communication and reporting"
    ],
    solutions: [
      "Real-time portfolio and risk management dashboard",
      "Multi-asset order management with execution analytics",
      "Automated performance attribution and analysis",
      "Pre-configured regulatory compliance workflows",
      "Automated client reporting with customization"
    ],
    valueChain: [
      { stage: "Research", desc: "Investment analysis and recommendations" },
      { stage: "Portfolio", desc: "Strategy implementation and rebalancing" },
      { stage: "Trading", desc: "Order execution and settlement" },
      { stage: "Risk", desc: "Exposure monitoring and limits" },
      { stage: "Reporting", desc: "Client and regulatory reporting" }
    ],
    benefits: [
      "Real-time visibility across all portfolios",
      "Improved execution quality with analytics",
      "Automated regulatory compliance",
      "Faster client reporting with automation",
      "Better risk management with real-time monitoring"
    ],
    aiFeatures: [
      { title: "Alpha Generator", desc: "ML identifies investment opportunities" },
      { title: "Risk Sentinel", desc: "Real-time risk monitoring and alerts" },
      { title: "Execution Optimizer", desc: "AI optimizes trade execution" }
    ]
  },
  "food-beverage": {
    name: "Food & Beverage",
    description: "Food and beverage manufacturing and distribution",
    modules: ["Recipe Management", "Production", "Quality", "Traceability", "Distribution", "Compliance"],
    features: ["Batch Tracking", "Allergen Management", "Shelf Life", "Food Safety"],
    problems: [
      "Recipe and formulation management complexity",
      "Food safety and allergen compliance",
      "Lot traceability for recall management",
      "Shelf life and expiration tracking",
      "Regulatory compliance (FDA, FSMA)"
    ],
    solutions: [
      "Centralized recipe management with versioning",
      "Automated allergen tracking and labeling",
      "Complete lot traceability from farm to fork",
      "FEFO inventory management with expiration alerts",
      "Pre-configured food safety compliance workflows"
    ],
    valueChain: [
      { stage: "Sourcing", desc: "Ingredient procurement and quality" },
      { stage: "Production", desc: "Recipe execution and batch processing" },
      { stage: "Quality", desc: "Testing and compliance verification" },
      { stage: "Distribution", desc: "Cold chain and logistics" },
      { stage: "Retail", desc: "Freshness and shelf management" }
    ],
    benefits: [
      "Complete traceability for instant recalls",
      "100% allergen compliance with automation",
      "Reduced waste with shelf life optimization",
      "Food safety compliance with audit readiness",
      "Recipe consistency across facilities"
    ],
    aiFeatures: [
      { title: "Quality Predictor", desc: "AI predicts quality issues from sensor data" },
      { title: "Shelf Life Optimizer", desc: "ML maximizes product freshness" },
      { title: "Demand Sensing", desc: "Real-time demand signals for perishables" }
    ]
  },
  "freight": {
    name: "Freight & Logistics",
    description: "Freight brokerage and logistics management",
    modules: ["Load Matching", "Carrier Management", "Tracking", "Rating", "Billing", "Analytics"],
    features: ["Freight Marketplace", "Digital BOL", "Real-time Tracking", "Freight Audit"],
    problems: [
      "Capacity finding and carrier matching",
      "Rate negotiation and management",
      "Shipment visibility across carriers",
      "Freight invoice accuracy and disputes",
      "Carrier performance management"
    ],
    solutions: [
      "AI-powered load-to-carrier matching",
      "Dynamic rating with market intelligence",
      "Multi-carrier tracking with unified visibility",
      "Automated freight audit and payment",
      "Carrier scorecards with performance analytics"
    ],
    valueChain: [
      { stage: "Booking", desc: "Load posting and carrier matching" },
      { stage: "Documentation", desc: "BOL and document management" },
      { stage: "Transit", desc: "Multi-carrier tracking" },
      { stage: "Delivery", desc: "POD and exceptions" },
      { stage: "Payment", desc: "Audit and settlement" }
    ],
    benefits: [
      "Faster carrier matching with AI",
      "Competitive rates with market visibility",
      "Unified tracking across all carriers",
      "Reduced billing errors with automated audit",
      "Better carrier relationships with transparency"
    ],
    aiFeatures: [
      { title: "Capacity Finder", desc: "AI predicts carrier availability" },
      { title: "Rate Predictor", desc: "ML forecasts market rates" },
      { title: "Exception Manager", desc: "Proactive issue detection and resolution" }
    ]
  },
  "laboratory": {
    name: "Laboratory Services",
    description: "Laboratory operations and testing management",
    modules: ["LIMS", "Sample Management", "Testing", "Quality", "Reporting", "Compliance"],
    features: ["Instrument Integration", "Electronic Notebooks", "Result Review", "Certificate Generation"],
    problems: [
      "Sample backlog and turnaround time",
      "Instrument data integration and management",
      "Result review and approval workflows",
      "Regulatory compliance documentation",
      "Quality control and proficiency testing"
    ],
    solutions: [
      "Workflow automation with priority scheduling",
      "Direct instrument integration with auto-capture",
      "Electronic result review with approval routing",
      "Automated compliance documentation",
      "QC tracking with trend analysis"
    ],
    valueChain: [
      { stage: "Reception", desc: "Sample login and scheduling" },
      { stage: "Analysis", desc: "Testing and data capture" },
      { stage: "Review", desc: "Result verification and approval" },
      { stage: "Reporting", desc: "Certificate and delivery" },
      { stage: "Quality", desc: "QC and continuous improvement" }
    ],
    benefits: [
      "40% reduction in turnaround time",
      "Eliminate manual data entry errors",
      "Streamlined result review and approval",
      "Audit-ready compliance documentation",
      "Improved QC with trend analysis"
    ],
    aiFeatures: [
      { title: "Workload Optimizer", desc: "AI schedules samples for optimal throughput" },
      { title: "Result Validator", desc: "Automated result verification and flagging" },
      { title: "Trend Analyzer", desc: "QC trend detection and prediction" }
    ]
  },
  "lab-tech": {
    name: "Lab Technology",
    description: "Laboratory technology and instrument management",
    modules: ["Instrument Management", "Calibration", "Maintenance", "Data Management", "Compliance", "Analytics"],
    features: ["Asset Tracking", "Calibration Scheduling", "Method Validation", "Data Integrity"],
    problems: [
      "Instrument lifecycle and maintenance tracking",
      "Calibration scheduling and compliance",
      "Method validation documentation",
      "Data integrity and 21 CFR Part 11",
      "Instrument performance monitoring"
    ],
    solutions: [
      "Complete instrument lifecycle management",
      "Automated calibration scheduling with reminders",
      "Electronic method validation with templates",
      "Data integrity controls with audit trails",
      "Real-time instrument performance monitoring"
    ],
    valueChain: [
      { stage: "Procurement", desc: "Instrument selection and acquisition" },
      { stage: "Qualification", desc: "Installation and validation" },
      { stage: "Operations", desc: "Daily use and monitoring" },
      { stage: "Maintenance", desc: "PM and calibration" },
      { stage: "Retirement", desc: "Decommissioning and disposal" }
    ],
    benefits: [
      "100% calibration compliance with automation",
      "Reduced instrument downtime",
      "Compliant data integrity practices",
      "Streamlined method validation",
      "Better instrument utilization"
    ],
    aiFeatures: [
      { title: "Predictive Maintenance", desc: "ML predicts instrument failures" },
      { title: "Performance Monitor", desc: "Real-time instrument health tracking" },
      { title: "Calibration Optimizer", desc: "AI schedules optimal calibration windows" }
    ]
  },
  "marketing": {
    name: "Marketing & Advertising",
    description: "Marketing operations and campaign management",
    modules: ["Campaign Management", "Creative", "Media Planning", "Analytics", "CRM", "Automation"],
    features: ["Multi-channel Campaigns", "A/B Testing", "Attribution", "Marketing Automation"],
    problems: [
      "Campaign coordination across channels",
      "Marketing ROI measurement and attribution",
      "Creative asset management and approval",
      "Lead management and nurturing",
      "Budget allocation and optimization"
    ],
    solutions: [
      "Unified multi-channel campaign orchestration",
      "Multi-touch attribution with AI modeling",
      "Digital asset management with approval workflows",
      "Automated lead scoring and nurturing",
      "AI-optimized budget allocation"
    ],
    valueChain: [
      { stage: "Planning", desc: "Strategy and budget allocation" },
      { stage: "Creative", desc: "Asset development and approval" },
      { stage: "Execution", desc: "Campaign launch and management" },
      { stage: "Engagement", desc: "Lead capture and nurturing" },
      { stage: "Analytics", desc: "Performance and attribution" }
    ],
    benefits: [
      "30% improvement in marketing ROI",
      "Unified view of all marketing activities",
      "Faster creative approval cycles",
      "Better lead conversion with AI scoring",
      "Optimized budget allocation with ML"
    ],
    aiFeatures: [
      { title: "Audience Predictor", desc: "ML identifies high-value segments" },
      { title: "Content Optimizer", desc: "AI recommends content variations" },
      { title: "Attribution Engine", desc: "Multi-touch attribution modeling" }
    ]
  },
  "media": {
    name: "Media & Entertainment",
    description: "Media production and content management",
    modules: ["Content Management", "Production", "Distribution", "Rights", "Analytics", "Monetization"],
    features: ["Digital Asset Management", "Workflow Automation", "Royalty Management", "Content Delivery"],
    problems: [
      "Content lifecycle and asset management",
      "Production scheduling and resource management",
      "Rights management and royalty tracking",
      "Multi-platform content distribution",
      "Audience measurement and monetization"
    ],
    solutions: [
      "Centralized digital asset management",
      "Production planning with resource optimization",
      "Automated rights management and royalty calculation",
      "Multi-platform distribution with transcoding",
      "Audience analytics with monetization insights"
    ],
    valueChain: [
      { stage: "Development", desc: "Content ideation and acquisition" },
      { stage: "Production", desc: "Creation and post-production" },
      { stage: "Distribution", desc: "Multi-platform delivery" },
      { stage: "Monetization", desc: "Advertising and subscription" },
      { stage: "Analytics", desc: "Audience and performance" }
    ],
    benefits: [
      "Faster content-to-market with automation",
      "Complete rights visibility and compliance",
      "Efficient multi-platform distribution",
      "Better audience targeting and engagement",
      "Maximized content monetization"
    ],
    aiFeatures: [
      { title: "Content Recommender", desc: "AI personalizes content for audiences" },
      { title: "Auto-tagging", desc: "ML automates metadata tagging" },
      { title: "Trend Predictor", desc: "Identifies emerging content trends" }
    ]
  },
  "pharmacy": {
    name: "Pharmacy Operations",
    description: "Pharmacy management and dispensing solutions",
    modules: ["Dispensing", "Inventory", "Clinical", "Billing", "Compliance", "Analytics"],
    features: ["E-Prescribing", "Drug Interaction Checking", "Insurance Billing", "Patient Counseling"],
    problems: [
      "Prescription processing and dispensing errors",
      "Drug interaction and allergy checking",
      "Insurance claim adjudication and rejections",
      "Controlled substance tracking and compliance",
      "Inventory management and drug shortages"
    ],
    solutions: [
      "Automated prescription verification and dispensing",
      "Real-time drug interaction and allergy alerts",
      "Automated insurance claim submission and follow-up",
      "DEA-compliant controlled substance tracking",
      "AI-powered inventory optimization"
    ],
    valueChain: [
      { stage: "Rx Receipt", desc: "Prescription intake and verification" },
      { stage: "Clinical Review", desc: "DUR and interaction checking" },
      { stage: "Dispensing", desc: "Filling and quality check" },
      { stage: "Counseling", desc: "Patient education and delivery" },
      { stage: "Follow-up", desc: "Refill management and adherence" }
    ],
    benefits: [
      "Zero dispensing errors with automation",
      "Complete drug safety checking",
      "Higher claim acceptance rates",
      "100% controlled substance compliance",
      "Optimized inventory reducing waste"
    ],
    aiFeatures: [
      { title: "Safety Checker", desc: "AI validates drug safety and interactions" },
      { title: "Adherence Predictor", desc: "ML identifies patients at risk of non-adherence" },
      { title: "Inventory Optimizer", desc: "Demand forecasting for optimal stock" }
    ]
  },
  "portal": {
    name: "Portal & Digital Services",
    description: "Digital portal and self-service platform solutions",
    modules: ["Portal Builder", "User Management", "Content", "Workflow", "Integration", "Analytics"],
    features: ["Self-Service", "Knowledge Base", "Ticketing", "Personalization"],
    problems: [
      "Fragmented user experience across systems",
      "High support costs for routine inquiries",
      "Content management and personalization",
      "User onboarding and adoption",
      "Integration with backend systems"
    ],
    solutions: [
      "Unified portal experience with single sign-on",
      "AI-powered self-service with knowledge base",
      "Personalized content and recommendations",
      "Guided onboarding with progress tracking",
      "Pre-built integrations with enterprise systems"
    ],
    valueChain: [
      { stage: "Design", desc: "Portal configuration and branding" },
      { stage: "Content", desc: "Knowledge base and documentation" },
      { stage: "Access", desc: "User provisioning and SSO" },
      { stage: "Support", desc: "Self-service and ticketing" },
      { stage: "Analytics", desc: "Usage and satisfaction tracking" }
    ],
    benefits: [
      "50% reduction in support inquiries",
      "Unified user experience across services",
      "Personalized content engagement",
      "Faster user onboarding and adoption",
      "Seamless integration with existing systems"
    ],
    aiFeatures: [
      { title: "Virtual Assistant", desc: "AI chatbot for instant support" },
      { title: "Content Recommender", desc: "Personalized content and resources" },
      { title: "Search Intelligence", desc: "Smart search with natural language" }
    ]
  },
  "property": {
    name: "Property & Real Estate",
    description: "Property management and real estate operations",
    modules: ["Property Management", "Leasing", "Maintenance", "Accounting", "Tenant Portal", "Analytics"],
    features: ["Lease Management", "Rent Collection", "Work Orders", "Tenant Communication"],
    problems: [
      "Lease lifecycle and renewal management",
      "Rent collection and delinquency tracking",
      "Maintenance request management",
      "Tenant communication and satisfaction",
      "Property performance and occupancy analytics"
    ],
    solutions: [
      "Automated lease administration and renewals",
      "Online rent payment with automated reminders",
      "Mobile work order management with tracking",
      "Tenant portal with self-service capabilities",
      "Real-time property performance dashboards"
    ],
    valueChain: [
      { stage: "Leasing", desc: "Marketing and tenant acquisition" },
      { stage: "Move-in", desc: "Onboarding and lease execution" },
      { stage: "Operations", desc: "Rent and maintenance management" },
      { stage: "Renewals", desc: "Lease renewal and negotiations" },
      { stage: "Analytics", desc: "Performance and optimization" }
    ],
    benefits: [
      "95% on-time rent collection with automation",
      "Faster maintenance resolution",
      "Improved tenant satisfaction and retention",
      "Better lease renewal rates",
      "Real-time visibility into property performance"
    ],
    aiFeatures: [
      { title: "Rent Optimizer", desc: "AI recommends optimal rental rates" },
      { title: "Churn Predictor", desc: "Identifies tenants at risk of leaving" },
      { title: "Maintenance Predictor", desc: "Anticipates maintenance needs" }
    ]
  },
  "real-estate-construction": {
    name: "Real Estate & Construction",
    description: "Construction project and real estate development",
    modules: ["Project Management", "Estimating", "Scheduling", "Procurement", "Finance", "Analytics"],
    features: ["Cost Tracking", "Schedule Management", "Document Control", "Safety Management"],
    problems: [
      "Project cost overruns and budget tracking",
      "Schedule delays and milestone management",
      "Subcontractor coordination and management",
      "Document control and version management",
      "Safety compliance and incident tracking"
    ],
    solutions: [
      "Real-time cost tracking with variance analysis",
      "Critical path scheduling with delay alerts",
      "Subcontractor portal with collaboration tools",
      "Cloud document management with versioning",
      "Digital safety management with incident tracking"
    ],
    valueChain: [
      { stage: "Pre-construction", desc: "Estimating and planning" },
      { stage: "Procurement", desc: "Bidding and contracting" },
      { stage: "Construction", desc: "Execution and monitoring" },
      { stage: "Closeout", desc: "Punch list and handover" },
      { stage: "Operations", desc: "Warranty and maintenance" }
    ],
    benefits: [
      "Projects delivered on budget with real-time tracking",
      "Reduced delays with proactive scheduling",
      "Better subcontractor performance",
      "Complete document audit trail",
      "Improved safety with digital management"
    ],
    aiFeatures: [
      { title: "Cost Predictor", desc: "AI forecasts final project costs" },
      { title: "Schedule Risk", desc: "ML identifies schedule risks early" },
      { title: "Safety Analyzer", desc: "Predicts safety incidents from patterns" }
    ]
  },
  "security": {
    name: "Security & Defense",
    description: "Security services and defense contractor management",
    modules: ["Contract Management", "Compliance", "Personnel", "Asset Tracking", "Operations", "Analytics"],
    features: ["Clearance Management", "ITAR Compliance", "Guard Scheduling", "Incident Management"],
    problems: [
      "Security clearance and personnel tracking",
      "ITAR and export control compliance",
      "Guard scheduling and post management",
      "Incident reporting and investigation",
      "Contract compliance and reporting"
    ],
    solutions: [
      "Automated clearance tracking and expiration alerts",
      "Pre-configured ITAR compliance workflows",
      "AI-optimized guard scheduling",
      "Digital incident management with workflows",
      "Contract milestone and compliance tracking"
    ],
    valueChain: [
      { stage: "Contracting", desc: "Bid and proposal management" },
      { stage: "Personnel", desc: "Clearance and training management" },
      { stage: "Operations", desc: "Service delivery and scheduling" },
      { stage: "Compliance", desc: "Regulatory adherence and auditing" },
      { stage: "Reporting", desc: "Client and government reporting" }
    ],
    benefits: [
      "100% clearance compliance with automation",
      "ITAR and export control compliance",
      "Optimized guard scheduling and coverage",
      "Faster incident response and resolution",
      "Contract compliance visibility"
    ],
    aiFeatures: [
      { title: "Threat Analyzer", desc: "AI assesses security threat patterns" },
      { title: "Schedule Optimizer", desc: "ML optimizes guard deployment" },
      { title: "Compliance Monitor", desc: "Automated regulatory monitoring" }
    ]
  },
  "shipment": {
    name: "Shipment Management",
    description: "Multi-modal shipment and package management",
    modules: ["Order Management", "Shipping", "Tracking", "Returns", "Billing", "Analytics"],
    features: ["Rate Shopping", "Label Printing", "Track & Trace", "Returns Management"],
    problems: [
      "Carrier rate comparison and selection",
      "Shipment documentation and labeling",
      "Multi-carrier tracking visibility",
      "Returns processing and management",
      "Shipping cost allocation and analysis"
    ],
    solutions: [
      "Real-time rate shopping across carriers",
      "Automated label generation and documentation",
      "Unified tracking across all carriers",
      "Self-service returns portal with tracking",
      "Detailed shipping cost analytics"
    ],
    valueChain: [
      { stage: "Order", desc: "Order processing and allocation" },
      { stage: "Shipping", desc: "Carrier selection and labeling" },
      { stage: "Transit", desc: "Tracking and updates" },
      { stage: "Delivery", desc: "Confirmation and exceptions" },
      { stage: "Returns", desc: "RMA and reverse logistics" }
    ],
    benefits: [
      "Lower shipping costs with rate shopping",
      "Faster shipment processing with automation",
      "Unified visibility across carriers",
      "Streamlined returns experience",
      "Complete shipping cost visibility"
    ],
    aiFeatures: [
      { title: "Carrier Selector", desc: "AI recommends optimal carrier for each shipment" },
      { title: "Delivery Predictor", desc: "ML estimates accurate delivery dates" },
      { title: "Exception Manager", desc: "Proactive exception detection and resolution" }
    ]
  },
  "shipping": {
    name: "Shipping & Maritime",
    description: "Maritime shipping and vessel operations management",
    modules: ["Fleet Management", "Voyage Planning", "Port Operations", "Cargo", "Compliance", "Analytics"],
    features: ["Vessel Tracking", "Charter Management", "Bill of Lading", "Port Call Optimization"],
    problems: [
      "Voyage planning and optimization",
      "Charter party management and demurrage",
      "Port operations and berth scheduling",
      "Cargo documentation and customs",
      "Maritime regulatory compliance"
    ],
    solutions: [
      "AI-optimized voyage planning with weather routing",
      "Automated charter party and demurrage tracking",
      "Port community integration for berth scheduling",
      "Digital bill of lading and cargo documentation",
      "IMO and flag state compliance management"
    ],
    valueChain: [
      { stage: "Charter", desc: "Vessel chartering and contracting" },
      { stage: "Voyage", desc: "Planning and optimization" },
      { stage: "Port", desc: "Operations and documentation" },
      { stage: "Cargo", desc: "Loading, discharge, and delivery" },
      { stage: "Settlement", desc: "Demurrage and invoicing" }
    ],
    benefits: [
      "Fuel savings with optimized routing",
      "Reduced demurrage with better planning",
      "Faster port turnaround times",
      "Digital documentation reducing errors",
      "Maritime regulatory compliance"
    ],
    aiFeatures: [
      { title: "Weather Routing", desc: "AI optimizes routes considering weather" },
      { title: "Port Predictor", desc: "ML estimates port wait times" },
      { title: "Fuel Optimizer", desc: "Optimizes speed and consumption" }
    ]
  },
  "training": {
    name: "Training & Development",
    description: "Corporate training and learning management",
    modules: ["LMS", "Content", "Assessments", "Certifications", "Compliance", "Analytics"],
    features: ["Course Management", "Virtual Classrooms", "Skill Tracking", "Compliance Training"],
    problems: [
      "Training content development and management",
      "Employee skill gap identification",
      "Compliance training tracking and reporting",
      "Training effectiveness measurement",
      "Certification and renewal tracking"
    ],
    solutions: [
      "Centralized learning management with SCORM support",
      "AI-powered skill gap analysis and recommendations",
      "Automated compliance training assignment and tracking",
      "Learning analytics with effectiveness metrics",
      "Automated certification tracking with renewal alerts"
    ],
    valueChain: [
      { stage: "Needs", desc: "Skill gap analysis and planning" },
      { stage: "Content", desc: "Course development and curation" },
      { stage: "Delivery", desc: "Training execution and engagement" },
      { stage: "Assessment", desc: "Testing and certification" },
      { stage: "Analytics", desc: "Effectiveness and ROI measurement" }
    ],
    benefits: [
      "Improved employee skill development",
      "100% compliance training completion",
      "Better training effectiveness with analytics",
      "Automated certification management",
      "Personalized learning paths"
    ],
    aiFeatures: [
      { title: "Skill Mapper", desc: "AI identifies skill gaps and recommends training" },
      { title: "Adaptive Learning", desc: "Personalized learning paths based on progress" },
      { title: "Engagement Predictor", desc: "Identifies learners at risk of disengagement" }
    ]
  },
  "transportation": {
    name: "Transportation Services",
    description: "Passenger and commercial transportation management",
    modules: ["Fleet", "Scheduling", "Dispatch", "Ticketing", "Maintenance", "Analytics"],
    features: ["Route Planning", "Passenger Management", "Real-time Tracking", "Revenue Management"],
    problems: [
      "Route optimization and scheduling efficiency",
      "Passenger demand forecasting",
      "Fleet maintenance and availability",
      "Fare management and revenue optimization",
      "Driver scheduling and compliance"
    ],
    solutions: [
      "AI-optimized route planning and scheduling",
      "Demand forecasting for capacity planning",
      "Predictive fleet maintenance management",
      "Dynamic pricing with revenue management",
      "Automated driver scheduling with compliance"
    ],
    valueChain: [
      { stage: "Planning", desc: "Route and schedule design" },
      { stage: "Operations", desc: "Daily dispatch and management" },
      { stage: "Customer", desc: "Booking and passenger experience" },
      { stage: "Maintenance", desc: "Fleet care and availability" },
      { stage: "Analytics", desc: "Performance and optimization" }
    ],
    benefits: [
      "Improved on-time performance",
      "Better capacity utilization",
      "Reduced maintenance downtime",
      "Optimized fare revenue",
      "Driver compliance and satisfaction"
    ],
    aiFeatures: [
      { title: "Route Optimizer", desc: "AI designs optimal routes and schedules" },
      { title: "Demand Predictor", desc: "ML forecasts passenger demand" },
      { title: "Fleet Health", desc: "Predictive maintenance for vehicles" }
    ]
  },
  "travel": {
    name: "Travel & Tourism",
    description: "Travel agency and tour operations management",
    modules: ["Reservations", "Packages", "CRM", "Operations", "Finance", "Analytics"],
    features: ["Booking Engine", "Package Builder", "Supplier Management", "Customer Portal"],
    problems: [
      "Multi-supplier booking and management",
      "Package creation and pricing",
      "Customer preference tracking and personalization",
      "Travel disruption handling",
      "Commission and revenue tracking"
    ],
    solutions: [
      "Unified booking across all travel suppliers",
      "Dynamic package builder with pricing",
      "Customer 360 with preference tracking",
      "Automated disruption management and rebooking",
      "Complete commission and revenue visibility"
    ],
    valueChain: [
      { stage: "Sales", desc: "Customer engagement and booking" },
      { stage: "Fulfillment", desc: "Supplier confirmation and documentation" },
      { stage: "Travel", desc: "Customer support during trip" },
      { stage: "Post-trip", desc: "Feedback and follow-up" },
      { stage: "Analytics", desc: "Performance and customer insights" }
    ],
    benefits: [
      "Faster booking with unified platform",
      "Flexible package creation and pricing",
      "Personalized travel recommendations",
      "Better disruption handling and customer care",
      "Complete revenue visibility"
    ],
    aiFeatures: [
      { title: "Trip Recommender", desc: "AI suggests personalized destinations and activities" },
      { title: "Price Optimizer", desc: "Dynamic pricing for packages" },
      { title: "Disruption Manager", desc: "Proactive rebooking during disruptions" }
    ]
  },
  "vehicle": {
    name: "Vehicle & Fleet Services",
    description: "Vehicle fleet and dealership management",
    modules: ["Fleet Management", "Sales", "Service", "Parts", "Finance", "Analytics"],
    features: ["Vehicle Tracking", "Service Scheduling", "Inventory Management", "Customer Portal"],
    problems: [
      "Fleet utilization and tracking",
      "Vehicle maintenance scheduling",
      "Sales process and inventory management",
      "Parts availability and procurement",
      "Customer relationship management"
    ],
    solutions: [
      "Real-time fleet tracking with telematics",
      "Predictive maintenance scheduling",
      "Digital sales process with CRM integration",
      "Parts demand forecasting and ordering",
      "Customer portal with service history"
    ],
    valueChain: [
      { stage: "Acquisition", desc: "Vehicle sourcing and inventory" },
      { stage: "Sales", desc: "Customer engagement and closing" },
      { stage: "Service", desc: "Maintenance and repairs" },
      { stage: "Parts", desc: "Inventory and fulfillment" },
      { stage: "Retention", desc: "Customer engagement and loyalty" }
    ],
    benefits: [
      "Improved fleet utilization",
      "Reduced vehicle downtime with predictive maintenance",
      "Faster sales process with digital tools",
      "Better parts availability",
      "Higher customer retention"
    ],
    aiFeatures: [
      { title: "Fleet Optimizer", desc: "AI optimizes fleet allocation and utilization" },
      { title: "Service Predictor", desc: "ML schedules maintenance before failures" },
      { title: "Sales Assistant", desc: "AI-powered lead scoring and recommendations" }
    ]
  },
  "warehouse": {
    name: "Warehouse & Storage",
    description: "Warehouse operations and storage management",
    modules: ["Inventory", "Receiving", "Picking", "Shipping", "Labor", "Analytics"],
    features: ["Slotting Optimization", "Wave Planning", "Cycle Counting", "Labor Management"],
    problems: [
      "Warehouse space utilization",
      "Picking efficiency and accuracy",
      "Inventory accuracy and visibility",
      "Labor productivity and scheduling",
      "Order fulfillment speed"
    ],
    solutions: [
      "AI-optimized slotting and space utilization",
      "Intelligent wave planning with route optimization",
      "Real-time inventory tracking with cycle counting",
      "Labor management with productivity tracking",
      "Automated order prioritization and fulfillment"
    ],
    valueChain: [
      { stage: "Receiving", desc: "Inbound processing and putaway" },
      { stage: "Storage", desc: "Inventory management and slotting" },
      { stage: "Picking", desc: "Order selection and packing" },
      { stage: "Shipping", desc: "Outbound processing and dispatch" },
      { stage: "Analytics", desc: "Performance optimization" }
    ],
    benefits: [
      "30% improvement in space utilization",
      "Faster picking with optimized routes",
      "99.9% inventory accuracy",
      "Improved labor productivity",
      "Faster order fulfillment"
    ],
    aiFeatures: [
      { title: "Slot Optimizer", desc: "AI determines optimal product placement" },
      { title: "Pick Predictor", desc: "ML anticipates order patterns" },
      { title: "Labor Planner", desc: "Demand-based workforce scheduling" }
    ]
  },
  "wholesale": {
    name: "Wholesale & Distribution",
    description: "Wholesale distribution and B2B sales management",
    modules: ["Order Management", "Inventory", "Pricing", "CRM", "Logistics", "Analytics"],
    features: ["B2B Portal", "Price Lists", "Credit Management", "Route Sales"],
    problems: [
      "Complex pricing with customer-specific agreements",
      "Inventory allocation across channels",
      "Credit management and collections",
      "Route sales and van selling",
      "Customer order visibility and self-service"
    ],
    solutions: [
      "Flexible pricing engine with customer agreements",
      "Intelligent inventory allocation and ATP",
      "Automated credit checking and collections",
      "Mobile route sales with offline capability",
      "B2B portal with order tracking and history"
    ],
    valueChain: [
      { stage: "Sales", desc: "Customer engagement and ordering" },
      { stage: "Pricing", desc: "Agreement and discount management" },
      { stage: "Fulfillment", desc: "Picking, packing, and shipping" },
      { stage: "Delivery", desc: "Route optimization and POD" },
      { stage: "Collections", desc: "Invoicing and payment" }
    ],
    benefits: [
      "Accurate pricing with complex agreements",
      "Better inventory allocation decisions",
      "Reduced DSO with automated collections",
      "Efficient route sales operations",
      "Customer self-service reducing order costs"
    ],
    aiFeatures: [
      { title: "Price Optimizer", desc: "AI recommends optimal pricing" },
      { title: "Credit Scorer", desc: "ML-based credit risk assessment" },
      { title: "Route Planner", desc: "Optimized route sales scheduling" }
    ]
  },
};

const slugAliases: Record<string, string> = {
  "banking": "banking-finance",
  "government": "government-public-sector",
  "logistics": "logistics-transportation",
  "retail": "retail-e-commerce",
};

export default function IndustryDetail() {
  const params = useParams();
  const rawSlug = (params.slug || "").toLowerCase();
  const slug = slugAliases[rawSlug] || rawSlug;
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
                <h2 className="text-3xl font-bold mb-6">How NexusAIFirst Solves It</h2>
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
