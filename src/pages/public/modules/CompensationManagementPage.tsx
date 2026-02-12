import React from 'react';
import { DollarSign, TrendingUp, BarChart3, Users, Target, Shield } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function CompensationManagementPage() {
    return (
        <ModulePageTemplate
            name="Compensation Management"
            slug="compensation-management"
            category="HR"
            tagline="Strategic compensation planning with market data and equity analysis"
            description="Design and manage competitive compensation programs with NexusAI's Compensation Management system. Salary structures, pay grades, market benchmarking, merit increases, bonuses, and equity grants. Model compensation scenarios, analyze pay equity, and ensure budget alignment. Support for annual comp cycles, off-cycle adjustments, and executive compensation."

            features={[
                {
                    title: "Salary Structures & Grades",
                    description: "Define pay grades, salary ranges, and job families with midpoint progression and compa-ratio analysis.",
                    icon: <BarChart3 className="w-6 h-6" />
                },
                {
                    title: "Market Benchmarking",
                    description: "Integration with compensation surveys (Radford, Mercer, Payscale) to ensure competitive pay positioning.",
                    icon: <TrendingUp className="w-6 h-6" />
                },
                {
                    title: "Merit & Bonus Planning",
                    description: "Guided comp planning workflow with budget allocation, manager recommendations, and multi-level approvals.",
                    icon: <DollarSign className="w-6 h-6" />
                },
                {
                    title: "Pay Equity Analysis",
                    description: "Identify and address pay gaps by gender, race, or other factors with statistical analysis and remediation tracking.",
                    icon: <Shield className="w-6 h-6" />
                },
                {
                    title: "Equity Grant Management",
                    description: "Track stock options, RSUs, and ESPP with vesting schedules, grant history, and cap table integration.",
                    icon: <Target className="w-6 h-6" />
                },
                {
                    title: "Total Rewards Statements",
                    description: "Personalized compensation statements showing salary, bonus, benefits value, and equity for employee communication.",
                    icon: <Users className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "15% Improvement in Pay Equity",
                    description: "Analytics identify and remediate compensation gaps, improving diversity and reducing legal risk."
                },
                {
                    title: "50% Faster Comp Planning",
                    description: "Automated workflows and modeling tools accelerate annual merit and bonus cycles from months to weeks."
                },
                {
                    title: "90% Budget Accuracy",
                    description: "Real-time budget tracking and what-if modeling prevent overspending and ensure alignment with workforce plans."
                }
            ]}

            useCases={[
                {
                    title: "Annual Compensation Cycles",
                    description: "Large enterprises with structured merit, bonus, and equity refresh processes requiring multi-level approvals."
                },
                {
                    title: "Market-Based Comp Strategy",
                    description: "Tech companies competing for talent with market-benchmarked salaries and equity-heavy packages."
                },
                {
                    title: "Executive Compensation",
                    description: "Board-level comp committee approvals, long-term incentives, and disclosure requirements for public companies."
                }
            ]}

            integrations={[
                "Core HR",
                "Payroll",
                "Talent Management",
                "Budget & Planning",
                "Market Data Providers",
                "Equity Administration",
                "General Ledger"
            ]}

            industries={[
                { name: "SaaS", slug: "saas" },
                { name: "Financial Services", slug: "financial-services" },
                { name: "Healthcare", slug: "healthcare" },
                { name: "Manufacturing", slug: "manufacturing" }
            ]}

            relatedModules={[
                { name: "Core HR", slug: "core-hr" },
                { name: "Payroll", slug: "payroll" },
                { name: "Talent Management", slug: "talent-management" }
            ]}

            pricing={{
                model: "Add-on",
                description: "Compensation Management available as premium add-on module"
            }}

            testimonials={[
                {
                    quote: "Annual comp planning went from 12 weeks to 3. Pay equity analysis helped us close gender gaps and market benchmarking keeps us competitive for engineering talent.",
                    author: "Alex Thompson",
                    company: "Enterprise Software Company",
                    role: "VP Total Rewards"
                }
            ]}
        />
    );
}
