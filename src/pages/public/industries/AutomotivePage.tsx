import React from 'react';
import { Car, Wrench, Package, Users, BarChart3, DollarSign, Truck, FileText } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function AutomotivePage() {
    return (
        <IndustryPageTemplate
            name="Automotive"
            slug="automotive"
            tagline="End-to-end ERP for automotive manufacturing, dealers, and service centers"
            description="Drive automotive excellence with NexusAI's specialized ERP platform. From vehicle manufacturing to dealership management, parts inventory to service scheduling - manage the entire automotive value chain. Support OEMs, dealerships, aftermarket, and fleet operations with industry-specific workflows."

            stats={[
                { value: "99.5%", label: "On-Time Delivery" },
                { value: "30%", label: "Inventory Savings" },
                { value: "40%", label: "Service Efficiency" },
                { value: "400+", label: "Dealers/OEMs" }
            ]}

            modules={[
                {
                    name: "Vehicle Manufacturing",
                    slug: "vehicle-mfg",
                    description: "Build-to-order, sequence planning, and final assembly tracking",
                    icon: <Car className="w-8 h-8 text-primary" />
                },
                {
                    name: "Dealer Management (DMS)",
                    slug: "dms",
                    description: "Vehicle inventory, sales, financing, and customer management",
                    icon: <Users className="w-8 h-8 text-primary" />
                },
                {
                    name: "Parts & Accessories",
                    slug: "parts-mgmt",
                    description: "Parts catalog, inventory, pricing, and aftermarket sales",
                    icon: <Package className="w-8 h-8 text-primary" />
                },
                {
                    name: "Service & Repair",
                    slug: "service-mgmt",
                    description: "Service scheduling, work orders, warranty claims, and technician dispatch",
                    icon: <Wrench className="w-8 h-8 text-primary" />
                },
                {
                    name: "Fleet Management",
                    slug: "fleet-mgmt",
                    description: "Fleet tracking, maintenance scheduling, and telematics integration",
                    icon: <Truck className="w-8 h-8 text-primary" />
                },
                {
                    name: "Warranty Management",
                    slug: "warranty-mgmt",
                    description: "Warranty registration, claims processing, and vendor recovery",
                    icon: <FileText className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "VIN Management",
                    description: "Vehicle identification, build configuration, and option tracking",
                    icon: <Car className="w-6 h-6 text-primary" />
                },
                {
                    title: "Digital Retailing",
                    description: "Online vehicle configurator, financing calculator, and trade-in valuation",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                },
                {
                    title: "Service Appointment Booking",
                    description: "Online scheduling with automated reminders and service history",
                    icon: <Wrench className="w-6 h-6 text-primary" />
                },
                {
                    title: "Parts Catalogue Integration",
                    description: "OEM parts catalogs with pricing, availability, and supersession",
                    icon: <Package className="w-6 h-6 text-primary" />
                },
                {
                    title: "Customer Portal",
                    description: "Service history, recall notifications, and maintenance reminders",
                    icon: <Users className="w-6 h-6 text-primary" />
                },
                {
                    title: "IATF 16949 Compliance",
                    description: "Quality management for automotive manufacturing standards",
                    icon: <BarChart3 className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "IATF 16949 Quality",
                "ISO 9001",
                "EPA Emissions Standards",
                "NHTSA Safety Standards",
                "Dealer Compliance Requirements"
            ]}

            useCases={[
                {
                    title: "Auto Manufacturers (OEM)",
                    description: "Manage vehicle production, supply chain, dealer network, and warranty programs with full traceability from parts to finished vehicles."
                },
                {
                    title: "Auto Dealerships",
                    description: "New/used vehicle sales, F&I, service appointments, parts counter, and customer follow-up in one integrated DMS."
                },
                {
                    title: "Independent Service Centers",
                    description: "Multi-brand service operations with parts ordering, labor tracking, and customer communication tools."
                },
                {
                    title: "Fleet Operators",
                    description: "Manage commercial vehicle fleets with GPS tracking, fuel management, preventive maintenance, and driver safety."
                }
            ]}

            successStories={[
                {
                    company: "Regional Auto Dealer Group",
                    quote: "NexusAI's DMS increased our parts sales by 35% through better inventory management and reduced service bay idle time by 40%.",
                    result: "35% more parts sales, 40% less idle time"
                }
            ]}
        />
    );
}
