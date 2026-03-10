import React from 'react';
import { Building2, Users, FileText, Shield, DollarSign, BarChart3, Scale, Package } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function GovernmentPage() {
    return (
        <IndustryPageTemplate
            name="Government & Public Sector"
            slug="government"
            tagline="Integrated ERP for federal, state, and local government agencies"
            description="Modernize government operations with NexusAI's public sector ERP platform. From budget management to citizen services, procurement to grant administration - deliver transparent, efficient public services. Support federal, state, municipal, and special district agencies with compliance built-in."

            stats={[
                { value: "100%", label: "GASB Compliant" },
                { value: "40%", label: "Process Efficiency" },
                { value: "99.9%", label: "Availability" },
                { value: "500+", label: "Agencies" }
            ]}

            modules={[
                {
                    name: "Fund Accounting",
                    slug: "fund-accounting",
                    description: "Multi-fund accounting, appropriations, and encumbrances",
                    icon: <DollarSign className="w-8 h-8 text-primary" />
                },
                {
                    name: "Budget Management",
                    slug: "govt-budget",
                    description: "Budget preparation, amendments, and expenditure control",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                },
                {
                    name: "Procurement & Purchasing",
                    slug: "govt-procurement",
                    description: "Competitive bidding, vendor management, and purchase orders",
                    icon: <Package className="w-8 h-8 text-primary" />
                },
                {
                    name: "Grant Management",
                    slug: "grant-mgmt",
                    description: "Grant tracking, compliance, reporting, and billing",
                    icon: <FileText className="w-8 h-8 text-primary" />
                },
                {
                    name: "Citizen Services",
                    slug: "citizen-services",
                    description: "Permits, licenses, payments, and service requests",
                    icon: <Users className="w-8 h-8 text-primary" />
                },
                {
                    name: "Asset Management",
                    slug: "govt-assets",
                    description: "Infrastructure tracking, fleet management, and capital planning",
                    icon: <Building2 className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "GASB Compliance",
                    description: "Automated GASB 34, 68, 75, and other governmental accounting standards",
                    icon: <Scale className="w-6 h-6 text-primary" />
                },
                {
                    title: "Appropriation Control",
                    description: "Real-time budget checks with encumbrance tracking",
                    icon: <Shield className="w-6 h-6 text-primary" />
                },
                {
                    title: "Citizen Portal",
                    description: "Self-service permit applications, license renewals, and payments",
                    icon: <Users className="w-6 h-6 text-primary" />
                },
                {
                    title: "Audit Trails",
                    description: "Comprehensive audit logs for transparency and compliance",
                    icon: <FileText className="w-6 h-6 text-primary" />
                },
                {
                    title: "Public Reporting",
                    description: "CAFR, performance dashboards, and open data publishing",
                    icon: <BarChart3 className="w-6 h-6 text-primary" />
                },
                {
                    title: "Grant Compliance",
                    description: "Federal grant tracking with OMB Uniform Guidance compliance",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "GASB Standards",
                "OMB Uniform Guidance (2 CFR 200)",
                "FFATA Transparency Act",
                "Public Records Laws",
                "FISMA Security",
                "Section 508 Accessibility"
            ]}

            useCases={[
                {
                    title: "Municipal Government",
                    description: "Cities and towns with general fund, utilities, and enterprise funds. Support tax collection, permitting, and public works."
                },
                {
                    title: "County Operations",
                    description: "County-level services including health, social services, courts, and law enforcement with complex grant administration."
                },
                {
                    title: "State Agencies",
                    description: "Statewide programs, grants distribution, and centralized procurement with multi-agency consolidation."
                },
                {
                    title: "Special Districts",
                    description: "Water districts, school districts, transit authorities with fund-specific accounting and bond tracking."
                }
            ]}

            successStories={[
                {
                    company: "Metro City Government",
                    quote: "NexusAI reduced budget preparation time by 50% and permit processing from 14 days to 2. Citizens love the online portal - 80% adoption rate.",
                    result: "50% faster budgeting, 2-day permits"
                }
            ]}
        />
    );
}
