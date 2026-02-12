import React from 'react';
import { Banknote, TrendingUp, RefreshCw, Globe, Shield, BarChart3 } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function CashManagementPage() {
    return (
        <ModulePageTemplate
            name="Cash Management"
            slug="cash-management"
            category="Finance"
            tagline="Real-time treasury operations with automated bank reconciliation"
            description="Optimize liquidity and cash flow with NexusAI's comprehensive cash management platform. Automated bank reconciliation, multi-currency position tracking, cash flow forecasting, and treasury operations. Direct integration with 5,000+ banks worldwide via SWIFT, EDI, and API connections."

            features={[
                {
                    title: "Automated Bank Reconciliation",
                    description: "AI-powered matching of bank statements to GL transactions with intelligent rules engine. Reconcile in minutes, not days.",
                    icon: <RefreshCw className="w-6 h-6" />
                },
                {
                    title: "Real-Time Cash Position",
                    description: "Live view of cash balances across all bank accounts, currencies, and entities with drill-down to source transactions.",
                    icon: <Banknote className="w-6 h-6" />
                },
                {
                    title: "Cash Flow Forecasting",
                    description: "AI-powered 13-week cash flow forecasts based on historical patterns, AP/AR aging, and seasonal trends.",
                    icon: <TrendingUp className="w-6 h-6" />
                },
                {
                    title: "Multi-Currency Management",
                    description: "Manage 150+ currencies with real-time FX rates, automated revaluation, and hedging contract tracking.",
                    icon: <Globe className="w-6 h-6" />
                },
                {
                    title: "Zero-Balance Accounting (ZBA)",
                    description: "Automated sweeps and concentration accounts for optimized cash pooling and interest income maximization.",
                    icon: <BarChart3 className="w-6 h-6" />
                },
                {
                    title: "Fraud Prevention",
                    description: "Positive pay file generation, duplicate payment detection, and bank account validation services.",
                    icon: <Shield className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "95% Faster Reconciliation",
                    description: "Automated matching eliminates manual reconciliation effort, reducing month-end close time significantly."
                },
                {
                    title: "Real-Time Treasury Visibility",
                    description: "Know your exact cash position across all accounts and currencies at any moment, enabling better decisions."
                },
                {
                    title: "Improved Cash Forecasting Accuracy",
                    description: "AI-powered forecasts provide 90%+ accuracy for working capital planning and investment decisions."
                }
            ]}

            useCases={[
                {
                    title: "Multi-National Corporations",
                    description: "Manage 100+ bank accounts across different countries with centralized cash visibility and reporting."
                },
                {
                    title: "Treasury Operations Teams",
                    description: "Daily cash positioning, investment decisions, FX management, and debt covenant compliance tracking."
                },
                {
                    title: "High-Transaction Volume Businesses",
                    description: "Retail, hospitality, or eCommerce with thousands of daily transactions requiring automated reconciliation."
                }
            ]}

            integrations={[
                "General Ledger",
                "Accounts Payable",
                "Accounts Receivable",
                "Banking APIs (SWIFT, EDI)",
                "Payment Processors",
                "FX Rate Providers",
                "Treasury Management Systems"
            ]}

            industries={[
                { name: "Financial Services", slug: "financial-services" },
                { name: "Manufacturing", slug: "manufacturing" },
                { name: "Retail", slug: "retail" },
                { name: "Healthcare", slug: "healthcare" }
            ]}

            relatedModules={[
                { name: "General Ledger", slug: "general-ledger" },
                { name: "Accounts Payable", slug: "accounts-payable" },
                { name: "Accounts Receivable", slug: "accounts-receivable" }
            ]}

            pricing={{
                model: "Included",
                description: "Core cash management included. Bank connectivity and advanced forecasting available as add-ons."
            }}

            testimonials={[
                {
                    quote: "Bank rec went from 3 days to 3 hours per month. Real-time cash position visibility improved our working capital decisions and saved $2M in unnecessary credit line usage.",
                    author: "David Rodriguez",
                    company: "National Retail Chain",
                    role: "Treasurer"
                }
            ]}
        />
    );
}
