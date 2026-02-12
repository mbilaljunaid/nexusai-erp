import React from 'react';
import { Zap, Users, CreditCard, TrendingUp, BarChart3, RefreshCw, DollarSign, UserCheck } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function SaaSPage() {
    return (
        <IndustryPageTemplate
            name="SaaS"
            slug="saas"
            tagline="Complete subscription management and revenue operations for SaaS companies"
            description="Power your SaaS business with NexusAI's specialized ERP platform. From subscription billing to customer success, revenue recognition to churn analytics - everything you need to scale your recurring revenue business. ASC 606 compliant revenue recognition and SOC 2 security built-in."

            stats={[
                { value: "99.5%", label: "Billing Accuracy" },
                { value: "25%", label: "Churn Reduction" },
                { value: "40%", label: "Faster Close" },
                { value: "5000+", label: "SaaS Companies" }
            ]}

            modules={[
                {
                    name: "Subscription Management",
                    slug: "subscription-management",
                    description: "Plans, pricing tiers, add-ons, and subscription lifecycle automation",
                    icon: <RefreshCw className="w-8 h-8 text-primary" />
                },
                {
                    name: "Usage-Based Billing",
                    slug: "usage-billing",
                    description: "Metering, rating, and billing for consumption-based pricing models",
                    icon: <Zap className="w-8 h-8 text-primary" />
                },
                {
                    name: "Revenue Recognition",
                    slug: "revenue-recognition",
                    description: "ASC 606 compliant revenue recognition with waterfall analytics",
                    icon: <DollarSign className="w-8 h-8 text-primary" />
                },
                {
                    name: "Customer Success",
                    slug: "customer-success",
                    description: "Health scores, playbooks, and proactive retention workflows",
                    icon: <Users className="w-8 h-8 text-primary" />
                },
                {
                    name: "MRR Analytics",
                    slug: "mrr-analytics",
                    description: "MRR, ARR, churn, expansion, and cohort analysis dashboards",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                },
                {
                    name: "Trial Management",
                    slug: "trial-management",
                    description: "Free trial provisioning, conversion tracking, and automated nurturing",
                    icon: <UserCheck className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Flexible Pricing Models",
                    description: "Support per-user, tiered, usage-based, and hybrid pricing with ease",
                    icon: <CreditCard className="w-6 h-6 text-primary" />
                },
                {
                    title: "Automated Dunning",
                    description: "Smart retry logic and customer communication for failed payments",
                    icon: <RefreshCw className="w-6 h-6 text-primary" />
                },
                {
                    title: "Self-Service Portal",
                    description: "Let customers manage subscriptions, view usage, and update billing",
                    icon: <Users className="w-6 h-6 text-primary" />
                },
                {
                    title: "Revenue Waterfall",
                    description: "Visualize bookings → billings → revenue with multi-period contracts",
                    icon: <TrendingUp className="w-6 h-6 text-primary" />
                },
                {
                    title: "Churn Prediction",
                    description: "AI-powered churn risk scores with recommended intervention playbooks",
                    icon: <Zap className="w-6 h-6 text-primary" />
                },
                {
                    title: "Multi-Currency Support",
                    description: "Bill globally in local currencies with automatic FX rate management",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "ASC 606 Revenue Recognition",
                "SOC 2 Type II",
                "GDPR Compliance",
                "PCI-DSS Level 1",
                "ISO 27001 Security"
            ]}

            useCases={[
                {
                    title: "B2B SaaS Platforms",
                    description: "Manage enterprise subscriptions with multi-tier pricing, annual contracts, and custom billing terms. Support sales-led and product-led growth motions."
                },
                {
                    title: "Usage-Based SaaS",
                    description: "Bill customers based on API calls, storage, compute, or custom metrics. Real-time metering and transparent usage dashboards build customer trust."
                },
                {
                    title: "Freemium Models",
                    description: "Track free trial conversions, manage feature limits, and automate upgrade prompts based on usage patterns and customer engagement."
                },
                {
                    title: "Multi-Product SaaS",
                    description: "Cross-sell and upsell additional products with unified billing, consolidated invoices, and single customer view across your product portfolio."
                }
            ]}

            successStories={[
                {
                    company: "CloudTech Solutions",
                    quote: "NexusAI automated our entire billing workflow and reduced revenue close time from 10 days to 2. The ASC 606 compliance dashboard is a lifesaver during audits.",
                    result: "80% faster close, full ASC 606 compliance"
                },
                {
                    company: "DataFlow Analytics",
                    quote: "The churn prediction ML model identified at-risk customers 45 days before cancellation. We reduced churn by 25% in just 6 months.",
                    result: "25% churn reduction, 45-day early warning"
                }
            ]}
        />
    );
}
