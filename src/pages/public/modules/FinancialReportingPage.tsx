import React from 'react';
import { FileText, TrendingUp, BarChart3, Download, Eye, Calendar } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function FinancialReportingPage() {
    return (
        <ModulePageTemplate
            name="Financial Reporting"
            slug="financial-reporting"
            category="Finance"
            tagline="Real-time financial reporting with drill-down to source transactions"
            description="Generate comprehensive financial reports with NexusAI's powerful reporting engine. Pre-built reports for P&L, Balance Sheet, Cash Flow, and hundreds of operational reports. Custom report designer with drag-and-drop interface. Real-time data with drill-down to source transactions. Multi-currency, multi-entity consolidation with GAAP/IFRS support."

            features={[
                {
                    title: "Standard Financial Statements",
                    description: "Pre-configured P&L, Balance Sheet, Statement of Cash Flows, and Statement of Changes in Equity with GAAP/IFRS formats.",
                    icon: <FileText className="w-6 h-6" />
                },
                {
                    title: "Custom Report Designer",
                    description: "Drag-and-drop report builder with calculated columns, formatting options, and reusable templates. No coding required.",
                    icon: <BarChart3 className="w-6 h-6" />
                },
                {
                    title: "Drill-Down Analysis",
                    description: "Click any number to drill-down to source transactions, journal entries, or supporting documents. Full audit trail.",
                    icon: <Eye className="w-6 h-6" />
                },
                {
                    title: "Multi-Dimensional Reporting",
                    description: "Report by any segment combination: entity, department, product, project, customer, or custom dimensions.",
                    icon: <TrendingUp className="w-6 h-6" />
                },
                {
                    title: "Scheduled Report Distribution",
                    description: "Automate report generation and email distribution on daily, weekly, or monthly schedules to stakeholder groups.",
                    icon: <Calendar className="w-6 h-6" />
                },
                {
                    title: "Export & Integration",
                    description: "Export to Excel, PDF, CSV with formatting preserved. API access for BI tools like Tableau, Power BI, and Looker.",
                    icon: <Download className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "Instant Financial Visibility",
                    description: "Real-time reports mean you always know your current financial position without waiting for month-end close."
                },
                {
                    title: "Self-Service Reporting",
                    description: "Business users create their own reports without IT or finance support, reducing bottlenecks."
                },
                {
                    title: "Audit-Ready Documentation",
                    description: "Complete drill-down capability and audit trails satisfy auditor requirements and reduce audit time."
                }
            ]}

            useCases={[
                {
                    title: "Executive Dashboards",
                    description: "Real-time KPIs for the C-suite including revenue, expenses, cash, and key performance metrics with trend analysis."
                },
                {
                    title: "Management Reporting",
                    description: "Departmental P&Ls, project profitability, customer profitability, and operational metrics for decision-making."
                },
                {
                    title: "Regulatory & Compliance",
                    description: "SEC filings, tax reporting, internal controls testing, and audit support with standardized formats."
                }
            ]}

            integrations={[
                "General Ledger",
                "All ERP Modules",
                "Power BI",
                "Tableau",
                "Looker",
                "Excel",
                "Data Warehouses"
            ]}

            industries={[
                { name: "Manufacturing", slug: "manufacturing" },
                { name: "Financial Services", slug: "financial-services" },
                { name: "Healthcare", slug: "healthcare" },
                { name: "SaaS", slug: "saas" },
                { name: "Retail", slug: "retail" }
            ]}

            relatedModules={[
                { name: "General Ledger", slug: "general-ledger" },
                { name: "Budgeting & Planning", slug: "budgeting-planning" },
                { name: "Consolidation", slug: "consolidation" }
            ]}

            pricing={{
                model: "Included",
                description: "Core financial reporting included. Advanced analytics and BI integrations available as add-ons."
            }}

            testimonials={[
                {
                    quote: "We replaced 50+ Excel reports with NexusAI's reporting engine. Board members get real-time dashboards and can drill into any number themselves.",
                    author: "Thomas Anderson",
                    company: "Mid-Market Manufacturer",
                    role: "CFO"
                }
            ]}
        />
    );
}
