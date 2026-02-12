import React from 'react';
import { Home, DollarSign, Users, FileText, TrendingUp, BarChart3, Briefcase, Calendar } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function RealEstatePage() {
    return (
        <IndustryPageTemplate
            name="Real Estate"
            slug="real-estate"
            tagline="Comprehensive property management and leasing platform"
            description="Transform real estate operations with NexusAI's unified property management platform. From residential to commercial, lease administration to maintenance - manage properties, tenants, and portfolios with ease. Support property owners, managers, and real estate investors with complete visibility and control."

            stats={[
                { value: "98%", label: "Rent Collection" },
                { value: "40%", label: "Faster Leasing" },
                { value: "30%", label: "Cost Savings" },
                { value: "1000+", label: "Properties" }
            ]}

            modules={[
                {
                    name: "Property Management",
                    slug: "property-mgmt",
                    description: "Multi-property portfolio management, unit tracking, and amenities",
                    icon: <Home className="w-8 h-8 text-primary" />
                },
                {
                    name: "Lease Administration",
                    slug: "lease-admin",
                    description: "Lease lifecycle, renewals, amendments, and rent escalations",
                    icon: <FileText className="w-8 h-8 text-primary" />
                },
                {
                    name: "Tenant Portal",
                    slug: "tenant-portal",
                    description: "Online rent payment, maintenance requests, and lease documents",
                    icon: <Users className="w-8 h-8 text-primary" />
                },
                {
                    name: "Maintenance Management",
                    slug: "maintenance",
                    description: "Work orders, vendor management, and preventive maintenance",
                    icon: <Briefcase className="w-8 h-8 text-primary" />
                },
                {
                    name: "Accounting & Billing",
                    slug: "re-accounting",
                    description: "Rent collection, CAM reconciliation, and property accounting",
                    icon: <DollarSign className="w-8 h-8 text-primary" />
                },
                {
                    name: "Analytics & Reporting",
                    slug: "re-analytics",
                    description: "Occupancy rates, NOI, IRR, and portfolio performance",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Online Leasing",
                    description: "Virtual tours, online applications, e-signatures, and instant approval",
                    icon: <Home className="w-6 h-6 text-primary" />
                },
                {
                    title: "Automated Rent Collection",
                    description: "ACH/credit card payments, auto-pay, late fees, and reminders",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                },
                {
                    title: "Maintenance Tracking",
                    description: "Tenant requests, vendor dispatch, completion tracking, and ratings",
                    icon: <Briefcase className="w-6 h-6 text-primary" />
                },
                {
                    title: "CAM Reconciliation",
                    description: "Common area maintenance calculations and tenant billing",
                    icon: <TrendingUp className="w-6 h-6 text-primary" />
                },
                {
                    title: "Vacancy Management",
                    description: "Listing syndication, showings, and lead tracking",
                    icon: <Calendar className="w-6 h-6 text-primary" />
                },
                {
                    title: "Document Management",
                    description: "Lease agreements, certificates of insurance, and compliance docs",
                    icon: <FileText className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "Fair Housing Act",
                "ADA Compliance",
                "State Landlord-Tenant Laws",
                "SOX (for REITs)"
            ]}

            useCases={[
                {
                    title: "Residential Property Management",
                    description: "Multi-family apartments, condos, and single-family homes with tenant screening, lease tracking, and rent collection."
                },
                {
                    title: "Commercial Real Estate",
                    description: "Office, retail, industrial properties with complex lease structures, CAM charges, and tenant improvements."
                },
                {
                    title: "REIT Operations",
                    description: "Large portfolios with investor reporting, asset valuations, and regulatory compliance."
                },
                {
                    title: "Property Development",
                    description: "Pre-leasing, construction draw management, and project budgeting for new developments."
                }
            ]}

            successStories={[
                {
                    company: "Urban Living Properties",
                    quote: "NexusAI eliminated paper leases and reduced lease processing time by 60%. Tenant portal adoption is 85% with 98% online rent payment.",
                    result: "60% faster leasing, 98% online payments"
                }
            ]}
        />
    );
}
