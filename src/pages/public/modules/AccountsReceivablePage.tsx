import React from 'react';
import { DollarSign, Users, TrendingUp, FileText, AlertCircle, BarChart3 } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function AccountsReceivablePage() {
    return (
        <ModulePageTemplate
            name="Accounts Receivable"
            slug="accounts-receivable"
            category="Finance"
            tagline="AI-powered AR with automated collections and cash application"
            description="Accelerate cash collection with NexusAI's intelligent AR system. Automated invoicing, AI-powered cash application, predictive collections, and customer portals reduce DSO by 15+ days. Support for complex billing scenarios including subscriptions, milestones, and usage-based pricing."

            features={[
                {
                    title: "Automated Invoicing",
                    description: "Generate invoices from sales orders, contracts, or time entries with customizable templates and multi-language support.",
                    icon: <FileText className="w-6 h-6" />
                },
                {
                    title: "AI Cash Application",
                    description: "Machine learning automatically matches payments to invoices with 98%+ accuracy, handling partial payments and deductions.",
                    icon: <DollarSign className="w-6 h-6" />
                },
                {
                    title: "Predictive Collections",
                    description: "AI scores customer payment risk and prioritizes collection efforts. Automated reminder emails and escalation workflows.",
                    icon: <AlertCircle className="w-6 h-6" />
                },
                {
                    title: "Customer Portal",
                    description: "Self-service portal for customers to view invoices, make payments, and download statements 24/7.",
                    icon: <Users className="w-6 h-6" />
                },
                {
                    title: "Credit Management",
                    description: "Automated credit checks, limits, and holds with integration to credit bureaus and internal payment history.",
                    icon: <TrendingUp className="w-6 h-6" />
                },
                {
                    title: "AR Analytics",
                    description: "Real-time DSO tracking, aging analysis, collector performance, and cash forecasting dashboards.",
                    icon: <BarChart3 className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "15+ Days DSO Reduction",
                    description: "Automated reminders, predictive prioritization, and faster invoicing accelerate cash collection."
                },
                {
                    title: "90% Less Manual Cash Application",
                    description: "AI matching eliminates hours of manual cash posting, even with complex payment scenarios."
                },
                {
                    title: "50% More Effective Collections",
                    description: "Predictive scoring focuses collectors on accounts most likely to pay, improving recovery rates."
                }
            ]}

            useCases={[
                {
                    title: "B2B Distribution",
                    description: "Manage thousands of customer accounts with various payment terms, early payment discounts, and complex pricing."
                },
                {
                    title: "Professional Services",
                    description: "Time & materials billing, milestone invoicing, and retainer management with project-level AR tracking."
                },
                {
                    title: "Subscription Businesses",
                    description: "Recurring invoicing for SaaS, memberships, or service contracts with automated dunning and payment retries."
                }
            ]}

            integrations={[
                "General Ledger",
                "Sales Orders",
                "Revenue Recognition",
                "Cash Management",
                "CRM",
                "Payment Gateways",
                "Credit Bureaus"
            ]}

            industries={[
                { name: "Manufacturing", slug: "manufacturing" },
                { name: "SaaS", slug: "saas" },
                { name: "Retail", slug: "retail" },
                { name: "Financial Services", slug: "financial-services" }
            ]}

            relatedModules={[
                { name: "General Ledger", slug: "general-ledger" },
                { name: "Revenue Recognition", slug: "revenue-recognition" },
                { name: "Cash Management", slug: "cash-management" }
            ]}

            pricing={{
                model: "Included",
                description: "Core module included. AI Cash Application and Predictive Collections available as add-ons."
            }}

            testimonials={[
                {
                    quote: "DSO dropped from 52 to 36 days in 6 months. AI cash application freed up 2 FTEs and predictive collections helped us focus on the right accounts.",
                    author: "Jennifer Park",
                    company: "Tech Distribution Inc",
                    role: "Controller"
                }
            ]}
        />
    );
}
