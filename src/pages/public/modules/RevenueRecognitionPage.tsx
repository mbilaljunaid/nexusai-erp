import React from 'react';
import { TrendingUp, FileText, Repeat, Shield, BarChart3, Layers } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function RevenueRecognitionPage() {
    return (
        <ModulePageTemplate
            name="Revenue Recognition"
            slug="revenue-recognition"
            category="Finance"
            tagline="ASC 606 / IFRS 15 compliant revenue recognition automation"
            description="Automate complex revenue recognition with NexusAI's ASC 606/IFRS 15 compliant system. Handle multi-element arrangements, performance obligations, contract modifications, and variable consideration. Purpose-built for SaaS, software, professional services, and any business with complex revenue streams. Complete audit trail and disclosure support."

            features={[
                {
                    title: "Contract Workbench",
                    description: "Identify performance obligations, allocate transaction price using SSP, and define recognition schedules with full audit trail.",
                    icon: <FileText className="w-6 h-6" />
                },
                {
                    title: "SSP Management",
                    description: "Maintain standalone selling prices (SSP) by product with historical analysis, residual approach, and adjustment tracking.",
                    icon: <Layers className="w-6 h-6" />
                },
                {
                    title: "Automated Recognition",
                    description: "Daily, monthly, or event-based revenue recognition with automated journal entries to GL. Support for time, milestone, and usage-based models.",
                    icon: <Repeat className="w-6 h-6" />
                },
                {
                    title: "Deferred Revenue Tracking",
                    description: "Real-time view of deferred revenue balances by contract, product, and customer with waterfall analysis.",
                    icon: <TrendingUp className="w-6 h-6" />
                },
                {
                    title: "Revenue Analytics",
                    description: "Dashboards for ARR, MRR, churn, expansion revenue, and cohort analysis. Forecast future recognition from current contracts.",
                    icon: <BarChart3 className="w-6 h-6" />
                },
                {
                    title: "ASC 606 Compliance",
                    description: "Pre-built disclosures, roll-forward schedules, and audit reports meeting ASC 606/IFRS 15 requirements.",
                    icon: <Shield className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "100% ASC 606 Compliance",
                    description: "Automated revenue accounting meets GAAP standards with complete audit documentation and disclosure support."
                },
                {
                    title: "90% Reduction in Manual Effort",
                    description: "Eliminate spreadsheets and manual journal entries with automated revenue calculations and posting."
                },
                {
                    title: "Real-Time Revenue Visibility",
                    description: "Know your recognized vs. deferred revenue position at any moment for better forecasting and decision-making."
                }
            ]}

            useCases={[
                {
                    title: "SaaS & Software Companies",
                    description: "Multi-year subscriptions, usage-based billing, professional services, and complex multi-element arrangements."
                },
                {
                    title: "Professional Services Firms",
                    description: "Time & materials, fixed-fee projects, milestone billing, and retainer arrangements with proper revenue deferral."
                },
                {
                    title: "Hardware + Software Bundles",
                    description: "Allocate transaction price between hardware, software licenses, maintenance, and services using SSP."
                }
            ]}

            integrations={[
                "General Ledger",
                "Accounts Receivable",
                "Billing Management",
                "Contract Management",
                "Subscription Management",
                "CRM",
                "BI/Analytics Tools"
            ]}

            industries={[
                { name: "SaaS", slug: "saas" },
                { name: "Financial Services", slug: "financial-services" },
                { name: "Telecommunications", slug: "telecom" },
                { name: "Manufacturing", slug: "manufacturing" }
            ]}

            relatedModules={[
                { name: "General Ledger", slug: "general-ledger" },
                { name: "Accounts Receivable", slug: "accounts-receivable" },
                { name: "Billing Management", slug: "billing-management" }
            ]}

            pricing={{
                model: "Add-on",
                description: "ASC 606 Revenue Recognition available as premium add-on module"
            }}

            testimonials={[
                {
                    quote: "We went from 2 weeks of manual spreadsheet hell to automated recognition in minutes. ASC 606 compliance is built-in and our auditors love the documentation.",
                    author: "Lisa Wang",
                    company: "Enterprise SaaS Platform",
                    role: "VP Revenue Operations"
                }
            ]}
        />
    );
}
