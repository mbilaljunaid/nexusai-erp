import React from 'react';
import { Calculator, FileText, TrendingUp, Shield, Users, BarChart3 } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function GeneralLedgerPage() {
    return (
        <ModulePageTemplate
            name="General Ledger"
            slug="general-ledger"
            category="Finance"
            tagline="Enterprise-grade general ledger with multi-currency, multi-entity consolidation"
            description="NexusAI's General Ledger is the financial foundation of your ERP system. Manage chart of accounts, journal entries, period close, and financial reporting with complete audit trails. Support unlimited accounting calendars, multiple currencies, and automated allocations. Built for global enterprises with complex consolidation requirements."

            features={[
                {
                    title: "Multi-Currency Ledger",
                    description: "Record transactions in any currency with real-time revaluation and automated translation adjustments for consolidated reporting.",
                    icon: <Calculator className="w-6 h-6" />
                },
                {
                    title: "Journal Entry Automation",
                    description: "Automated recurring journals, templates, and intelligent workflow approvals. Support for reversing, statistical, and encumbrance entries.",
                    icon: <FileText className="w-6 h-6" />
                },
                {
                    title: "Period Close Management",
                    description: "Streamlined close process with automated checklists, dependency tracking, and real-time close status dashboards.",
                    icon: <TrendingUp className="w-6 h-6" />
                },
                {
                    title: "Intercompany Accounting",
                    description: "Automated intercompany transactions with matching, reconciliation, and elimination entries for consolidated financials.",
                    icon: <Users className="w-6 h-6" />
                },
                {
                    title: "Segment Accounting",
                    description: "Flexible chart of accounts with up to 30 segments. Track by department, project, product, location, or any custom dimension.",
                    icon: <BarChart3 className="w-6 h-6" />
                },
                {
                    title: "Audit & Compliance",
                    description: "Complete audit trail with SOX controls, segregation of duties, and automated compliance reporting.",
                    icon: <Shield className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "Real-Time Financial Visibility",
                    description: "Instant access to financial position across all entities, currencies, and segments with drill-down to source transactions."
                },
                {
                    title: "50% Faster Period Close",
                    description: "Automated workflows and close checklists reduce close time from weeks to days with improved accuracy."
                },
                {
                    title: "Global Consolidation Made Easy",
                    description: "Multi-GAAP ledgers, automated currency translation, and elimination entries simplify global financial reporting."
                }
            ]}

            useCases={[
                {
                    title: "Multi-National Corporations",
                    description: "Manage 100+ legal entities across different countries with local GAAP and consolidated US GAAP/IFRS reporting."
                },
                {
                    title: "Private Equity Portfolio Companies",
                    description: "Standardize chart of accounts across portfolio companies with roll-up reporting and management consolidation."
                },
                {
                    title: "High-Growth SaaS Companies",
                    description: "Multi-currency subscriptions with ASC 606 revenue recognition and real-time cash flow tracking."
                }
            ]}

            integrations={[
                "Accounts Payable",
                "Accounts Receivable",
                "Fixed Assets",
                "Cash Management",
                "Revenue Recognition",
                "Expense Management",
                "Project Accounting",
                "Inventory Valuation"
            ]}

            industries={[
                { name: "Manufacturing", slug: "manufacturing" },
                { name: "SaaS", slug: "saas" },
                { name: "Financial Services", slug: "financial-services" },
                { name: "Healthcare", slug: "healthcare" },
                { name: "Retail", slug: "retail" }
            ]}

            relatedModules={[
                { name: "Financial Reporting", slug: "financial-reporting" },
                { name: "Budgeting & Planning", slug: "budgeting-planning" },
                { name: "Cash Management", slug: "cash-management" }
            ]}

            pricing={{
                model: "Included",
                description: "Core module included in all NexusAI ERP packages"
            }}

            testimonials={[
                {
                    quote: "NexusAI's GL reduced our consolidation time from 12 days to 3. Multi-currency revaluation is automatic and we can drill into any balance instantly.",
                    author: "Sarah Chen",
                    company: "Global Manufacturing Corp",
                    role: "CFO"
                }
            ]}
        />
    );
}
