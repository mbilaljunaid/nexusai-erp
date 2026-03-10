import React from 'react';
import { Hammer, Building, FileText, DollarSign, Users, Calendar, Package, BarChart3 } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function ConstructionPage() {
    return (
        <IndustryPageTemplate
            name="Construction & Engineering"
            slug="construction"
            tagline="Complete project management for construction and engineering firms"
            description="Build better with NexusAI's construction ERP platform. From project management to cost control, subcontractor management to equipment tracking - handle commercial, residential, and infrastructure projects. Support general contractors, specialty contractors, and construction managers with real-time project visibility."

            stats={[
                { value: "98%", label: "On-Time Delivery" },
                { value: "25%", label: "Cost Savings" },
                { value: "40%", label: "Less Rework" },
                { value: "400+", label: "Contractors" }
            ]}

            modules={[
                {
                    name: "Project Management",
                    slug: "construction-pm",
                    description: "Project planning, scheduling, budgets, and change orders",
                    icon: <Building className="w-8 h-8 text-primary" />
                },
                {
                    name: "Estimating & Bidding",
                    slug: "estimating",
                    description: "Cost estimating, takeoffs, bid management, and proposals",
                    icon: <DollarSign className="w-8 h-8 text-primary" />
                },
                {
                    name: "Contract Management",
                    slug: "construction-contracts",
                    description: "Contracts, subcontracts, change orders, and compliance",
                    icon: <FileText className="w-8 h-8 text-primary" />
                },
                {
                    name: "Field Management",
                    slug: "field-mgmt",
                    description: "Daily reports, time tracking, material tracking, and photos",
                    icon: <Hammer className="w-8 h-8 text-primary" />
                },
                {
                    name: "Equipment Management",
                    slug: "equipment-mgmt",
                    description: "Equipment scheduling, maintenance, and cost allocation",
                    icon: <Package className="w-8 h-8 text-primary" />
                },
                {
                    name: "Analytics & Reporting",
                    slug: "construction-analytics",
                    description: "Job costing, WIP reports, and project profitability",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Job Costing",
                    description: "Real-time cost tracking by phase, cost code, and work breakdown structure",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                },
                {
                    title: "Subcontractor Portal",
                    description: "Bid invitations, contract documents, and payment applications",
                    icon: <Users className="w-6 h-6 text-primary" />
                },
                {
                    title: "Mobile Field App",
                    description: "Time cards, equipment logs, photos, and daily reports from the field",
                    icon: <Hammer className="w-6 h-6 text-primary" />
                },
                {
                    title: "Change Order Management",
                    description: "Change order workflow, approvals, and impact analysis",
                    icon: <FileText className="w-6 h-6 text-primary" />
                },
                {
                    title: "Project Scheduling",
                    description: "Gantt charts, critical path, and resource leveling",
                    icon: <Calendar className="w-6 h-6 text-primary" />
                },
                {
                    title: "Compliance & Safety",
                    description: "Safety tracking, OSHA compliance, and certified payroll",
                    icon: <BarChart3 className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "OSHA Safety Standards",
                "Certified Payroll (Davis-Bacon)",
                "Prevailing Wage",
                "Lien Waivers",
                "Building Codes"
            ]}

            useCases={[
                {
                    title: "General Contractors",
                    description: "Manage multiple projects, subcontractors, and direct costs with integrated job costing and procurement."
                },
                {
                    title: "Specialty Contractors",
                    description: "Electrical, plumbing, HVAC contractors with trade-specific workflows and equipment management."
                },
                {
                    title: "Home Builders",
                    description: "Residential construction with lot tracking, model homes, and buyer selections management."
                },
                {
                    title: "Heavy Civil Construction",
                    description: "Infrastructure projects with equipment-intensive operations, long timelines, and government compliance."
                }
            ]}

            successStories={[
                {
                    company: "Metro Construction Group",
                    quote: "NexusAI's job costing gave us real-time visibility into project profitability. We caught cost overruns early and improved margins by 18%.",
                    result: "18% margin improvement"
                }
            ]}
        />
    );
}
