import React from 'react';
<parameter name="Users, User, Clock, Award, GraduationCap, Heart, TrendingUp, DollarSign } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function HRModulePage() {
  return (
    <ModulePageTemplate
      name="Human Resources & Talent"
slug = "hr"
category = "Core ERP"
tagline = "Complete HR suite from hire to retire with AI talent intelligence and global compliance"
description = "NexusAI HR delivers end-to-end human capital management with Core HRIS, Payroll, Time & Attendance, Benefits, Talent Management, Recruitment (ATS), Learning (LMS), and Compensation. Built for global workforces with country-specific compliance, multi-currency payroll, and AI-powered talent analytics. Reduce HR admin by 60% while improving employee experience and retention."

features = {
    [
    {
        title: "Core HR (HRIS)",
        description: "Complete employee lifecycle management from hire to retirement. Personal data, job history, organizational structure, document management, and self-service portals. Global compliance with country-specific fields and workflows.",
        icon: <Users className="w-6 h-6" />
    },
    {
        title: "Payroll",
        description: "Multi-country, multi-currency payroll with automated tax calculations, direct deposit, and pay stub generation. Support for hourly, salaried, commission, and contractor pay with garnishments and deductions.",
        icon: <DollarSign className="w-6 h-6" />
    },
    {
        title: "Time & Attendance",
        description: "Mobile time clocks, biometric integration, shift scheduling, and exception management. PTO accruals, overtime calculations, and project time tracking with payroll integration.",
        icon: <Clock className="w-6 h-6" />
    },
    {
        title: "Benefits Administration",
        description: "Full benefits lifecycle: open enrollment, life events, carrier integration, and ACA compliance. Medical, dental, vision, 401(k), FSA/HSA administration with employee self-service.",
        icon: <Heart className="w-6 h-6" />
    },
    {
        title: "Talent Management",
        description: "Performance reviews (quarterly, annual, 360°), goal setting & OKRs, succession planning, and career development. Continuous feedback and competency tracking for employee growth.",
        icon: <Award className="w-6 h-6" />
    },
    {
        title: "Recruitment (ATS)",
        description: "Full recruiting lifecycle: job postings, applicant tracking, AI resume screening, interview scheduling, and offer management. Multi-channel posting (LinkedIn, Indeed, company careers page) and onboarding workflows.",
        icon: <User className="w-6 h-6" />
    },
    {
        title: "Learning Management (LMS)",
        description: "Training delivery, compliance tracking, virtual classrooms, and certifications. Course library, assessments, learner transcripts, and mobile learning with gamification.",
        icon: <GraduationCap className="w-6 h-6" />
    },
    {
        title: "Compensation Management",
        description: "Salary planning, merit increases, bonus administration, and equity grants. Market benchmarking, pay equity analysis, and compensation bands ensure fair, competitive pay.",
        icon: <TrendingUp className="w-6 h-6" />
    }
    ]}

benefits = {
    [
    {
        title: "60% Reduction in HR Admin",
        description: "Self-service portals, automated workflows, and AI-powered processes free HR to focus on strategic initiatives."
    },
    {
        title: "100% Payroll Accuracy",
        description: "Automated calculations, tax updates, and validation rules eliminate payroll errors and compliance penalties."
    },
    {
        title: "40% Faster Hiring",
        description: "AI resume screening, automated interview scheduling, and streamlined approvals reduce time-to-hire from 45 to 27 days."
    },
    {
        title: "25% Improvement in Retention",
        description: "Career development, performance feedback, and learning opportunities improve employee satisfaction and reduce turnover."
    }
    ]}

useCases = {
    [
    {
        title: "Global Workforce Management",
        description: "Companies with employees across multiple countries requiring localized payroll, benefits, and compliance."
    },
    {
        title: "High-Volume Hiring",
        description: "Retail, hospitality, seasonal businesses processing hundreds of applicants with rapid onboarding needs."
    },
    {
        title: "Deskless/Shift Workers",
        description: "Manufacturing, healthcare, logistics with mobile time tracking, shift scheduling, and union labor rules."
    },
    {
        title: "Professional Services Firms",
        description: "Consulting, law, accounting firms with project time tracking, billable hours, and utilization analytics."
    }
    ]}

integrations = {
    [
    "Payroll Providers (ADP, Paychex)",
    "Benefits Carriers (Anthem, UnitedHealthcare)",
    "Background Check (HireRight, Sterling)",
    "Tax Services (Vertex, Avalara)",
    "Job Boards (LinkedIn, Indeed, Glassdoor)",
    "Learning Content (LinkedIn Learning, Udemy)",
    "Identity & SSO (Okta, Azure AD)",
    "HRIS Migration Tools"
    ]}

industries = {
    [
    { name: "Manufacturing", slug: "manufacturing" },
    { name: "Healthcare", slug: "healthcare" },
    { name: "Retail", slug: "retail" },
    { name: "Professional Services", slug: "professional-services" },
    { name: "Technology", slug: "technology" },
    { name: "Hospitality", slug: "hospitality" }
    ]}

relatedModules = {
    [
    { name: "Workforce Management & Scheduling", slug: "wfm" },
    { name: "Project Time Tracking", slug: "projects" },
    { name: "Employee Self-Service Portal", slug: "portal" }
    ]}

pricing = {{
    model: "Per Employee / Month",
        description: "Core HR and Time & Attendance included. Payroll, Benefits, Talent, Recruitment, and Learning available as add-on modules."
}}

testimonials = {
    [
    {
        quote: "NexusAI HR eliminated 15 hours of manual payroll processing per pay period. The automated tax calculations and direct deposit integration are flawless.",
        author: "Jessica Martinez",
        company: "Mid-Market Manufacturing",
        role: "VP Human Resources"
    },
    {
        quote: "We went from 45 days to hire down to 28 days with NexusAI's ATS. The AI resume screening and automated interview scheduling saved our recruiting team 20 hours per week.",
        author: "David Kim",
        company: "Fast-Growing Tech Startup",
        role: "Head of Talent Acquisition"
    }
    ]}
    />
  );
}
