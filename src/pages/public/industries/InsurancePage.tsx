import React from 'react';
import { Shield, FileText, Users, BarChart3, DollarSign, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function InsurancePage() {
    return (
        <IndustryPageTemplate
            name="Insurance"
            slug="insurance"
            tagline="Core insurance platform for P&C, life, and health insurers"
            description="Modernize insurance operations with NexusAI's comprehensive insurance ERP. From policy administration to claims management, underwriting to reinsurance - manage the entire insurance value chain. Support P&C, life, health, and specialty lines with configurable products and workflows."

            stats={[
                { value: "99%", label: "Claims Accuracy" },
                { value: "50%", label: "Faster Processing" },
                { value: "35%", label: "Cost Reduction" },
                { value: "250+", label: "Insurers" }
            ]}

            modules={[
                {
                    name: "Policy Administration",
                    slug: "policy-admin",
                    description: "Policy lifecycle, renewals, endorsements, and cancellations",
                    icon: <FileText className="w-8 h-8 text-primary" />
                },
                {
                    name: "Claims Management",
                    slug: "claims-mgmt",
                    description: "FNOL, adjudication, payment processing, and fraud detection",
                    icon: <AlertTriangle className="w-8 h-8 text-primary" />
                },
                {
                    name: "Underwriting Workbench",
                    slug: "underwriting",
                    description: "Risk assessment, quote generation, and approval workflows",
                    icon: <Shield className="w-8 h-8 text-primary" />
                },
                {
                    name: "Reinsurance Management",
                    slug: "reinsurance",
                    description: "Treaty management, cession processing, and settlement",
                    icon: <Package className="w-8 h-8 text-primary" />
                },
                {
                    name: "Agent/Broker Portal",
                    slug: "agent-portal",
                    description: "Commission tracking, policy binding, and producer management",
                    icon: <Users className="w-8 h-8 text-primary" />
                },
                {
                    name: "Insurance Analytics",
                    slug: "insurance-analytics",
                    description: "Loss ratios, combined ratios, and predictive modeling",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Product Configuration",
                    description: "No-code product builder for new insurance products and coverage options",
                    icon: <Package className="w-6 h-6 text-primary" />
                },
                {
                    title: "Automated Underwriting",
                    description: "Rules engine for instant quotes and bind-on-demand",
                    icon: <Shield className="w-6 h-6 text-primary" />
                },
                {
                    title: "Claims FNOL",
                    description: "Multi-channel first notice of loss with photo upload and geolocation",
                    icon: <AlertTriangle className="w-6 h-6 text-primary" />
                },
                {
                    title: "Fraud Detection",
                    description: "AI-powered fraud scoring with suspicious activity alerts",
                    icon: <TrendingUp className="w-6 h-6 text-primary" />
                },
                {
                    title: "Commission Management",
                    description: "Tiered commission structures, overrides, and automated calculations",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                },
                {
                    title: "Regulatory Reporting",
                    description: "NAIC statutory filings and state regulatory compliance",
                    icon: <FileText className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "NAIC Regulations",
                "Solvency II (EU)",
                "State Insurance Codes",
                "SOC 2 Security",
                "GDPR/CCPA Privacy"
            ]}

            useCases={[
                {
                    title: "Property & Casualty Insurers",
                    description: "Personal auto, homeowners, commercial lines with integrated rating, underwriting, and claims processing."
                },
                {
                    title: "Life & Annuity Carriers",
                    description: "Term/whole life, universal life, annuities with illustrations, new business, and in-force management."
                },
                {
                    title: "Health Insurance",
                    description: "Group/individual health plans with enrollment, eligibility, claims, and network management."
                },
                {
                    title: "Specialty & MGA Operations",
                    description: "Niche products like cyber, D&O, professional liability with binding authority and delegated underwriting."
                }
            ]}

            successStories={[
                {
                    company: "Regional P&C Carrier",
                    quote: "NexusAI's policy admin reduced new business processing from 5 days to 6 hours. Automated underwriting handles 70% of submissions instantly.",
                    result: "5 days to 6 hours, 70% auto-underwriting"
                }
            ]}
        />
    );
}
