import React from 'react';
import { ShoppingCart, Package, TrendingUp, Users, BarChart3, DollarSign, Truck, Smartphone } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function EcommercePage() {
    return (
        <IndustryPageTemplate
            name="E-commerce & Online Retail"
            slug="ecommerce"
            tagline="Complete e-commerce platform from storefront to fulfillment"
            description="Scale your online business with NexusAI's unified e-commerce ERP. From product catalog to order fulfillment, customer acquisition to retention - manage omnichannel commerce operations. Support B2C, B2B, D2C, and marketplace sellers with integrated inventory, marketing, and analytics."

            stats={[
                { value: "99.9%", label: "Uptime" },
                { value: "50%", label: "Faster Shipping" },
                { value: "35%", label: "More Revenue" },
                { value: "2000+", label: "Stores" }
            ]}

            modules={[
                {
                    name: "Storefront & Catalog",
                    slug: "storefront",
                    description: "Product pages, search, filters, and personalization",
                    icon: <ShoppingCart className="w-8 h-8 text-primary" />
                },
                {
                    name: "Order Management",
                    slug: "order-mgmt",
                    description: "Order capture, routing, fulfillment, and returns",
                    icon: <Package className="w-8 h-8 text-primary" />
                },
                {
                    name: "Inventory Sync",
                    slug: "inventory-sync",
                    description: "Real-time inventory across channels with automated replenishment",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                },
                {
                    name: "Customer Engagement",
                    slug: "engagement",
                    description: "Email marketing, SMS campaigns, and loyalty programs",
                    icon: <Users className="w-8 h-8 text-primary" />
                },
                {
                    name: "Fulfillment & Shipping",
                    slug: "ecom-fulfillment",
                    description: "Pick/pack, shipping labels, carrier integration, tracking",
                    icon: <Truck className="w-8 h-8 text-primary" />
                },
                {
                    name: "Analytics & Insights",
                    slug: "ecom-analytics",
                    description: "Conversion funnels, customer LTV, and product performance",
                    icon: <TrendingUp className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Headless Commerce",
                    description: "API-first architecture for custom frontends and mobile apps",
                    icon: <Smartphone className="w-6 h-6 text-primary" />
                },
                {
                    title: "Multi-Channel Selling",
                    description: "Sell on your site, Amazon, eBay, social media with unified inventory",
                    icon: <Package className="w-6 h-6 text-primary" />
                },
                {
                    title: "Abandoned Cart Recovery",
                    description: "Automated emails and SMS to recover lost sales",
                    icon: <ShoppingCart className="w-6 h-6 text-primary" />
                },
                {
                    title: "Dynamic Pricing",
                    description: "Promotional pricing, volume discounts, and flash sales",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                },
                {
                    title: "Product Recommendations",
                    description: "AI-powered cross-sell and upsell suggestions",
                    icon: <TrendingUp className="w-6 h-6 text-primary" />
                },
                {
                    title: "Dropshipping Integration",
                    description: "Vendor fulfillment with automated order routing",
                    icon: <Truck className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "PCI-DSS Payment Security",
                "GDPR/CCPA Privacy",
                "ADA Accessibility",
                "Sales Tax Compliance"
            ]}

            useCases={[
                {
                    title: "Direct-to-Consumer (D2C) Brands",
                    description: "Build your brand with owned customer relationships, subscription boxes, and personalized experiences."
                },
                {
                    title: "Multi-Vendor Marketplaces",
                    description: "Enable third-party sellers with vendor onboarding, commission tracking, and payout automation."
                },
                {
                    title: "B2B E-commerce",
                    description: "Custom catalogs per customer, negotiated pricing, purchase orders, and credit terms."
                },
                {
                    title: "Subscription Commerce",
                    description: "Recurring billing, subscription management, and churn prevention for subscription boxes and membership sites."
                }
            ]}

            successStories={[
                {
                    company: "Fashion D2C Brand",
                    quote: "NexusAI's abandoned cart automation recovered 30% of lost sales. Multi-channel inventory prevented overselling, boosting customer satisfaction by 40%.",
                    result: "30% cart recovery, 40% higher satisfaction"
                }
            ]}
        />
    );
}
