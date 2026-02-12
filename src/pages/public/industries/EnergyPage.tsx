import React from 'react';
import { Zap, BarChart3, Shield, Package, TrendingUp, Activity } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function EnergyPage() {
    return (
        <IndustryPageTemplate
            name="Energy & Utilities"
            slug="energy"
            tagline="Integrated ERP for power generation, transmission, and utility operations"
            description="Transform your energy operations with NexusAI's specialized utility and energy ERP platform. From grid management to customer billing, asset maintenance to regulatory compliance - optimize operations across generation, transmission, and distribution. Support renewable energy integration and smart grid initiatives."

            stats={[
                { value: "99.9%", label: "Grid Uptime" },
                { value: "30%", label: "Cost Savings" },
                { value: "100%", label: "NERC Compliance" },
                { value: "200+", label: "Utilities" }
            ]}

            modules={[
                {
                    name: "Grid Management",
                    slug: "grid-management",
                    description: "SCADA integration, outage management, and distribution automation",
                    icon: <Activity className="w-8 h-8 text-primary" />
                },
                {
                    name: "Customer Billing (CIS)",
                    slug: "utility-billing",
                    description: "Meter-to-cash, rate schedules, and customer portal",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                },
                {
                    name: "Asset Management",
                    slug: "utility-assets",
                    description: "Infrastructure tracking, preventive maintenance, and capital planning",
                    icon: <Package className="w-8 h-8 text-primary" />
                },
                {
                    name: "Energy Trading",
                    slug: "energy-trading",
                    description: "Power purchase agreements, market operations, and risk management",
                    icon: <TrendingUp className="w-8 h-8 text-primary" />
                },
                {
                    name: "Renewable Integration",
                    slug: "renewables",
                    description: "Solar, wind forecasting, and distributed energy resources (DER)",
                    icon: <Zap className="w-8 h-8 text-primary" />
                },
                {
                    name: "Regulatory Compliance",
                    slug: "energy-compliance",
                    description: "NERC CIP, FERC reporting, and environmental compliance",
                    icon: <Shield className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Outage Management (OMS)",
                    description: "Real-time outage detection, crew dispatch, and customer notifications",
                    icon: <Activity className="w-6 h-6 text-primary" />
                },
                {
                    title: "Demand Response",
                    description: "Peak load management, customer incentives, and virtual power plants",
                    icon: <Zap className="w-6 h-6 text-primary" />
                },
                {
                    title: "Smart Meter Integration",
                    description: "AMI data collection, interval billing, and usage analytics",
                    icon: <BarChart3 className="w-6 h-6 text-primary" />
                },
                {
                    title: "Work Order Management",
                    description: "Field service scheduling, mobile workforce, and asset inspections",
                    icon: <Package className="w-6 h-6 text-primary" />
                },
                {
                    title: "Energy Forecasting",
                    description: "Load forecasting, renewable generation prediction, and balancing",
                    icon: <TrendingUp className="w-6 h-6 text-primary" />
                },
                {
                    title: "NERC CIP Compliance",
                    description: "Critical infrastructure protection with automated controls and audit trails",
                    icon: <Shield className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "NERC CIP (Critical Infrastructure Protection)",
                "FERC Regulations",
                "EPA Environmental Standards",
                "ISO 55000 (Asset Management)",
                "OSHA Safety Standards"
            ]}

            useCases={[
                {
                    title: "Electric Utilities",
                    description: "Manage generation, transmission, and distribution operations with integrated outage management, work order dispatch, and customer billing."
                },
                {
                    title: "Renewable Energy Operators",
                    description: "Optimize solar and wind farm operations with production forecasting, maintenance scheduling, and grid interconnection management."
                },
                {
                    title: "Municipal Utilities",
                    description: "Manage multi-commodity operations (electric, water, gas) with unified customer service, billing, and asset management."
                },
                {
                    title: "Energy Marketers & Traders",
                    description: "Handle power purchase agreements, bilateral contracts, and ISO/RTO market participation with real-time position management."
                }
            ]}

            successStories={[
                {
                    company: "Regional Power Cooperative",
                    quote: "NexusAI's outage management reduced our average restoration time by 40% and improved member communication during storms. NERC compliance is automated.",
                    result: "40% faster restoration"
                },
                {
                    company: "Green Energy Solutions",
                    quote: "We manage 500MW of solar assets across 20 sites with predictive maintenance reducing downtime by 35%.",
                    result: "35% less downtime"
                }
            ]}
        />
    );
}
