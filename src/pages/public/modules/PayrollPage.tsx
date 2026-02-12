import React from 'react';
import { DollarSign, Calculator, FileText, Shield, TrendingUp, Zap } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function PayrollPage() {
    return (
        <ModulePageTemplate
            name="Payroll"
            slug="payroll"
            category="HR"
            tagline="Automated global payroll with multi-country tax compliance"
            description="Process payroll accurately and on-time with NexusAI's comprehensive payroll engine. Support for hourly, salaried, commission, and contractor payments. Automated tax calculations for federal, state, and local jurisdictions. Direct deposit, check printing, and pay card support. Full integration with time & attendance, benefits, and general ledger."

            features={[
                {
                    title: "Automated Payroll Processing",
                    description: "Calculate gross-to-net pay with automated tax withholdings, deductions, garnishments, and direct deposits. One-click payroll runs.",
                    icon: <Zap className="w-6 h-6" />
                },
                {
                    title: "Multi-State Tax Compliance",
                    description: "Automated federal, state, and local tax calculations for all 50 states plus multi-state reciprocity and nexus tracking.",
                    icon: <Shield className="w-6 h-6" />
                },
                {
                    title: "Earnings & Deductions Engine",
                    description: "Flexible pay elements supporting hourly, salary, overtime, bonuses, commissions, tips, and custom earning types.",
                    icon: <Calculator className="w-6 h-6" />
                },
                {
                    title: "Tax Filing & Reporting",
                    description: "Automated W-2, 1099, 941, 940 preparation. E-file federal and state returns directly from the system.",
                    icon: <FileText className="w-6 h-6" />
                },
                {
                    title: "Payroll Analytics",
                    description: "Real-time labor cost tracking, burden analysis, departmental cost allocation, and trend reporting.",
                    icon: <TrendingUp className="w-6 h-6" />
                },
                {
                    title: "Employee Pay Access",
                    description: "Self-service portal for employees to view pay stubs, W-2s, and update direct deposit. Mobile app included.",
                    icon: <DollarSign className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "100% Payroll Accuracy",
                    description: "Automated calculations eliminate manual errors and ensure employees are paid correctly every time."
                },
                {
                    title: "75% Faster Payroll Processing",
                    description: "Integration with time & attendance eliminates manual data entry, reducing payroll from days to hours."
                },
                {
                    title: "Zero Compliance Penalties",
                    description: "Automated tax calculations and e-filing keep you compliant with federal, state, and local regulations."
                }
            ]}

            useCases={[
                {
                    title: "Hourly Workforce",
                    description: "Restaurants, retail, manufacturing with time clock integration, overtime rules, shift differentials, and tips."
                },
                {
                    title: "Multi-State Operations",
                    description: "Companies with employees in multiple states managing complex tax withholding and unemployment insurance."
                },
                {
                    title: "Sales & Commission Teams",
                    description: "Complex commission structures, draws, clawbacks, and tiered rates with automated calculations."
                }
            ]}

            integrations={[
                "Core HR",
                "Time & Attendance",
                "Benefits Administration",
                "General Ledger",
                "Expense Management",
                "401(k) Providers",
                "Tax Filing Services",
                "Banking (ACH/Direct Deposit)"
            ]}

            industries={[
                { name: "Retail", slug: "retail" },
                { name: "Manufacturing", slug: "manufacturing" },
                { name: "Healthcare", slug: "healthcare" },
                { name: "Hospitality", slug: "hospitality" }
            ]}

            relatedModules={[
                { name: "Core HR", slug: "core-hr" },
                { name: "Time & Attendance", slug: "time-attendance" },
                { name: "Benefits Administration", slug: "benefits-administration" }
            ]}

            pricing={{
                model: "Included",
                description: "Core payroll included. Tax filing and multi-country payroll available as add-ons."
            }}

            testimonials={[
                {
                    quote: "Payroll processing time dropped from 8 hours to 45 minutes. Tax filing is automated and we haven't had a compliance issue in 2 years.",
                    author: "Marcus Johnson",
                    company: "Regional Restaurant Chain",
                    role: "Payroll Director"
                }
            ]}
        />
    );
}
