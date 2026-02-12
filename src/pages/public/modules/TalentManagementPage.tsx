import React from 'react';
import { Target, TrendingUp, Star, BarChart3, Users, FileText } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function TalentManagementPage() {
    return (
        <ModulePageTemplate
            name="Talent Management"
            slug="talent-management"
            category="HR"
            tagline="Develop high performers with goals, reviews, and succession planning"
            description="Build a high-performance culture with NexusAI's Talent Management suite. Continuous performance management with OKRs and goal cascading, 360° reviews, competency frameworks, and succession planning. Replace annual reviews with ongoing feedback and coaching. Identify high potentials and develop future leaders with data-driven insights."

            features={[
                {
                    title: "Goals & OKRs",
                    description: "Cascade company objectives to teams and individuals. Track progress in real-time with automated check-ins and alignment views.",
                    icon: <Target className="w-6 h-6" />
                },
                {
                    title: "Performance Reviews",
                    description: "Configurable review cycles with self, manager, and 360° feedback. Rating scales, competency assessment, and development plans.",
                    icon: <Star className="w-6 h-6" />
                },
                {
                    title: "Continuous Feedback",
                    description: "Real-time recognition, coaching notes, and feedback requests. Replace annual reviews with ongoing performance conversations.",
                    icon: <TrendingUp className="w-6 h-6" />
                },
                {
                    title: "9-Box & Talent Grids",
                    description: "Visualize talent across performance and potential dimensions. Identify high potentials, solid contributors, and development needs.",
                    icon: <BarChart3 className="w-6 h-6" />
                },
                {
                    title: "Succession Planning",
                    description: "Identify successors for critical roles, assess readiness, and create development plans to build your leadership pipeline.",
                    icon: <Users className="w-6 h-6" />
                },
                {
                    title: "Development Plans",
                    description: "Individual development plans with action items, training assignments, mentoring, and progress tracking.",
                    icon: <FileText className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "30% Higher Employee Engagement",
                    description: "Continuous feedback and transparent goals improve engagement scores and reduce voluntary turnover."
                },
                {
                    title: "2X Faster High-Potential Development",
                    description: "Structured succession planning and development programs accelerate leadership readiness."
                },
                {
                    title: "Eliminate Annual Review Burden",
                    description: "Continuous performance management reduces time spent on annual reviews by 70%."
                }
            ]}

            useCases={[
                {
                    title: "High-Growth Companies",
                    description: "Fast-growing organizations building leadership bench strength and scaling performance culture."
                },
                {
                    title: "Enterprise Performance Management",
                    description: "Large companies with formal competency frameworks, calibration sessions, and executive succession."
                },
                {
                    title: "Professional Services Firms",
                    description: "Up-or-out cultures with structured career progression, billability tracking, and partner consideration."
                }
            ]}

            integrations={[
                "Core HR",
                "Learning Management",
                "Compensation Management",
                "Recruitment",
                "Employee Engagement Surveys",
                "HR Analytics",
                "Career Development Tools"
            ]}

            industries={[
                { name: "SaaS", slug: "saas" },
                { name: "Financial Services", slug: "financial-services" },
                { name: "Healthcare", slug: "healthcare" },
                { name: "Manufacturing", slug: "manufacturing" }
            ]}

            relatedModules={[
                { name: "Core HR", slug: "core-hr" },
                { name: "Learning Management", slug: "learning-management" },
                { name: "Compensation Management", slug: "compensation-management" }
            ]}

            pricing={{
                model: "Add-on",
                description: "Talent Management available as premium add-on module"
            }}

            testimonials={[
                {
                    quote: "OKRs and continuous feedback transformed our culture. Engagement scores went from 65% to 89% in one year and we're retaining top performers.",
                    author: "Emily Chen",
                    company: "High-Growth SaaS Company",
                    role: "Chief People Officer"
                }
            ]}
        />
    );
}
