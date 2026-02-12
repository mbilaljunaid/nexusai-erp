import React from 'react';
import { Receipt, Smartphone, CreditCard, TrendingUp, Users, Zap } from 'lucide-react';
import { ModulePageTemplate } from '@/components/ModulePageTemplate';

export default function ExpenseManagementPage() {
    return (
        <ModulePageTemplate
            name="Expense Management"
            slug="expense-management"
            category="Finance"
            tagline="Mobile-first expense management with AI receipt capture"
            description="Transform expense reporting with NexusAI's intelligent expense management system. Mobile apps for iOS/Android with AI-powered receipt scanning, automated policy enforcement, credit card feeds, and one-click approvals. Reduce expense processing time by 70% while improving compliance and employee satisfaction."

            features={[
                {
                    title: "AI Receipt Capture",
                    description: "Snap photos of receipts with your phone. AI extracts merchant, amount, date, and expense category automatically.",
                    icon: <Smartphone className="w-6 h-6" />
                },
                {
                    title: "Corporate Card Integration",
                    description: "Automatic import of credit card transactions from Amex, Visa, Mastercard with smart matching to expense reports.",
                    icon: <CreditCard className="w-6 h-6" />
                },
                {
                    title: "Policy Enforcement",
                    description: "Configurable expense policies with automated checks for limits, receipt requirements, and approval routing.",
                    icon: <Receipt className="w-6 h-6" />
                },
                {
                    title: "Mileage Tracking",
                    description: "GPS-based mileage tracking with IRS standard rates, route optimization, and automatic expense creation.",
                    icon: <TrendingUp className="w-6 h-6" />
                },
                {
                    title: "One-Click Approvals",
                    description: "Mobile approvals with expense details, policy violations, and approval history. Approve from anywhere.",
                    icon: <Zap className="w-6 h-6" />
                },
                {
                    title: "Per Diem Management",
                    description: "Automated per diem calculations based on travel location, GSA rates, and company policies.",
                    icon: <Users className="w-6 h-6" />
                }
            ]}

            benefits={[
                {
                    title: "70% Faster Expense Processing",
                    description: "AI automation and mobile apps eliminate manual data entry and approval delays."
                },
                {
                    title: "100% Policy Compliance",
                    description: "Automated policy checks prevent violations before submission, reducing audit issues."
                },
                {
                    title: "50% Reduction in Lost Receipts",
                    description: "Mobile capture means employees submit expenses immediately, reducing lost receipts and late submissions."
                }
            ]}

            useCases={[
                {
                    title: "Sales & Field Teams",
                    description: "Mobile workers submit expenses on-the-go with automatic mileage tracking and receipt capture."
                },
                {
                    title: "Professional Services",
                    description: "Client billable expenses with project coding, billback tracking, and revenue recognition integration."
                },
                {
                    title: "Corporate Travel Programs",
                    description: "Integrate with travel booking tools, enforce travel policies, and track T&E spend by department."
                }
            ]}

            integrations={[
                "General Ledger",
                "Accounts Payable",
                "Payroll",
                "Corporate Credit Cards",
                "Travel Booking Systems",
                "Project Accounting",
                "HR Systems"
            ]}

            industries={[
                { name: "SaaS", slug: "saas" },
                { name: "Financial Services", slug: "financial-services" },
                { name: "Healthcare", slug: "healthcare" },
                { name: "Construction", slug: "construction" }
            ]}

            relatedModules={[
                { name: "Accounts Payable", slug: "accounts-payable" },
                { name: "General Ledger", slug: "general-ledger" },
                { name: "Payroll", slug: "payroll" }
            ]}

            pricing={{
                model: "Included",
                description: "Core expense management included. AI Receipt Capture available as add-on."
            }}

            testimonials={[
                {
                    quote: "Our sales team loves the mobile app. AI receipt capture saves them hours every month and we get expense reports submitted 5 days faster on average.",
                    author: "Amanda Foster",
                    company: "Software Company",
                    role: "VP Finance"
                }
            ]}
        />
    );
}
