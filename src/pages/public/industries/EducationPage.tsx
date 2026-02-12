import React from 'react';
import { GraduationCap, Users, BookOpen, BarChart3, DollarSign, Calendar, FileText, Package } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function EducationPage() {
    return (
        <IndustryPageTemplate
            name="Education & Higher Ed"
            slug="education"
            tagline="Integrated student information and campus management system"
            description="Transform educational operations with NexusAI's comprehensive education ERP. From student information to financial aid, course management to alumni relations - support K-12, colleges, universities, and training organizations. Deliver superior student experiences while managing complex academic and financial operations."

            stats={[
                { value: "99%", label: "Student Satisfaction" },
                { value: "40%", label: "Admin Efficiency" },
                { value: "50K+", label: "Students" },
                { value: "300+", label: "Institutions" }
            ]}

            modules={[
                {
                    name: "Student Information System (SIS)",
                    slug: "sis",
                    description: "Admissions, enrollment, grades, transcripts, and student records",
                    icon: <GraduationCap className="w-8 h-8 text-primary" />
                },
                {
                    name: "Learning Management (LMS)",
                    slug: "lms",
                    description: "Course content, assignments, assessments, and online learning",
                    icon: <BookOpen className="w-8 h-8 text-primary" />
                },
                {
                    name: "Financial Aid",
                    slug: "financial-aid",
                    description: "Aid packaging, disbursement, compliance, and reporting",
                    icon: <DollarSign className="w-8 h-8 text-primary" />
                },
                {
                    name: "Student Billing",
                    slug: "student-billing",
                    description: "Tuition billing, payment plans, refunds, and 1098-T reporting",
                    icon: <FileText className="w-8 h-8 text-primary" />
                },
                {
                    name: "Course Scheduling",
                    slug: "course-scheduling",
                    description: "Class planning, room assignments, and faculty scheduling",
                    icon: <Calendar className="w-8 h-8 text-primary" />
                },
                {
                    name: "Alumni & Advancement",
                    slug: "alumni",
                    description: "Donor management, fundraising campaigns, and alumni engagement",
                    icon: <Users className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Student Portal",
                    description: "Self-service registration, grades, financial aid, and degree audit",
                    icon: <Users className="w-6 h-6 text-primary" />
                },
                {
                    title: "Degree Audit",
                    description: "Automated degree requirement tracking and what-if analysis",
                    icon: <GraduationCap className="w-6 h-6 text-primary" />
                },
                {
                    title: "Online Registration",
                    description: "Web-based course registration with real-time seat availability",
                    icon: <Calendar className="w-6 h-6 text-primary" />
                },
                {
                    title: "Financial Aid Packaging",
                    description: "Automated aid awarding with federal/state/institutional funds",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                },
                {
                    title: "Analytics & Insights",
                    description: "Retention analytics, enrollment forecasting, and student success metrics",
                    icon: <BarChart3 className="w-6 h-6 text-primary" />
                },
                {
                    title: "Mobile Access",
                    description: "Mobile app for students, faculty, and staff",
                    icon: <Package className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "FERPA (Student Privacy)",
                "Title IV Financial Aid Compliance",
                "IPEDS Reporting",
                "State Education Codes",
                "NCAA Compliance (Athletics)"
            ]}

            useCases={[
                {
                    title: "Higher Education Institutions",
                    description: "Universities and colleges with admissions, registration, financial aid, and student lifecycle management."
                },
                {
                    title: "K-12 School Districts",
                    description: "Student information, attendance tracking, grade books, and parent portals for schools and districts."
                },
                {
                    title: "Online Learning Platforms",
                    description: "Course authoring, virtual classrooms, assessment tools, and certification programs for e-learning."
                },
                {
                    title: "Training & Professional Development",
                    description: "Corporate training, continuing education, and professional certifications with credit tracking."
                }
            ]}

            successStories={[
                {
                    company: "State University System",
                    quote: "NexusAI's SIS reduced registration time from 2 hours to 15 minutes. Student portal adoption is 95% with integrated degree audit showing students exactly what they need to graduate.",
                    result: "15-minute registration, 95% portal adoption"
                }
            ]}
        />
    );
}
