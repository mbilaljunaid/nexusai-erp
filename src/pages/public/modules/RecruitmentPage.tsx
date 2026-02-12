import React from 'react';
import { UserPlus, Search, Calendar, BarChart3, Users, CheckCircle } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function RecruitmentPage() {
    return (
        <ModulePageTemplate
            name="Recruitment (ATS)"
            slug="recruitment"
            category="HR"
            tagline="Modern applicant tracking with AI-powered screening and sourcing"
            description="Hire faster and smarter with NexusAI's AI-powered Applicant Tracking System. Post to 100+ job boards with one click, screen resumes automatically, schedule interviews with candidates, and track every step of your hiring funnel. Collaborative hiring with interview scorecards, offer management, and seamless onboarding integration."

            features={[
                {
                    title: "AI Resume Screening",
                    description: "Machine learning scores candidates against job requirements, ranking applicants by match quality to surface top talent.",
                    icon: <Search className="w-6 h-6" />
                },
                {
                    title: "Multi-Channel Job Posting",
                    description: "Post to Indeed, LinkedIn, Glassdoor, and 100+ job boards simultaneously. Track source effectiveness and cost-per-hire.",
                    icon: <UserPlus className="w-6 h-6" />
                },
                {
                    title: "Interview Scheduling",
                    description: "Automated interview coordination with calendar integration, candidate self-scheduling, and reminder emails.",
                    icon: <Calendar className="w-6 h-6" />
                },
                {
                    title: "Collaborative Hiring",
                    description: "Structured interview scorecards, hiring team notes, and configurable approval workflows for offers.",
                    icon: <Users className="w-6 h-6" />
                },
                {
                    title: "Candidate Portal",
                    description: "Branded career site with mobile application, status tracking, and document upload for candidates.",
                    icon: <CheckCircle className="w-6 h-6" />
                },
                {
                    title: "Recruiting Analytics",
                    description: "Time-to-fill, cost-per-hire, source effectiveness, pipeline metrics, and diversity hiring dashboards.",
                    icon: <BarChart3 className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "40% Faster Time-to-Fill",
                    description: "Automated screening and scheduling accelerate hiring process from application to offer."
                },
                {
                    title: "3X More Qualified Applicants",
                    description: "Multi-channel posting and AI screening increase quality candidate flow."
                },
                {
                    title: "50% Reduction in Recruiting Costs",
                    description: "Track source effectiveness and optimize spend on job boards and agencies."
                }
            ]}

            useCases={[
                {
                    title: "High-Volume Hiring",
                    description: "Retail, hospitality, call centers hiring hundreds of positions with automated screening and mass scheduling."
                },
                {
                    title: "Technical Recruiting",
                    description: "Tech companies sourcing software engineers with skills-based screening and technical interview workflows."
                },
                {
                    title: "Campus Recruiting",
                    description: "Universities and internship programs with event tracking, offer management, and start date coordination."
                }
            ]}

            integrations={[
                "Core HR",
                "Job Boards (Indeed, LinkedIn)",
                "Background Check Providers",
                "Video Interview Platforms",
                "Assessment Tools",
                "Onboarding",
                "Calendar Systems (Google, Outlook)"
            ]}

            industries={[
                { name: "Retail", slug: "retail" },
                { name: "SaaS", slug: "saas" },
                { name: "Healthcare", slug: "healthcare" },
                { name: "Financial Services", slug: "financial-services" }
            ]}

            relatedModules={[
                { name: "Core HR", slug: "core-hr" },
                { name: "Talent Management", slug: "talent-management" },
                { name: "Onboarding", slug: "onboarding" }
            ]}

            pricing={{
                model: "Add-on",
                description: "Recruitment/ATS available as premium add-on module"
            }}

            testimonials={[
                {
                    quote: "AI resume screening saves our recruiters 15 hours/week. We filled 120 positions in Q4 with the same 3-person team - used to take 6 people.",
                    author: "James Wilson",
                    company: "National Retail Chain",
                    role: "Talent Acquisition Director"
                }
            ]}
        />
    );
}
