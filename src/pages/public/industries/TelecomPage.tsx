import React from 'react';
import { Phone, Users, BarChart3, Radio, Smartphone, TrendingUp, DollarSign, Package } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function TelecomPage() {
    return (
        <IndustryPageTemplate
            name="Telecommunications"
            slug="telecom"
            tagline="Complete BSS/OSS platform for telecom operators and service providers"
            description="Transform your telecom operations with NexusAI's unified BSS/OSS platform. From subscriber management to network provisioning, billing to customer care - deliver superior service quality while reducing operational costs. Support mobile, fixed-line, broadband, and enterprise services on one platform."

            stats={[
                { value: "99.99%", label: "Billing Accuracy" },
                { value: "50%", label: "Faster Activation" },
                { value: "35%", label: "Lower Churn" },
                { value: "300+", label: "Operators" }
            ]}

            modules={[
                {
                    name: "Subscriber Management",
                    slug: "subscriber-mgmt",
                    description: "Customer lifecycle,SIM management, and service activation/deactivation",
                    icon: <Users className="w-8 h-8 text-primary" />
                },
                {
                    name: "Convergent Billing",
                    slug: "telecom-billing",
                    description: "Prepaid/postpaid billing, usage rating, and multi-service invoicing",
                    icon: <DollarSign className="w-8 h-8 text-primary" />
                },
                {
                    name: "Network Inventory",
                    slug: "network-inventory",
                    description: "Physical/logical network assets, capacity planning, and topology",
                    icon: <Package className="w-8 h-8 text-primary" />
                },
                {
                    name: "Service Provisioning",
                    slug: "service-provisioning",
                    description: "Automated service activation, order orchestration, and workflow",
                    icon: <Radio className="w-8 h-8 text-primary" />
                },
                {
                    name: "Customer Care",
                    slug: "telecom-care",
                    description: "Omnichannel support, ticketing, and self-service portal",
                    icon: <Phone className="w-8 h-8 text-primary" />
                },
                {
                    name: "Revenue Assurance",
                    slug: "revenue-assurance",
                    description: "Fraud detection, revenue leakage prevention, and reconciliation",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Real-Time Charging",
                    description: "Online/offline charging with balance management and quota allocation",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                },
                {
                    title: "Convergent Catalog",
                    description: "Unified product catalog for mobile, broadband, IPTV, and enterprise services",
                    icon: <Package className="w-6 h-6 text-primary" />
                },
                {
                    title: "Self-Service Portal",
                    description: "Customer portal for plan changes, usage tracking, and bill payments",
                    icon: <Smartphone className="w-6 h-6 text-primary" />
                },
                {
                    title: "Partner Management",
                    description: "MVNO/reseller onboarding, settlement, and wholesale billing",
                    icon: <Users className="w-6 h-6 text-primary" />
                },
                {
                    title: "Churn Analytics",
                    description: "Predictive churn modeling with targeted retention campaigns",
                    icon: <TrendingUp className="w-6 h-6 text-primary" />
                },
                {
                    title: "5G Service Enablement",
                    description: "Network slicing, IoT/M2M billing, and edge computing services",
                    icon: <Radio className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "GDPR Data Privacy",
                "PCI-DSS Payment Security",
                "TM Forum Standards (eTOM, SID)",
                "3GPP 5G Standards",
                "Local Telecom Regulations"
            ]}

            useCases={[
                {
                    title: "Mobile Network Operators (MNO)",
                    description: "Full BSS/OSS stack for mobile operators with prepaid/postpaid convergence, VAS monetization, and roaming settlement."
                },
                {
                    title: "Fixed-Line & Broadband",
                    description: "Fiber, DSL, and cable internet service management with usage-based billing and tiered speed plans."
                },
                {
                    title: "MVNO/MVNE Operations",
                    description: "Virtual network operator platform with wholesale billing, partner portals, and white-label services."
                },
                {
                    title: "Enterprise Services",
                    description: "B2B telecom services with SD-WAN, cloud connectivity, and managed services billing."
                }
            ]}

            successStories={[
                {
                    company: "National Mobile Carrier",
                    quote: "NexusAI's convergent billing platform reduced revenue leakage by 15% and billing complaints by 60%. 5G service launch took just 30 days.",
                    result: "15% less leakage, 30-day 5G launch"
                }
            ]}
        />
    );
}
