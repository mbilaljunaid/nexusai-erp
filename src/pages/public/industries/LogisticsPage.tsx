import React from 'react';
import { Truck, Package, MapPin, BarChart3, DollarSign, Calendar, Users, TrendingUp } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function LogisticsPage() {
    return (
        <IndustryPageTemplate
            name="Logistics & Transportation"
            slug="logistics"
            tagline="Integrated TMS and logistics platform for carriers and 3PLs"
            description="Optimize transportation operations with NexusAI's logistics ERP. From dispatch to delivery, fleet management to freight billing - manage trucking, freight forwarding, and 3PL operations. Real-time tracking, route optimization, and carrier management in one unified platform."

            stats={[
                { value: "99%", label: "On-Time Delivery" },
                { value: "30%", label: "Route Efficiency" },
                { value: "25%", label: "Cost Savings" },
                { value: "500+", label: "Carriers" }
            ]}

            modules={[
                {
                    name: "Transportation Management (TMS)",
                    slug: "tms",
                    description: "Load planning, dispatch, tracking, and delivery confirmation",
                    icon: <Truck className="w-8 h-8 text-primary" />
                },
                {
                    name: "Fleet Management",
                    slug: "fleet",
                    description: "Vehicle tracking, maintenance scheduling, and fuel management",
                    icon: <Package className="w-8 h-8 text-primary" />
                },
                {
                    name: "Freight Billing",
                    slug: "freight-billing",
                    description: "Rating, invoicing, accessorial charges, and payment processing",
                    icon: <DollarSign className="w-8 h-8 text-primary" />
                },
                {
                    name: "Warehouse Management",
                    slug: "logistics-wms",
                    description: "Inbound/outbound, cross-docking, and inventory control",
                    icon: <MapPin className="w-8 h-8 text-primary" />
                },
                {
                    name: "Carrier Management",
                    slug: "carrier-mgmt",
                    description: "Carrier onboarding, performance tracking, and settlements",
                    icon: <Users className="w-8 h-8 text-primary" />
                },
                {
                    name: "Analytics & Reporting",
                    slug: "logistics-analytics",
                    description: "KPIs, on-time performance, and route profitability",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Route Optimization",
                    description: "AI-powered routing to minimize miles, fuel, and delivery time",
                    icon: <TrendingUp className="w-6 h-6 text-primary" />
                },
                {
                    title: "Real-Time Tracking",
                    description: "GPS tracking with ETA updates and geofencing alerts",
                    icon: <MapPin className="w-6 h-6 text-primary" />
                },
                {
                    title: "Load Board Integration",
                    description: "Connect to DAT, Truckstop.com, and other load boards",
                    icon: <Package className="w-6 h-6 text-primary" />
                },
                {
                    title: "Electronic Logging (ELD)",
                    description: "HOS compliance, DVIR, and FMCSA reporting",
                    icon: <Calendar className="w-6 h-6 text-primary" />
                },
                {
                    title: "Customer Portal",
                    description: "Shipment tracking, POD downloads, and rate quotes",
                    icon: <Users className="w-6 h-6 text-primary" />
                },
                {
                    title: "Fuel Tax Reporting (IFTA)",
                    description: "Automated mileage tracking and IFTA filing",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "FMCSA Regulations",
                "ELD Mandate",
                "IFTA Fuel Tax",
                "DOT Safety Standards",
                "CTPAT (Customs)"
            ]}

            useCases={[
                {
                    title: "Trucking Companies",
                    description: "LTL, FTL, and dedicated fleet operations with dispatch, driver settlement, and safety compliance."
                },
                {
                    title: "Third-Party Logistics (3PL)",
                    description: "Freight brokerage, warehousing, and fulfillment services with multi-client support."
                },
                {
                    title: "Freight Forwarders",
                    description: "International shipping with customs documentation, carrier booking, and multi-modal transport."
                },
                {
                    title: "Last-Mile Delivery",
                    description: "E-commerce fulfillment with route optimization, driver apps, and customer notifications."
                }
            ]}

            successStories={[
                {
                    company: "Regional Freight Lines",
                    quote: "NexusAI's route optimization reduced our fuel costs by 25% and improved on-time delivery to 99%. Customer portal eliminated 80% of tracking calls.",
                    result: "25% fuel savings, 99% on-time"
                }
            ]}
        />
    );
}
