import { useState } from "react";
import { Link } from "wouter";
import { Header, Footer } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users, DollarSign, Briefcase, Factory, Package, BarChart3, Shield, Cog,
  ShoppingCart, Truck, Brain, Workflow, Bell, GraduationCap, TrendingUp,
  Building, Database, Lock, GitBranch, Sparkles, FileText, Calendar,
  ClipboardList, Target, PieChart, Search, ChevronDown, ChevronUp,
  CheckCircle, Globe, Zap, Settings, LineChart, Box, Layers,
  Heart, Wrench, Store, Landmark, Building2, Hotel, Container, FileCheck, 
  Radio, Lightbulb, Film, Car, Shirt, Pill, BarChart2, Briefcase as BriefcaseIcon,
  Plane, FlaskConical, CreditCard, HardHat, PartyPopper, Ship, TrendingUp as TrendingUpIcon,
  UtensilsCrossed, TestTube, Telescope, Megaphone, Stethoscope, GlobeIcon,
  Home, Construction, ShieldCheck, Package as PackageIcon, Anchor, BookOpen,
  Bus, Palmtree, Warehouse
} from "lucide-react";

interface Feature {
  name: string;
  description: string;
  href?: string;
}

interface Module {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
  features: Feature[];
}

const modules: Module[] = [
  {
    id: "crm",
    name: "CRM & Sales",
    icon: Users,
    description: "Complete customer relationship management with lead tracking, opportunity management, and sales automation.",
    color: "bg-blue-500",
    features: [
      { name: "Lead Management", description: "Capture, score, and nurture leads through the sales funnel", href: "/features/lead-scoring" },
      { name: "Opportunity Pipeline", description: "Visual pipeline management with stage tracking", href: "/features/opportunities" },
      { name: "Account Management", description: "360-degree view of customer accounts and hierarchies", href: "/features/account-directory" },
      { name: "Contact Directory", description: "Centralized contact database with relationship mapping", href: "/features/contact-directory" },
      { name: "Activity Timeline", description: "Complete history of customer interactions", href: "/features/activity-timeline" },
      { name: "Quote Builder", description: "Professional quote generation with approval workflows", href: "/features/quote-builder" },
      { name: "Sales Analytics", description: "Revenue forecasting and performance dashboards", href: "/features/sales-analytics" },
      { name: "Customer Journey Mapping", description: "Visualize and optimize customer experience", href: "/features/customer-journey-map" },
      { name: "Predictive Lead Scoring", description: "AI-powered lead prioritization", href: "/features/predictive-lead-scoring" },
      { name: "CRM Copilot", description: "AI assistant for sales insights", href: "/features/crm-copilot" },
      { name: "Campaigns Dashboard", description: "Marketing campaign management and tracking", href: "/features/campaigns-dashboard" },
      { name: "Customer Loyalty Programs", description: "Points, rewards, and retention programs", href: "/features/loyalty-programs" },
      { name: "Competitor Analysis", description: "Track and analyze competitor activity", href: "/features/competitor-analysis" },
    ]
  },
  {
    id: "finance",
    name: "Finance & Accounting",
    icon: DollarSign,
    description: "End-to-end financial management from general ledger to advanced reporting and compliance.",
    color: "bg-green-500",
    features: [
      { name: "General Ledger", description: "Complete chart of accounts and journal management", href: "/features/general-ledger" },
      { name: "Accounts Payable", description: "Vendor invoices, payments, and aging reports", href: "/features/ap-invoices" },
      { name: "Accounts Receivable", description: "Customer invoicing and collections", href: "/features/ar-invoices" },
      { name: "Invoice Generator", description: "Professional invoice creation and delivery", href: "/features/invoice-generator" },
      { name: "Bank Reconciliation", description: "Automated bank statement matching", href: "/features/bank-reconciliation" },
      { name: "Cash Management", description: "Cash flow forecasting and optimization", href: "/features/cash-management" },
      { name: "Tax Management", description: "Multi-jurisdiction tax calculation and reporting", href: "/features/tax-management" },
      { name: "Financial Reports", description: "Balance sheet, P&L, and custom reports", href: "/features/financial-reports" },
      { name: "Budget Planning", description: "Annual budgeting and variance analysis", href: "/features/budgeting-dashboard" },
      { name: "Expense Tracking", description: "Employee expense management and approvals", href: "/features/expense-tracking" },
      { name: "Financial Consolidation", description: "Multi-entity consolidation and eliminations", href: "/features/financial-consolidation" },
      { name: "Revenue Forecasting", description: "AI-powered revenue predictions", href: "/features/revenue-forecasting" },
      { name: "Payment Scheduling", description: "Automated payment runs and scheduling", href: "/features/payment-scheduling" },
      { name: "Aging Reports", description: "AR/AP aging analysis and collections", href: "/features/aging-report" },
      { name: "Intercompany Reconciliation", description: "Cross-entity transaction matching", href: "/features/intercompany-reconciliation" },
    ]
  },
  {
    id: "hr",
    name: "Human Resources & Payroll",
    icon: Briefcase,
    description: "Complete workforce management from recruitment to retirement with integrated payroll.",
    color: "bg-purple-500",
    features: [
      { name: "Employee Directory", description: "Centralized employee information management", href: "/features/employee-directory" },
      { name: "Organization Chart", description: "Visual org structure and reporting lines", href: "/features/org-chart" },
      { name: "Payroll Processing", description: "Automated payroll runs with tax calculations", href: "/features/payroll-processing" },
      { name: "Leave Management", description: "Time-off requests and approval workflows", href: "/features/leave-request" },
      { name: "Attendance Dashboard", description: "Time tracking and attendance monitoring", href: "/features/attendance-dashboard" },
      { name: "Performance Reviews", description: "Goal setting and performance evaluations", href: "/features/performance-reviews" },
      { name: "Talent Pool", description: "Recruitment and candidate management", href: "/features/talent-pool" },
      { name: "Onboarding Automation", description: "Streamlined new hire onboarding", href: "/features/onboarding-automation" },
      { name: "Compensation Management", description: "Salary planning and benefits administration", href: "/features/compensation-management" },
      { name: "Learning Management", description: "Training courses and certifications", href: "/features/learning-management" },
      { name: "Employee Engagement", description: "Surveys and engagement analytics", href: "/features/employee-engagement" },
      { name: "HR Analytics", description: "Workforce analytics and insights", href: "/features/hr-analytics-dashboard" },
      { name: "HR Copilot", description: "AI assistant for HR queries", href: "/features/hr-copilot" },
    ]
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Production",
    icon: Factory,
    description: "End-to-end manufacturing operations from planning to quality control.",
    color: "bg-orange-500",
    features: [
      { name: "Work Orders", description: "Production order management and tracking", href: "/features/work-order" },
      { name: "MRP Dashboard", description: "Material requirements planning", href: "/features/mrp-dashboard" },
      { name: "BOM Management", description: "Bill of materials and routing", href: "/features/bom-management" },
      { name: "Shop Floor Control", description: "Real-time production monitoring", href: "/features/shop-floor" },
      { name: "Quality Control", description: "Inspection and quality management", href: "/features/quality-control" },
      { name: "Production Scheduling", description: "Gantt-based production planning", href: "/features/production-scheduling-gantt" },
      { name: "WIP Tracking", description: "Work-in-progress monitoring", href: "/features/wip-tracking" },
      { name: "NCR Management", description: "Non-conformance reports and CAPA", href: "/features/ncr-management" },
      { name: "Equipment Management", description: "Asset maintenance and scheduling", href: "/features/equipment-management" },
      { name: "Standard Costing", description: "Product costing and variance analysis", href: "/features/standard-costing" },
      { name: "Capacity Planning", description: "Resource capacity optimization", href: "/features/capacity-planning" },
      { name: "Tooling Management", description: "Tool tracking and maintenance", href: "/features/tooling-management" },
      { name: "CMMS Maintenance", description: "Preventive maintenance scheduling", href: "/features/cmms-maintenance" },
      { name: "Manufacturing Analytics", description: "OEE and production insights", href: "/features/mfg-analytics" },
    ]
  },
  {
    id: "supply-chain",
    name: "Supply Chain & Logistics",
    icon: Truck,
    description: "Complete supply chain visibility from procurement to delivery.",
    color: "bg-cyan-500",
    features: [
      { name: "Purchase Orders", description: "Procurement order management", href: "/features/purchase-order" },
      { name: "Vendor Management", description: "Supplier portal and performance tracking", href: "/features/vendor-management" },
      { name: "Inventory Dashboard", description: "Real-time stock visibility", href: "/features/inventory-dashboard" },
      { name: "Warehouse Management", description: "Bin locations and picking optimization", href: "/features/inventory-warehouse" },
      { name: "Goods Receipt", description: "Inbound receiving and putaway", href: "/features/goods-receipt" },
      { name: "Demand Forecasting", description: "AI-powered demand predictions", href: "/features/demand-forecasting" },
      { name: "Order Fulfillment", description: "Pick, pack, and ship automation", href: "/features/order-fulfillment" },
      { name: "Transportation Management", description: "Carrier management and routing", href: "/features/transportation-management-system" },
      { name: "Freight Management", description: "Freight rates and billing", href: "/features/freight-management" },
      { name: "3PL Integration", description: "Third-party logistics connectivity", href: "/features/third-party-logistics" },
      { name: "Supply Network Optimization", description: "Network design and optimization", href: "/features/supply-network-optimization" },
      { name: "Trade Compliance", description: "Import/export compliance management", href: "/features/trade-compliance-dashboard" },
      { name: "Inventory Optimization", description: "Safety stock and reorder optimization", href: "/features/inventory-optimization" },
      { name: "RMA Management", description: "Returns and warranty management", href: "/features/rma-management" },
    ]
  },
  {
    id: "projects",
    name: "Project Management",
    icon: ClipboardList,
    description: "Agile and traditional project management with resource planning.",
    color: "bg-indigo-500",
    features: [
      { name: "Agile Board", description: "Kanban and Scrum boards", href: "/features/agile-board" },
      { name: "Task Management", description: "Task assignment and tracking", href: "/features/task-management" },
      { name: "Kanban Board", description: "Visual workflow management", href: "/features/kanban-board" },
      { name: "Project Budget", description: "Budget tracking and cost control", href: "/features/project-budget-management" },
      { name: "Team Collaboration", description: "Real-time team communication", href: "/features/team-collaboration" },
      { name: "Resource Planning", description: "Team allocation and utilization", href: "/features/team-utilization" },
      { name: "Earned Value Analysis", description: "Project performance metrics", href: "/features/earned-value-analysis" },
      { name: "Daily Progress Reports", description: "Status updates and reporting", href: "/features/daily-progress-report" },
      { name: "Epics & Stories", description: "Agile backlog management", href: "/features/epics" },
      { name: "Estimation Workbook", description: "Project estimation tools", href: "/features/estimation-workbook" },
      { name: "Subcontractor Management", description: "External resource coordination", href: "/features/subcontractor-management" },
    ]
  },
  {
    id: "service",
    name: "Service & Support",
    icon: Package,
    description: "Customer service management with ticketing, SLA tracking, and knowledge base.",
    color: "bg-pink-500",
    features: [
      { name: "Ticket Dashboard", description: "Service ticket management", href: "/features/ticket-dashboard" },
      { name: "SLA Tracking", description: "Service level agreement monitoring", href: "/features/sla-tracking" },
      { name: "Customer Portal", description: "Self-service customer portal", href: "/features/customer-portal" },
      { name: "Knowledge Base", description: "Searchable article repository", href: "/features/knowledge-base" },
      { name: "Field Service", description: "Mobile field service management", href: "/features/field-service" },
      { name: "Service Analytics", description: "Service performance metrics", href: "/features/service-analytics" },
      { name: "Response Analytics", description: "Response time analysis", href: "/features/response-analytics" },
      { name: "Queue Management", description: "Ticket routing and escalation", href: "/features/approval-escalations" },
    ]
  },
  {
    id: "analytics",
    name: "Analytics & BI",
    icon: BarChart3,
    description: "Business intelligence with dashboards, reports, and predictive analytics.",
    color: "bg-amber-500",
    features: [
      { name: "Dashboard Builder", description: "Custom dashboard creation", href: "/features/dashboard-builder" },
      { name: "Report Builder", description: "Ad-hoc report designer", href: "/features/report-builder" },
      { name: "Data Explorer", description: "Self-service data analysis", href: "/features/data-explorer" },
      { name: "KPI Dashboard", description: "Key performance indicators", href: "/features/kpi-dashboard" },
      { name: "Predictive Analytics", description: "AI-powered forecasting", href: "/features/predictive-analytics" },
      { name: "Anomaly Detection", description: "Automated outlier detection", href: "/features/anomaly-detection" },
      { name: "Churn Analysis", description: "Customer retention insights", href: "/features/churn-risk-analysis" },
      { name: "Data Warehouse", description: "Centralized data repository", href: "/features/data-warehouse" },
      { name: "Export Manager", description: "Report export and scheduling", href: "/features/export-manager" },
      { name: "Scheduled Reports", description: "Automated report delivery", href: "/features/scheduled-reports" },
      { name: "Growth Metrics", description: "Business growth tracking", href: "/features/growth-metrics" },
    ]
  },
  {
    id: "ai",
    name: "AI & Automation",
    icon: Brain,
    description: "Artificial intelligence and intelligent automation capabilities.",
    color: "bg-violet-500",
    features: [
      { name: "AI Copilot", description: "Conversational AI assistant", href: "/features/copilot" },
      { name: "AI Chat", description: "Natural language queries", href: "/features/ai-chat" },
      { name: "AI Assistant", description: "Context-aware help", href: "/features/ai-assistant" },
      { name: "Semantic Search", description: "Intelligent content search", href: "/features/semantic-search" },
      { name: "Document Processing", description: "AI document extraction", href: "/features/document-processing" },
      { name: "Predictive Modeling", description: "Custom ML models", href: "/features/predictive-modeling" },
      { name: "Recommendation Engine", description: "Personalized suggestions", href: "/features/recommendation-engine" },
      { name: "Cognitive Services", description: "Vision and language AI", href: "/features/cognitive-services" },
      { name: "AI Automation", description: "Intelligent process automation", href: "/features/ai-automation" },
    ]
  },
  {
    id: "workflow",
    name: "Workflow & Automation",
    icon: Workflow,
    description: "Business process automation with visual workflow design.",
    color: "bg-teal-500",
    features: [
      { name: "Workflow Designer", description: "Visual workflow builder", href: "/features/workflow-designer" },
      { name: "Workflow Builder", description: "Drag-and-drop automation", href: "/features/workflow-builder" },
      { name: "Workflow Templates", description: "Pre-built workflow templates", href: "/features/workflow-templates" },
      { name: "Workflow Execution", description: "Run and monitor workflows", href: "/features/workflow-execution" },
      { name: "Approval Workflow", description: "Multi-level approvals", href: "/features/approval-workflow" },
      { name: "Automation Rules", description: "Event-triggered actions", href: "/features/automation-rules" },
      { name: "Event Triggers", description: "Webhook and event handling", href: "/features/event-triggers" },
      { name: "Workflow Monitoring", description: "Execution tracking", href: "/features/workflow-monitoring" },
      { name: "Custom Workflows", description: "Tailored process automation", href: "/features/custom-workflows" },
      { name: "BPM Engine", description: "Business process management", href: "/features/bpm" },
    ]
  },
  {
    id: "integration",
    name: "Integration & API",
    icon: GitBranch,
    description: "Connect with external systems through APIs and pre-built integrations.",
    color: "bg-slate-500",
    features: [
      { name: "Integration Hub", description: "Centralized integration management", href: "/features/integration-hub" },
      { name: "API Gateway", description: "API management and security", href: "/features/api-gateway" },
      { name: "API Management", description: "API versioning and documentation", href: "/features/api-management" },
      { name: "Webhook Management", description: "Outbound event notifications", href: "/features/webhook-management" },
      { name: "API Logs", description: "API usage monitoring", href: "/features/api-logs" },
      { name: "Rate Limiting", description: "API throttling controls", href: "/features/rate-limiting" },
      { name: "App Store", description: "Pre-built app marketplace", href: "/features/app-store" },
      { name: "Installed Apps", description: "Manage connected apps", href: "/features/installed-apps" },
      { name: "EDI Connectors", description: "B2B integration", href: "/features/edi-marketplace-connectors" },
      { name: "Data Import/Export", description: "Bulk data operations", href: "/features/data-import" },
    ]
  },
  {
    id: "admin",
    name: "Administration & Security",
    icon: Shield,
    description: "Platform administration, security, and compliance management.",
    color: "bg-red-500",
    features: [
      { name: "User Management", description: "User accounts and profiles", href: "/features/user-management" },
      { name: "Role Management", description: "Role-based access control", href: "/features/role-management" },
      { name: "Permission Matrix", description: "Granular permissions", href: "/features/permission-matrix" },
      { name: "Session Management", description: "Active session control", href: "/features/session-management" },
      { name: "Security Settings", description: "Security configuration", href: "/features/security-settings" },
      { name: "MFA Enrollment", description: "Multi-factor authentication", href: "/features/mfa-enrollment" },
      { name: "Password Policies", description: "Password requirements", href: "/features/password-policies" },
      { name: "Login History", description: "Authentication audit trail", href: "/features/login-history" },
      { name: "Audit Logs", description: "System audit trail", href: "/features/audit-logs" },
      { name: "Compliance Monitoring", description: "Regulatory compliance", href: "/features/compliance-monitoring" },
      { name: "Device Management", description: "Authorized devices", href: "/features/device-management" },
      { name: "System Settings", description: "Global configuration", href: "/features/system-settings" },
      { name: "Tenant Admin", description: "Multi-tenant management", href: "/features/tenant-admin" },
      { name: "Data Governance", description: "Data quality and retention", href: "/features/data-governance" },
    ]
  },
  {
    id: "marketing",
    name: "Marketing & Campaigns",
    icon: TrendingUp,
    description: "Marketing automation, campaigns, and lead generation.",
    color: "bg-rose-500",
    features: [
      { name: "Marketing Dashboard", description: "Campaign overview", href: "/features/marketing" },
      { name: "Campaign Management", description: "Multi-channel campaigns", href: "/features/marketing-campaigns" },
      { name: "Email Marketing", description: "Email campaign builder", href: "/features/email" },
      { name: "Lead Generation", description: "Landing pages and forms", href: "/features/digital-retail-leads" },
      { name: "Marketing Analytics", description: "Campaign performance", href: "/features/marketing-engagement" },
      { name: "Content Management", description: "Marketing content hub", href: "/features/content-management" },
      { name: "Social Media", description: "Social channel management", href: "/features/communication-center" },
      { name: "Segmentation", description: "Audience segmentation", href: "/features/customer-profiles" },
    ]
  },
  {
    id: "ecommerce",
    name: "E-Commerce & Retail",
    icon: ShoppingCart,
    description: "Online store management with POS and omnichannel capabilities.",
    color: "bg-emerald-500",
    features: [
      { name: "Product Catalog", description: "Product information management", href: "/features/product-catalog" },
      { name: "Point of Sale", description: "POS terminal operations", href: "/features/point-of-sale" },
      { name: "Shopping Cart", description: "Cart and checkout", href: "/features/shopping-cart-checkout" },
      { name: "Order Management", description: "Order processing", href: "/features/sales-order-management" },
      { name: "Pricing Engine", description: "Dynamic pricing rules", href: "/features/pricing-promo-engine" },
      { name: "Promotions", description: "Discounts and campaigns", href: "/features/pricing-promotions" },
      { name: "Product Reviews", description: "Customer reviews", href: "/features/product-reviews-ratings" },
      { name: "Omnichannel Orders", description: "Unified order management", href: "/features/omnichannel-orders" },
      { name: "Merchandise Planning", description: "Assortment optimization", href: "/features/merchandise-planning" },
      { name: "Store Operations", description: "Store management", href: "/features/store-operations-dashboard" },
    ]
  },
  {
    id: "compliance",
    name: "Compliance & Governance",
    icon: Lock,
    description: "Regulatory compliance, risk management, and governance.",
    color: "bg-yellow-600",
    features: [
      { name: "Compliance Dashboard", description: "Compliance overview", href: "/features/compliance-dashboard" },
      { name: "Audit Management", description: "Internal and external audits", href: "/features/audit-management" },
      { name: "Risk Assessment", description: "Risk identification and mitigation", href: "/features/compliance-monitoring" },
      { name: "Compliance Reports", description: "Regulatory reporting", href: "/features/compliance-reports" },
      { name: "Policy Management", description: "Policy documentation", href: "/features/compliance-governance" },
      { name: "Compliance Exceptions", description: "Exception handling", href: "/features/compliance-exceptions" },
      { name: "Audit Trails", description: "Complete activity history", href: "/features/audit-trails" },
      { name: "SoD Rules", description: "Segregation of duties", href: "/features/sod-rules" },
    ]
  },
];

const industryModules = [
  { name: "Automotive", icon: Car, count: 12, href: "/industries/automotive", id: "automotive" },
  { name: "Banking & Finance", icon: Landmark, count: 16, href: "/industries/banking", id: "banking" },
  { name: "Healthcare", icon: Heart, count: 15, href: "/industries/healthcare", id: "healthcare" },
  { name: "Education", icon: GraduationCap, count: 11, href: "/industries/education", id: "education" },
  { name: "Retail & E-Commerce", icon: Store, count: 14, href: "/industries/retail", id: "retail" },
  { name: "Manufacturing", icon: Factory, count: 18, href: "/industries/manufacturing", id: "manufacturing" },
  { name: "Logistics", icon: Container, count: 10, href: "/industries/logistics", id: "logistics" },
  { name: "Telecom", icon: Radio, count: 11, href: "/industries/telecom", id: "telecom" },
  { name: "Insurance", icon: FileCheck, count: 12, href: "/industries/insurance", id: "insurance" },
  { name: "Fashion & Apparel", icon: Shirt, count: 9, href: "/industries/fashion", id: "fashion" },
  { name: "Government", icon: Building2, count: 12, href: "/industries/government", id: "government" },
  { name: "Hospitality", icon: Hotel, count: 13, href: "/industries/hospitality", id: "hospitality" },
  { name: "Pharmaceuticals", icon: Pill, count: 14, href: "/industries/pharma", id: "pharma" },
  { name: "CPG", icon: BarChart2, count: 11, href: "/industries/cpg", id: "cpg" },
  { name: "Energy & Utilities", icon: Lightbulb, count: 9, href: "/industries/energy", id: "energy" },
  { name: "Audit & Compliance", icon: FileCheck, count: 8, href: "/industries/audit", id: "audit" },
  { name: "Business Services", icon: BriefcaseIcon, count: 10, href: "/industries/business-services", id: "business-services" },
  { name: "Carrier & Shipping", icon: Plane, count: 9, href: "/industries/carrier", id: "carrier" },
  { name: "Clinical", icon: FlaskConical, count: 11, href: "/industries/clinical", id: "clinical" },
  { name: "Credit & Lending", icon: CreditCard, count: 10, href: "/industries/credit", id: "credit" },
  { name: "Equipment Mfg", icon: HardHat, count: 12, href: "/industries/equipment", id: "equipment" },
  { name: "Events", icon: PartyPopper, count: 8, href: "/industries/events", id: "events" },
  { name: "Export & Import", icon: Ship, count: 10, href: "/industries/export-import", id: "export-import" },
  { name: "Finance & Investment", icon: TrendingUpIcon, count: 13, href: "/industries/finance-investment", id: "finance-investment" },
  { name: "Food & Beverage", icon: UtensilsCrossed, count: 11, href: "/industries/food-beverage", id: "food-beverage" },
  { name: "Freight & Logistics", icon: Truck, count: 12, href: "/industries/freight", id: "freight" },
  { name: "Laboratory", icon: TestTube, count: 10, href: "/industries/laboratory", id: "laboratory" },
  { name: "Lab Technology", icon: Telescope, count: 9, href: "/industries/lab-tech", id: "lab-tech" },
  { name: "Marketing & Advertising", icon: Megaphone, count: 10, href: "/industries/marketing", id: "marketing" },
  { name: "Media & Entertainment", icon: Film, count: 10, href: "/industries/media", id: "media" },
  { name: "Pharmacy", icon: Stethoscope, count: 11, href: "/industries/pharmacy", id: "pharmacy" },
  { name: "Portal & Digital Services", icon: Globe, count: 9, href: "/industries/portal", id: "portal" },
  { name: "Property & Real Estate", icon: Home, count: 10, href: "/industries/property", id: "property" },
  { name: "Real Estate & Construction", icon: Construction, count: 13, href: "/industries/real-estate-construction", id: "real-estate-construction" },
  { name: "Security & Defense", icon: ShieldCheck, count: 11, href: "/industries/security", id: "security" },
  { name: "Shipment Management", icon: PackageIcon, count: 9, href: "/industries/shipment", id: "shipment" },
  { name: "Shipping & Maritime", icon: Anchor, count: 10, href: "/industries/shipping", id: "shipping" },
  { name: "Training & Development", icon: BookOpen, count: 8, href: "/industries/training", id: "training" },
  { name: "Transportation", icon: Bus, count: 11, href: "/industries/transportation", id: "transportation" },
  { name: "Travel & Tourism", icon: Palmtree, count: 10, href: "/industries/travel", id: "travel" },
  { name: "Vehicle & Automotive", icon: Car, count: 12, href: "/industries/vehicle", id: "vehicle" },
  { name: "Warehouse & Storage", icon: Warehouse, count: 9, href: "/industries/warehouse", id: "warehouse" },
  { name: "Wholesale & Distribution", icon: Container, count: 11, href: "/industries/wholesale", id: "wholesale" },
];

const processFlows = [
  { name: "Procure-to-Pay", description: "End-to-end procurement process", href: "/public/processes/procure-to-pay", id: "procure-to-pay" },
  { name: "Order-to-Cash", description: "Sales to payment collection", href: "/public/processes/order-to-cash", id: "order-to-cash" },
  { name: "Hire-to-Retire", description: "Employee lifecycle management", href: "/public/processes/hire-to-retire", id: "hire-to-retire" },
  { name: "Month-End Consolidation", description: "Financial close process", href: "/public/processes/month-end-consolidation", id: "month-end" },
  { name: "Compliance & Risk", description: "Risk and compliance workflow", href: "/public/processes/compliance-risk", id: "compliance-risk" },
  { name: "Inventory Management", description: "Stock management process", href: "/public/processes/inventory-management", id: "inventory" },
  { name: "Production Planning", description: "Manufacturing planning", href: "/public/processes/production-planning", id: "production" },
  { name: "Quality Assurance", description: "Quality control process", href: "/public/processes/quality-assurance", id: "quality" },
];

export default function FeaturesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<string[]>(["crm", "finance"]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const filteredModules = modules.filter(module => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      module.name.toLowerCase().includes(query) ||
      module.description.toLowerCase().includes(query) ||
      module.features.some(f => 
        f.name.toLowerCase().includes(query) || 
        f.description.toLowerCase().includes(query)
      )
    );
  });

  const totalFeatures = modules.reduce((sum, m) => sum + m.features.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Badge className="mb-4" variant="secondary">Enterprise Platform</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Complete Feature Overview
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Explore {totalFeatures}+ features across {modules.length} modules designed to transform your enterprise operations.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{modules.length}</div>
                  <div className="text-sm text-muted-foreground">Core Modules</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{totalFeatures}+</div>
                  <div className="text-sm text-muted-foreground">Features</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary">18</div>
                  <div className="text-sm text-muted-foreground">Process Flows</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{industryModules.length}</div>
                  <div className="text-sm text-muted-foreground">Industry Solutions</div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search features, modules, or capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
                data-testid="input-feature-search"
              />
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="py-8 border-b sticky top-16 bg-background/95 backdrop-blur z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {modules.slice(0, 8).map(module => (
                <Button
                  key={module.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    document.getElementById(module.id)?.scrollIntoView({ behavior: "smooth" });
                    if (!expandedModules.includes(module.id)) {
                      toggleModule(module.id);
                    }
                  }}
                  data-testid={`button-nav-${module.id}`}
                >
                  <module.icon className="h-4 w-4 mr-1" />
                  {module.name}
                </Button>
              ))}
              <Button variant="ghost" size="sm" asChild>
                <a href="#all-modules" data-testid="link-view-all-modules">View All</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Module Details */}
        <section className="py-12" id="all-modules">
          <div className="max-w-7xl mx-auto px-4 space-y-8">
            {filteredModules.map(module => (
              <Card key={module.id} id={module.id} className="overflow-hidden">
                <CardHeader 
                  className={`cursor-pointer hover:bg-muted/50 transition-colors`}
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${module.color} text-white`}>
                        <module.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {module.name}
                          <Badge variant="secondary">{module.features.length} features</Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">{module.description}</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" data-testid={`button-toggle-${module.id}`}>
                      {expandedModules.includes(module.id) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                {expandedModules.includes(module.id) && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {module.features
                        .filter(f => !searchQuery || 
                          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.description.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((feature, index) => (
                        <Link 
                          key={feature.name} 
                          href={feature.href || "#"}
                          className="block"
                          data-testid={`link-feature-${module.id}-${index}`}
                        >
                          <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all group">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                              <div>
                                <div className="font-medium group-hover:text-primary transition-colors">
                                  {feature.name}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {feature.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Process Flows */}
        <section className="py-12 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">End-to-End Process Flows</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Pre-built business processes that integrate across modules for seamless operations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {processFlows.map(process => (
                <Link key={process.name} href={process.href} data-testid={`link-process-${process.id}`}>
                  <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Workflow className="h-5 w-5 text-primary" />
                        <span className="font-medium">{process.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{process.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button asChild variant="outline">
                <Link href="/public/processes" data-testid="link-view-all-processes">View All 18 Process Flows</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Industry Solutions */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Industry Solutions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tailored configurations for specific industry requirements.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {industryModules.map(industry => {
                const IconComponent = industry.icon;
                return (
                  <Link key={industry.name} href={industry.href} data-testid={`link-industry-${industry.id}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <div className="flex justify-center mb-2">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                        <div className="font-medium">{industry.name}</div>
                        <div className="text-sm text-muted-foreground">{industry.count} modules</div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-6">
              <Button asChild variant="outline">
                <Link href="/industries" data-testid="link-explore-industries">Explore All Industries</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
            <p className="text-lg opacity-90 mb-8">
              See how NexusAIFirst can streamline your operations with a personalized demo.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/demo" data-testid="link-request-demo">Request Demo</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
                <Link href="/contact" data-testid="link-contact-sales">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
