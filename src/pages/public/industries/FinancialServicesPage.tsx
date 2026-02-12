import React from 'react';
import { TrendingUp, Shield, BarChart3, DollarSign, Users, FileText, Package, Briefcase } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function FinancialServicesPage() {
    return (
        <IndustryPageTemplate
            name="Financial Services & Wealth Management"
            slug="financial-services"
            tagline="Comprehensive platform for RIAs, broker-dealers, and asset managers"
            description="Transform wealth management with NexusAI's financial services ERP. From portfolio management to client reporting, compliance to billing - support RIAs, broker-dealers, asset managers, and family offices. Integrated CRM, custodian feeds, and performance reporting in one platform."

            stats={[
                { value: "$50B+", label: "AUM Managed" },
                { value: "99.9%", label: "Data Accuracy" },
                { value: "SOC 2", label: "Certified" },
                { value: "500+", label: "Advisors" }
            ]}

            modules={[
                {
                    name: "Portfolio Management",
                    slug: "portfolio-mgmt",
                    description: "Holdings tracking, rebalancing, model portfolios, and corporate actions",
                    icon: <TrendingUp className="w-8 h-8 text-primary" />
                },
                {
                    name: "Client Relationship Management",
                    slug: "wealth-crm",
                    description: "Client onboarding, household management, and relationship tracking",
                    icon: <Users className="w-8 h-8 text-primary" />
                },
                {
                    name: "Fee Billing",
                    slug: "advisory-billing",
                    description: "AUM-based billing, performance fees, and retainer fees",
                    icon: <DollarSign className="w-8 h-8 text-primary" />
                },
                {
                    name: "Performance Reporting",
                    slug: "performance-reporting",
                    description: "TWR/MWR returns, attribution, and client dashboards",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                },
                {
                    name: "Compliance & Regulatory",
                    slug: "fs-compliance",
                    description: "ADV filings, trade surveillance, and compliance workflows",
                    icon: <Shield className="w-8 h-8 text-primary" />
                },
                {
                    name: "Document Management",
                    slug: "fs-documents",
                    description: "Client agreements, IPS, forms, and e-signatures",
                    icon: <FileText className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Custodian Integration",
                    description: "Data feeds from Schwab, Fidelity, TD Ameritrade, Pershing, and more",
                    icon: <Package className="w-6 h-6 text-primary" />
                },
                {
                    title: "Model Portfolio Management",
                    description: "Create, assign, and rebalance model portfolios across client accounts",
                    icon: <TrendingUp className="w-6 h-6 text-primary" />
                },
                {
                    title: "Client Portal",
                    description: "Performance reports, statements, document vault, and secure messaging",
                    icon: <Users className="w-6 h-6 text-primary" />
                },
                {
                    title: "Fee Calculations",
                    description: "Tiered AUM billing with household aggregation and pro-rating",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                },
                {
                    title: "Compliance Monitoring",
                    description: "Trade restrictions, wash sales, and best execution monitoring",
                    icon: <Shield className="w-6 h-6 text-primary" />
                },
                {
                    title: "Financial Planning Integration",
                    description: "Goal tracking, cash flow projections, and retirement planning",
                    icon: <BarChart3 className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "SEC RIA Regulations",
                "FINRA (Broker-Dealers)",
                "Form ADV",
                "GIPS Standards",
                "SOC 2 Type II",
                "PCI-DSS"
            ]}

            useCases={[
                {
                    title: "Registered Investment Advisors (RIA)",
                    description: "Fee-only advisory firms with portfolio management, client billing, and SEC compliance automation."
                },
                {
                    title: "Broker-Dealers",
                    description: "Commission tracking, FINRA reporting, trade surveillance, and rep compensation management."
                },
                {
                    title: "Multi-Family Offices",
                    description: "Complex household structures, alternative investments, bill pay, and consolidated reporting."
                },
                {
                    title: "Institutional Asset Managers",
                    description: "Separate accounts, performance attribution, GIPS compliance, and institutional client reporting."
                }
            ]}

            successStories={[
                {
                    company: "Regional RIA Firm",
                    quote: "NexusAI automated our entire billing process, saving 40 hours per month. Custodian data feeds eliminated manual entry errors. Clients love the portal.",
                    result: "40 hours saved monthly, zero data errors"
                }
            ]}
        />
    );
}
