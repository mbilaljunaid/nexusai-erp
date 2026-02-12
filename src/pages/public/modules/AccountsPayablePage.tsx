import React from 'react';
import { FileCheck, Zap, CreditCard, Shield, TrendingDown, Workflow } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function AccountsPayablePage() {
    return (
        <ModulePageTemplate
            name="Accounts Payable"
            slug="accounts-payable"
            category="Finance"
            tagline="Intelligent AP automation with AI invoice capture and payment optimization"
            description="Transform AP operations with NexusAI's automated accounts payable system. AI-powered invoice capture, 3-way matching, automated approvals, and payment optimization reduce manual effort by 80%. Support for multiple payment methods, dynamic discounting, and supplier collaboration portals."

            features={[
                {
                    title: "AI Invoice Capture",
                    description: "Extract invoice data automatically from PDFs, emails, and scanned documents with 99%+ accuracy. No manual data entry required.",
                    icon: <Zap className="w-6 h-6" />
                },
                {
                    title: "3-Way Matching",
                    description: "Automated matching of invoice, purchase order, and goods receipt with intelligent exception handling and tolerance rules.",
                    icon: <FileCheck className="w-6 h-6" />
                },
                {
                    title: "Payment Automation",
                    description: "Schedule and execute payments via ACH, wire, checks, or virtual cards. Support for batch payments and positive pay.",
                    icon: <CreditCard className="w-6 h-6" />
                },
                {
                    title: "Dynamic Discounting",
                    description: "Automatically identify and capture early payment discounts. Optimize cash flow vs. discount trade-offs.",
                    icon: <TrendingDown className="w-6 h-6" />
                },
                {
                    title: "Approval Workflows",
                    description: "Configurable approval routing based on amount, department, GL account, or custom rules with mobile approval capabilities.",
                    icon: <Workflow className="w-6 h-6" />
                },
                {
                    title: "Vendor Portal",
                    description: "Self-service portal for vendors to submit invoices, check payment status, and update W-9/1099 information.",
                    icon: <Shield className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "80% Reduction in Manual Processing",
                    description: "AI automation eliminates manual data entry and routing, freeing your team to focus on exceptions and strategic work."
                },
                {
                    title: "5+ Days Faster Invoice Processing",
                    description: "Real-time invoice capture and automated workflows accelerate processing from weeks to days."
                },
                {
                    title: "2% Annual Savings from Discounts",
                    description: "Dynamic discounting captures early payment terms that manual processes miss."
                }
            ]}

            useCases={[
                {
                    title: "High-Volume AP Processing",
                    description: "Companies processing 10,000+ invoices/month automate capture, matching, and payment with minimal staff."
                },
                {
                    title: "Multi-Location Operations",
                    description: "Centralize AP across locations with automated routing to local approvers and multi-currency support."
                },
                {
                    title: "Supplier Relationship Management",
                    description: "Improve supplier satisfaction with faster payments, transparent portals, and accurate 1099 reporting."
                }
            ]}

            integrations={[
                "General Ledger",
                "Purchase Orders",
                "Procurement",
                "Cash Management",
                "Expense Management",
                "Fixed Assets",
                "Project Accounting"
            ]}

            industries={[
                { name: "Manufacturing", slug: "manufacturing" },
                { name: "Healthcare", slug: "healthcare" },
                { name: "Retail", slug: "retail" },
                { name: "Construction", slug: "construction" }
            ]}

            relatedModules={[
                { name: "Procurement", slug: "procurement" },
                { name: "General Ledger", slug: "general-ledger" },
                { name: "Cash Management", slug: "cash-management" }
            ]}

            pricing={{
                model: "Included",
                description: "Core module included in all NexusAI ERP packages. AI Invoice Capture add-on available."
            }}

            testimonials={[
                {
                    quote: "AI invoice capture eliminated 40 hours/week of manual data entry. We now process 15,000 invoices monthly with the same 3-person team.",
                    author: "Michael Torres",
                    company: "Regional Healthcare System",
                    role: "AP Manager"
                }
            ]}
        />
    );
}
