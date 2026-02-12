import React from 'react';
import { BookOpen, Video, Award, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function LearningManagementPage() {
    return (
        <ModulePageTemplate
            name="Learning Management (LMS)"
            slug="learning-management"
            category="HR"
            tagline="Corporate training platform with compliance tracking and skill development"
            description="Upskill your workforce with NexusAI's comprehensive Learning Management System. Create and deliver training courses, track compliance certifications, assess knowledge retention, and develop skills at scale. Support for video, documents, SCORM, xAPI, and live virtual classrooms. Mobile learning apps for training anywhere, anytime."

            features={[
                {
                    title: "Course Authoring",
                    description: "Drag-and-drop course builder with video, documents, quizzes, and assessments. SCORM and xAPI package import support.",
                    icon: <BookOpen className="w-6 h-6" />
                },
                {
                    title: "Virtual Classrooms",
                    description: "Integrated video conferencing for live training sessions. Schedule, record, and track attendance automatically.",
                    icon: <Video className="w-6 h-6" />
                },
                {
                    title: "Compliance Tracking",
                    description: "Automated certification renewals, expiration alerts, and compliance dashboards for regulatory training requirements.",
                    icon: <Award className="w-6 h-6" />
                },
                {
                    title: "Learning Paths",
                    description: "Structured curriculums for roles or skills with prerequisites, sequencing, and adaptive learning based on performance.",
                    icon: <TrendingUp className="w-6 h-6" />
                },
                {
                    title: "Social Learning",
                    description: "Discussion forums, peer ratings, comments, and knowledge sharing to foster collaborative learning culture.",
                    icon: <Users className="w-6 h-6" />
                },
                {
                    title: "Learning Analytics",
                    description: "Track completion rates, assessment scores, time-to-proficiency, and ROI of training programs.",
                    icon: <BarChart3 className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "100% Compliance Certification",
                    description: "Automated tracking and renewals ensure employees maintain required certifications without manual tracking."
                },
                {
                    title: "60% Faster Onboarding",
                    description: "Structured learning paths get new hires productive faster with consistent training delivery."
                },
                {
                    title: "5X Training Reach",
                    description: "Self-paced online courses scale training to entire organization without instructor bottlenecks."
                }
            ]}

            useCases={[
                {
                    title: "Compliance Training",
                    description: "Healthcare, finance, manufacturing with mandatory certifications like HIPAA, SOX, OSHA, or safety training."
                },
                {
                    title: "Sales Enablement",
                    description: "Product training, sales methodology, and competitive intelligence for distributed sales teams."
                },
                {
                    title: "Technical Skills Development",
                    description: "Software development, IT certifications, and technical skill building with hands-on labs and assessments."
                }
            ]}

            integrations={[
                "Core HR",
                "Talent Management",
                "Recruitment",
                "Video Platforms (Zoom, Teams)",
                "Content Providers (LinkedIn Learning)",
                "Certification Bodies",
                "Single Sign-On (SSO)"
            ]}

            industries={[
                { name: "Healthcare", slug: "healthcare" },
                { name: "Financial Services", slug: "financial-services" },
                { name: "Manufacturing", slug: "manufacturing" },
                { name: "SaaS", slug: "saas" }
            ]}

            relatedModules={[
                { name: "Core HR", slug: "core-hr" },
                { name: "Talent Management", slug: "talent-management" },
                { name: "Onboarding", slug: "onboarding" }
            ]}

            pricing={{
                model: "Add-on",
                description: "Learning Management available as premium add-on module"
            }}

            testimonials={[
                {
                    quote: "We moved 300 hours of instructor-led training online. Onboarding time dropped from 4 weeks to 2, and we can train 500 employees simultaneously.",
                    author: "Dr. Maria Garcia",
                    company: "Regional Healthcare Network",
                    role: "Learning & Development Director"
                }
            ]}
        />
    );
}
