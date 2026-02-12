import React from 'react';
import { Heart, Shield, DollarSign, Users, FileText, TrendingUp } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function BenefitsAdministrationPage() {
    return (
        <ModulePageTemplate
            name="Benefits Administration"
            slug="benefits-administration"
            category="HR"
            tagline="Streamline benefits enrollment with carrier integration and ACA compliance"
            description="Simplify benefits management with NexusAI's comprehensive benefits administration platform. Support for medical, dental, vision, life, disability, HSA, FSA, and 401(k) plans. Automated eligibility tracking, open enrollment, qualifying life events, and carrier file feeds. ACA compliance reporting and COBRA administration built-in."

            features={[
                {
                    title: "Online Open Enrollment",
                    description: "Self-service enrollment portal with plan comparisons, cost calculators, and dependent management. Mobile-friendly interface.",
                    icon: <Users className="w-6 h-6" />
                },
                {
                    title: "Carrier Integration",
                    description: "Automated EDI/API feeds to insurance carriers (UnitedHealth, Cigna, Aetna, etc.) eliminate manual enrollment files.",
                    icon: <Shield className="w-6 h-6" />
                },
                {
                    title: "ACA Compliance",
                    description: "Automated 1095-C generation, affordability calculation, measurement periods, and ACA penalty assessment.",
                    icon: <FileText className="w-6 h-6" />
                },
                {
                    title: "Life Event Processing",
                    description: "Workflow-driven processing for marriage, birth, divorce, death with automated carrier notifications and effective dating.",
                    icon: <Heart className="w-6 h-6" />
                },
                {
                    title: "Benefits Cost Management",
                    description: "Track employer vs. employee costs, analyze benefit utilization, and forecast benefits expenses.",
                    icon: <DollarSign className="w-6 h-6" />
                },
                {
                    title: "COBRA Administration",
                    description: "Automated COBRA notifications, premium billing, payment tracking, and duration management.",
                    icon: <TrendingUp className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "90% Reduction in Admin Time",
                    description: "Self-service enrollment and carrier automation eliminate weeks of manual enrollment processing."
                },
                {
                    title: "100% ACA Compliance",
                    description: "Automated tracking and reporting ensure you meet all ACA requirements without manual spreadsheets."
                },
                {
                    title: "99% Enrollment Accuracy",
                    description: "Direct employee entry with validation rules eliminates transcription errors in carrier enrollments."
                }
            ]}

            useCases={[
                {
                    title: "Large Employers (50+ Employees)",
                    description: "ACA applicable employers managing health insurance, FSAs, HSAs, and retirement plans with compliance reporting."
                },
                {
                    title: "Multi-Location Organizations",
                    description: "Different benefit plans by location or division with centralized administration and reporting."
                },
                {
                    title: "Seasonal Workforce",
                    description: "Track variable hour employees, measurement periods, and ACA eligibility for seasonal workers."
                }
            ]}

            integrations={[
                "Core HR",
                "Payroll",
                "Insurance Carriers (EDI/API)",
                "401(k) Providers",
                "HSA/FSA Administrators",
                "COBRA Administrators",
                "General Ledger"
            ]}

            industries={[
                { name: "Retail", slug: "retail" },
                { name: "Healthcare", slug: "healthcare" },
                { name: "Manufacturing", slug: "manufacturing" },
                { name: "Hospitality", slug: "hospitality" }
            ]}

            relatedModules={[
                { name: "Core HR", slug: "core-hr" },
                { name: "Payroll", slug: "payroll" },
                { name: "Compensation Management", slug: "compensation-management" }
            ]}

            pricing={{
                model: "Included",
                description: "Core benefits administration included. Carrier integrations and ACA reporting available as add-ons."
            }}

            testimonials={[
                {
                    quote: "Open enrollment used to take our HR team 3 weeks. Now it's self-service and done in 3 days. ACA reporting is automated - no more spreadsheets.",
                    author: "Rachel Kim",
                    company: "National Retail Chain",
                    role: "Benefits Manager"
                }
            ]}
        />
    );
}
