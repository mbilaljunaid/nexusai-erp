import React from 'react';
import { ShoppingCart, Package, TrendingUp, Users, BarChart3, Truck, CreditCard, Smartphone } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function RetailPage() {
    return (
        <IndustryPageTemplate
            name="Retail"
            slug="retail"
            tagline="Omnichannel retail management from POS to fulfillment"
            description="Transform your retail operations with NexusAI's unified commerce platform. Manage in-store, online, and mobile channels seamlessly with real-time inventory visibility. From point-of-sale to warehouse management, customer loyalty to analytics - deliver exceptional shopping experiences at scale."

            stats={[
                { value: "99.9%", label: "Inventory Accuracy" },
                { value: "45%", label: "Faster Fulfillment" },
                { value: "35%", label: "More Revenue" },
                { value: "3000+", label: "Retailers" }
            ]}

            modules={[
                {
                    name: "Point of Sale (POS)",
                    slug: "pos",
                    description: "Cloud-based POS with offline mode, mobile checkout, and integrated payments",
                    icon: <ShoppingCart className="w-8 h-8 text-primary" />
                },
                {
                    name: "Inventory Management",
                    slug: "retail-inventory",
                    description: "Multi-location inventory tracking, auto-replenishment, and demand forecasting",
                    icon: <Package className="w-8 h-8 text-primary" />
                },
                {
                    name: "E-commerce Integration",
                    slug: "ecommerce",
                    description: "Unified product catalog, order management, and sync across all channels",
                    icon: <Smartphone className="w-8 h-8 text-primary" />
                },
                {
                    name: "Customer Loyalty",
                    slug: "loyalty",
                    description: "Points programs, tiered rewards, and personalized promotions",
                    icon: <Users className="w-8 h-8 text-primary" />
                },
                {
                    name: "Fulfillment & Logistics",
                    slug: "retail-fulfillment",
                    description: "BOPIS, ship-from-store, and last-mile delivery optimization",
                    icon: <Truck className="w-8 h-8 text-primary" />
                },
                {
                    name: "Retail Analytics",
                    slug: "retail-analytics",
                    description: "Sales trends, basket analysis, and customer insights dashboards",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Unified Commerce",
                    description: "Single view of inventory, customers, and orders across all channels",
                    icon: <ShoppingCart className="w-6 h-6 text-primary" />
                },
                {
                    title: "Real-Time Inventory",
                    description: "Live stock levels across stores, warehouses, and online with auto-sync",
                    icon: <Package className="w-6 h-6 text-primary" />
                },
                {
                    title: "Buy Online, Pickup In-Store (BOPIS)",
                    description: "Seamless BOPIS and curbside pickup with real-time notifications",
                    icon: <Truck className="w-6 h-6 text-primary" />
                },
                {
                    title: "Dynamic Pricing",
                    description: "Rule-based pricing, promotions, and markdowns with conflict resolution",
                    icon: <CreditCard className="w-6 h-6 text-primary" />
                },
                {
                    title: "Customer 360",
                    description: "Complete customer profile with purchase history and preferences",
                    icon: <Users className="w-6 h-6 text-primary" />
                },
                {
                    title: "Demand Forecasting",
                    description: "AI-powered demand prediction to optimize inventory and reduce stockouts",
                    icon: <TrendingUp className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "PCI-DSS Payment Security",
                "GDPR Data Privacy",
                "ADA Accessibility",
                "POS System Compliance"
            ]}

            useCases={[
                {
                    title: "Multi-Store Retail Chains",
                    description: "Centrally manage pricing, promotions, and inventory across hundreds of stores. Real-time dashboards track performance by location, region, and SKU."
                },
                {
                    title: "Omnichannel Fashion Retailers",
                    description: "Manage complex product variants (size, color, style) across stores and online. Enable clienteling and personal shopping experiences."
                },
                {
                    title: "Grocery & Convenience Stores",
                    description: "Handle perishables with expiry tracking, batch management, and automated markdowns. Support online grocery with scheduled delivery slots."
                },
                {
                    title: "Specialty Retail",
                    description: "Personalized customer service with CRM integration, appointment booking, and loyalty programs for high-touch retail experiences."
                }
            ]}

            successStories={[
                {
                    company: "Fashion Forward Boutiques",
                    quote: "NexusAI's omnichannel platform increased our online sales by 60% while reducing inventory carrying costs by 25%. BOPIS adoption exceeded our expectations.",
                    result: "60% more online sales, 25% lower carrying costs"
                },
                {
                    company: "Grocery Plus Stores",
                    quote: "The AI demand forecasting reduced our stockouts by 80% and food waste by 40%. Customers love the real-time inventory visibility on our app.",
                    result: "80% fewer stockouts, 40% less waste"
                }
            ]}
        />
    );
}
