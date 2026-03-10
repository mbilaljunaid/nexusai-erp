import React from 'react';
import { DollarSign, TrendingUp, FileText, Calculator, Building2, Receipt, BarChart3, ShieldCheck } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function FinanceModulePage() {
    return (
        <ModulePageTemplate
            name="Finance & Accounting"
            slug="finance"
            category="Core ERP"
            tagline="Complete financial management suite with AI-powered automation and real-time insights"
            description="NexusAI Finance delivers enterprise-grade financial management with comprehensive GL, AP, AR, cash management, fixed assets, expense management, revenue recognition, and financial reporting. Built for multi-entity, multi-currency global operations with SOX compliance, maker-checker workflows, and complete audit trails. AI-powered automation reduces manual effort by 70% while maintaining strict financial controls."

            features={[
                {
                    title: "General Ledger (GL)",
                    description: "Multi-segment chart of accounts with unlimited hierarchies, cross-validation rules, and real-time posting. Support for multiple ledgers (statutory, management, IFRS), intercompany eliminations, and automated journal imports.",
                    icon: <FileText className="w-6 h-6" />
                },
                {
                    title: "Accounts Payable (AP)",
                    description: "AI invoice capture from email/scan with 3-way matching, early payment discounts, and payment automation. Dynamic discounting, supplier portals, and automated 1099 processing.",
                    icon: <Receipt className="w-6 h-6" />
                },
                {
                    title: "Accounts Receivable (AR)",
                    description: "AI-powered collections with payment prediction, automated dunning, and cash application. Customer portals, credit management, and lockbox integration for faster cash collection.",
                    icon: <DollarSign className="w-6 h-6" />
                },
                {
                    title: "Cash Management",
                    description: "Real-time cash positioning across accounts and entities with multi-currency support. Bank reconciliation automation, forecasting, FX revaluation, and zero-based accounting (ZBA).",
                    icon: <TrendingUp className="w-6 h-6" />
                },
                {
                    title: "Fixed Assets",
                    description: "Complete asset lifecycle tracking from acquisition to disposal. Multi-book depreciation (GAAP, tax, IFRS), mass changes, impairment testing, and lease accounting (ASC 842).",
                    icon: <Building2 className="w-6 h-6" />
                },
                {
                    title: "Expense Management",
                    description: "Mobile-first expense capture with AI receipt OCR, mileage tracking, and corporate card reconciliation. Policy enforcement, approval workflows, and direct GL posting.",
                    icon: <Calculator className="w-6 h-6" />
                },
                {
                    title: "Revenue Recognition",
                    description: "ASC 606 / IFRS 15 compliant revenue automation. Contract revenue allocation, performance obligation tracking, deferred revenue schedules, and revenue waterfall analytics.",
                    icon: <BarChart3 className="w-6 h-6" />
                },
                {
                    title: "Financial Reporting",
                    description: "Real-time financial statements, drill-down to transaction detail, custom report designer, and consolidation. Multi-dimensional reporting (entity, department, product, geography) with Excel integration.",
                    icon: <ShieldCheck className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "80% Faster Month-End Close",
                    description: "Automated reconciliations, GL posting, and consolidation reduce close cycles from 10 days to 2 days."
                },
                {
                    title: "99.5% Invoice Accuracy",
                    description: "AI-powered 3-way matching and automated data capture eliminate manual errors and duplicate payments."
                },
                {
                    title: "20% Cash Flow Improvement",
                    description: "Early payment discounts, optimized payment timing, and AI-driven collections accelerate cash conversion."
                },
                {
                    title: "Full SOX & Audit Compliance",
                    description: "Complete audit trails, maker-checker workflows, and automated controls ensure regulatory compliance."
                }
            ]}

            useCases={[
                {
                    title: "Multi-Entity Global Finance",
                    description: "Manage finances across subsidiaries with consolidation, intercompany eliminations, multi-currency, and country-specific statutory reporting."
                },
                {
                    title: "High-Volume Transaction Processing",
                    description: "Process thousands of invoices, receipts, and payments daily with automation and straight-through processing."
                },
                {
                    title: "Subscription & Recurring Revenue",
                    description: "SaaS and service companies with complex revenue recognition, deferred revenue, and recurring billing requirements."
                },
                {
                    title: "SOX-Compliant Manufacturing/Distribution",
                    description: "Companies requiring strict financial controls, segregation of duties, and comprehensive audit capabilities."
                }
            ]}

            integrations={[
                "Banking (ACH, Wires, Positive Pay)",
                "Credit Cards (Amex, Visa, Corporate Cards)",
                "Payment Gateways (Stripe, PayPal)",
                "Tax Systems (Avalara, Vertex)",
                "Treasury Management",
                "EDI Invoice Receipt",
                "OCR Services (AI Document Processing)",
                "ERP & Procurement Systems"
            ]}

            industries={[
                { name: "Manufacturing", slug: "manufacturing" },
                { name: "SaaS", slug: "saas" },
                { name: "Retail", slug: "retail" },
                { name: "Healthcare", slug: "healthcare" },
                { name: "Financial Services", slug: "financial-services" },
                { name: "Professional Services", slug: "professional-services" }
            ]}

            relatedModules={[
                { name: "Procurement & AP Automation", slug: "scm" },
                { name: "Order-to-Cash & AR", slug: "crm" },
                { name: "Project Accounting", slug: "projects" }
            ]}

            pricing={{
                model: "Included",
                description: "Core Finance modules included in all NexusAI ERP packages. Advanced features like AI automation and revenue recognition available as add-ons."
            }}

            testimonials={[
                {
                    quote: "NexusAI cut our month-end close from 12 days to 3 days. The AI-powered GL reconciliations and automated consolidation saved our team 200+ hours per month.",
                    author: "Sarah Johnson",
                    company: "Global Manufacturing Corp",
                    role: "CFO"
                },
                {
                    quote: "Invoice processing used to take our AP team 5 minutes per invoice. With NexusAI's AI capture and 3-way matching, it's now 30 seconds. We process 10x the volume with the same headcount.",
                    author: "Michael Chen",
                    company: "Enterprise Distribution Inc",
                    role: "Controller"
                }
            ]}
        />
    );
}
