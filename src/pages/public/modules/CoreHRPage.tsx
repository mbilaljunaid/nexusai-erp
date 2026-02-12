import React from 'react';
<parameter name="Users, Briefcase, FileText, Shield, BarChart3, Globe } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function CoreHRPage() {
  return (
    <ModulePageTemplate
      name="Core HR (HRIS)"
slug = "core-hr"
category = "HR"
tagline = "Complete employee lifecycle management from hire to retire"
description = "NexusAI's Core HR provides a 360° view of your workforce with comprehensive employee records, organizational management, and self-service portals. Manage the complete employee lifecycle from onboarding to offboarding with automated workflows, compliance tracking, and real-time analytics. Purpose-built for global enterprises with multi-country operations."

features = {
    [
    {
        title: "Employee Master Data",
        description: "Centralized employee profiles with personal info, job history, assignments, compensation, and custom fields. Version history and audit trails.",
        icon: <Users className="w-6 h-6" />
    },
    {
        title: "Organization Management",
        description: "Visual org charts, position management, reporting structures, and matrix organizations. Track dotted-line and solid-line reporting.",
        icon: <Briefcase className="w-6 h-6" />
    },
    {
        title: "Employee Self-Service",
        description: "Mobile-friendly portal for employees to update info, view pay stubs, request time off, and access company documents.",
        icon: <FileText className="w-6 h-6" />
    },
    {
        title: "Global HR Compliance",
        description: "Multi-country support with local labor laws, work permits, visa tracking, and statutory reporting (EEO, VETS, ACA).",
        icon: <Shield className="w-6 h-6" />
    },
    {
        title: "Workflow Automation",
        description: "Automated onboarding/offboarding checklists, life event processing, and approval routing for HR transactions.",
        icon: <BarChart3 className="w-6 h-6" />
    },
    {
        title: "Multi-Country Support",
        description: "Support for 190+ countries with local currencies, languages, date formats, and compliance requirements.",
        icon: <Globe className="w-6 h-6" />
    }
    ]}

benefits = {
    [
    {
        title: "Single Source of Truth",
        description: "One unified employee database eliminates data silos and ensures consistency across all HR processes."
    },
    {
        title: "80% Less HR Admin Work",
        description: "Self-service and automation free HR teams from transactional work to focus on strategic initiatives."
    },
    {
        title: "Global Scale with Local Compliance",
        description: "Manage workforce across multiple countries while maintaining compliance with local labor laws."
    }
    ]}

useCases = {
    [
    {
        title: "Multi-National Corporations",
        description: "Manage 10,000+ employees across 50+ countries with centralized HR processes and local compliance."
    },
    {
        title: "Rapid Growth Companies",
        description: "Scale from 100 to 1,000+ employees with automated onboarding and self-service reducing HR headcount needs."
    },
    {
        title: "Mergers & Acquisitions",
        description: "Consolidate employee data from acquired companies into single HRIS with data migration and integration tools."
    }
    ]}

integrations = {
    [
    "Payroll",
    "Benefits Administration",
    "Time & Attendance",
    "Talent Management",
    "Recruitment",
    "Learning Management",
    "Background Check Providers",
    "Identity Management (SSO)"
    ]}

industries = {
    [
    { name: "Manufacturing", slug: "manufacturing" },
    { name: "Healthcare", slug: "healthcare" },
    { name: "Retail", slug: "retail" },
    { name: "Financial Services", slug: "financial-services" }
    ]}

relatedModules = {
    [
    { name: "Payroll", slug: "payroll" },
    { name: "Talent Management", slug: "talent-management" },
    { name: "Benefits Administration", slug: "benefits-administration" }
    ]}

pricing = {{
    model: "Included",
        description: "Core HR module included in all NexusAI ERP packages"
}}

testimonials = {
    [
    {
        quote: "We consolidated 4 legacy HR systems into NexusAI. Employee self-service adoption is 95% and HR admin time dropped by 70%.",
        author: "Patricia Williams",
        company: "Global Manufacturing Corp",
        role: "CHRO"
    }
    ]}
    />
  );
}
