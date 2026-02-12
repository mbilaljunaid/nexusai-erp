import React from 'react';
import { Building2, DollarSign, Shield, BarChart3, CreditCard, Users, TrendingUp, FileText } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function BankingPage() {
    return (
        <IndustryPageTemplate
            name="Banking & Financial Services"
            slug="banking"
            tagline="Core banking and financial services platform for digital transformation"
            description="Modernize your banking operations with NexusAI's comprehensive financial services ERP. From core banking to wealth management, loan origination to regulatory compliance - deliver exceptional customer experiences while meeting stringent regulatory requirements. Built for banks, credit unions, and financial institutions."

            stats={[
                { value: "SOC 2", label: "Certified" },
                { value: "99.99%", label: "Uptime" },
                { value: "ISO 27001", label: "Compliant" },
                { value: "500+", label: "Banks" }
            ]}

            modules={[
                {
                    name: "Core Banking System",
                    slug: "core-banking",
                    description: "Account management, deposits, withdrawals, and transaction processing",
                    icon: <Building2 className="w-8 h-8 text-primary" />
                },
                {
                    name: "Loan Origination",
                    slug: "loan-origination",
                    description: "Application processing, credit scoring, underwriting, and approval workflows",
                    icon: <FileText className="w-8 h-8 text-primary" />
                },
                {
                    name: "Treasury Management",
                    slug: "treasury",
                    description: "Cash management, FX trading, and liquidity management",
                    icon: <DollarSign className="w-8 h-8 text-primary" />
                },
                {
                    name: "Risk & Compliance",
                    slug: "banking-compliance",
                    description: "AML/KYC, fraud detection, and regulatory reporting",
                    icon: <Shield className="w-8 h-8 text-primary" />
                },
                {
                    name: "Wealth Management",
                    slug: "wealth-management",
                    description: "Portfolio management, financial planning, and advisor tools",
                    icon: <TrendingUp className="w-8 h-8 text-primary" />
                },
                {
                    name: "Digital Banking",
                    slug: "digital-banking",
                    description: "Mobile banking, online portal, and digital account opening",
                    icon: <CreditCard className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Real-Time Payments",
                    description: "Support for ACH, wire transfers, RTP, and instant payment networks",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                },
                {
                    title: "AML/KYC Automation",
                    description: "Automated customer screening, transaction monitoring, and SAR filing",
                    icon: <Shield className="w-6 h-6 text-primary" />
                },
                {
                    title: "Omnichannel Banking",
                    description: "Unified experience across branch, mobile, web, and call center",
                    icon: <Users className="w-6 h-6 text-primary" />
                },
                {
                    title: "Regulatory Reporting",
                    description: "Automated FDIC, OCC, and Fed reporting with audit trails",
                    icon: <FileText className="w-6 h-6 text-primary" />
                },
                {
                    title: "Credit Risk Management",
                    description: "Portfolio analytics, stress testing, and CECL compliance",
                    icon: <BarChart3 className="w-6 h-6 text-primary" />
                },
                {
                    title: "Open Banking APIs",
                    description: "API gateway for third-party integrations and fintech partnerships",
                    icon: <Building2 className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "Bank Secrecy Act (BSA)",
                "USA PATRIOT Act",
                "Dodd-Frank Act",
                "FDIC Regulations",
                "Basel III",
                "CECL (ASC 326)",
                "SOC 2 Type II",
                "PCI-DSS Level 1",
                "GLBA (Privacy)",
                "OFAC Sanctions Screening"
            ]}

            useCases={[
                {
                    title: "Regional & Community Banks",
                    description: "Full-service core banking with branch operations, commercial lending, and retail banking. Compete with larger banks through superior customer service and local market knowledge."
                },
                {
                    title: "Credit Unions",
                    description: "Member-focused banking with share accounts, member loans, and community programs. Support credit union-specific products like share certificates and member dividends."
                },
                {
                    title: "Digital-Only Banks",
                    description: "Modern neo-bank operations with mobile-first customer experience, instant account opening, and AI-powered financial insights. No legacy infrastructure burden."
                },
                {
                    title: "Commercial Lending",
                    description: "Manage complex commercial loan portfolios with covenant tracking, participations, and relationship banking tools for business customers."
                }
            ]}

            successStories={[
                {
                    company: "Community First Bank",
                    quote: "NexusAI helped us launch mobile banking in 60 days and reduce loan processing time by 50%. Our members love the instant account opening.",
                    result: "50% faster lending, 60-day mobile launch"
                },
                {
                    company: "Regional Credit Union Network",
                    quote: "The AML automation reduced false positives by 70% while improving detection accuracy. Regulatory exams are now stress-free.",
                    result: "70% fewer false positives"
                }
            ]}
        />
    );
}
