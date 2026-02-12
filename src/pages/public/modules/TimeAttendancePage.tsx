import React from 'react';
import { Clock, Calendar, Smartphone, BarChart3, AlertCircle, Users } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function TimeAttendancePage() {
    return (
        <ModulePageTemplate
            name="Time & Attendance"
            slug="time-attendance"
            category="HR"
            tagline="Accurate time tracking with mobile clocks and automated approvals"
            description="Capture employee time with precision using NexusAI's Time & Attendance system. Support for physical time clocks, web clock-in, mobile apps, and biometric devices. Automated meal break enforcement, overtime calculations, and exception management. Real-time integration with payroll eliminates manual entry and ensures accurate paychecks."

            features={[
                {
                    title: "Multiple Clock-In Methods",
                    description: "Web time clock, mobile app, physical terminals, biometric readers, and badge swipe. Geofencing for mobile clock-ins.",
                    icon: <Clock className="w-6 h-6" />
                },
                {
                    title: "Automated Time Calculations",
                    description: "Calculate regular time, overtime, double-time, and shift differentials automatically based on configurable rules.",
                    icon: <BarChart3 className="w-6 h-6" />
                },
                {
                    title: "Leave & PTO Management",
                    description: "Track vacation, sick, personal, and custom leave types with accrual rules, balances, and approval workflows.",
                    icon: <Calendar className="w-6 h-6" />
                },
                {
                    title: "Exception Management",
                    description: "Automated alerts for missed punches, early/late arrivals, unauthorized overtime, and meal break violations.",
                    icon: <AlertCircle className="w-6 h-6" />
                },
                {
                    title: "Mobile Time Entry",
                    description: "iOS and Android apps for remote workers with GPS tracking, project time coding, and offline mode.",
                    icon: <Smartphone className="w-6 h-6" />
                },
                {
                    title: "Manager Dashboards",
                    description: "Real-time visibility into team attendance, labor costs, overtime trends, and time-off requests.",
                    icon: <Users className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "Eliminate Time Theft & Buddy Punching",
                    description: "Biometric and location-based clock-ins prevent time fraud saving 2-8% of payroll costs."
                },
                {
                    title: "100% Payroll Data Accuracy",
                    description: "Direct integration with payroll eliminates manual timecard entry and calculation errors."
                },
                {
                    title: "Reduce Overtime by 10-15%",
                    description: "Real-time overtime alerts and approval workflows help managers control labor costs proactively."
                }
            ]}

            useCases={[
                {
                    title: "Hourly Workforce Management",
                    description: "Retail, hospitality, manufacturing with shift workers requiring punch clocks and overtime tracking."
                },
                {
                    title: "Remote & Field Workers",
                    description: "Construction, field service, home healthcare with mobile time entry and GPS validation."
                },
                {
                    title: "Project Time Tracking",
                    description: "Professional services billing time to clients or projects with approval workflows and utilization reporting."
                }
            ]}

            integrations={[
                "Payroll",
                "Core HR",
                "Scheduling",
                "Project Management",
                "Time Clock Hardware",
                "Biometric Devices",
                "Badge Systems",
                "General Ledger"
            ]}

            industries={[
                { name: "Retail", slug: "retail" },
                { name: "Manufacturing", slug: "manufacturing" },
                { name: "Healthcare", slug: "healthcare" },
                { name: "Construction", slug: "construction" },
                { name: "Hospitality", slug: "hospitality" }
            ]}

            relatedModules={[
                { name: "Payroll", slug: "payroll" },
                { name: "Core HR", slug: "core-hr" },
                { name: "Workforce Scheduling", slug: "workforce-scheduling" }
            ]}

            pricing={{
                model: "Included",
                description: "Core module included. Premium features like biometrics and advanced scheduling available as add-ons."
            }}

            testimonials={[
                {
                    quote: "Mobile time clock with GPS eliminated buddy punching entirely. We're saving $50K annually and payroll processing is 100% accurate now.",
                    author: "Kevin Anderson",
                    company: "Regional Home Healthcare",
                    role: "Operations Director"
                }
            ]}
        />
    );
}
