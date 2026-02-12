import React from 'react';
import { Factory, Package, Cog, TrendingUp, BarChart3, Users, Zap, DollarSign } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function ManufacturingPage() {
    return (
        <IndustryPageTemplate
            name="Manufacturing"
            slug="manufacturing"
            tagline="End-to-end manufacturing ERP from planning to delivery"
            description="Optimize your manufacturing operations with NexusAI's comprehensive ERP platform. Streamline production planning, inventory management, quality control, and supply chain operations. Real-time visibility across your entire manufacturing process helps reduce costs, improve quality, and accelerate time-to-market."

            stats={[
                { value: "35%", label: "Cost Reduction" },
                { value: "50%", label: "Faster Planning" },
                { value: "99.5%", label: "On-Time Delivery" },
                { value: "1000+", label: "Manufacturers" }
            ]}

            modules={[
                {
                    name: "Production Planning (MRP)",
                    slug: "mrp",
                    description: "Material requirements planning, work orders, and capacity planning",
                    icon: <Cog className="w-8 h-8 text-primary" />
                },
                {
                    name: "Shop Floor Control",
                    slug: "shop-floor",
                    description: "Real-time production tracking, labor reporting, and machine monitoring",
                    icon: <Factory className="w-8 h-8 text-primary" />
                },
                {
                    name: "Quality Management",
                    slug: "quality-management",
                    description: "Inspections, non-conformance tracking, and CAPA workflows",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                },
                {
                    name: "Inventory & Warehouse",
                    slug: "wms",
                    description: "Multi-location inventory, bin tracking, and warehouse automation",
                    icon: <Package className="w-8 h-8 text-primary" />
                },
                {
                    name: "Supply Chain Management",
                    slug: "scm",
                    description: "Supplier management, procurement, and logistics optimization",
                    icon: <TrendingUp className="w-8 h-8 text-primary" />
                },
                {
                    name: "Costing & Analytics",
                    slug: "manufacturing-costing",
                    description: "Job costing, variance analysis, and production analytics",
                    icon: <DollarSign className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Bill of Materials (BOM)",
                    description: "Multi-level BOMs, revision control, and what-if analysis for engineering changes",
                    icon: <Package className="w-6 h-6 text-primary" />
                },
                {
                    title: "Work Order Management",
                    description: "Create, schedule, and track work orders with real-time progress updates",
                    icon: <Cog className="w-6 h-6 text-primary" />
                },
                {
                    title: "Shop Floor Execution",
                    description: "Barcode scanning, labor tracking, and production reporting from the floor",
                    icon: <Factory className="w-6 h-6 text-primary" />
                },
                {
                    title: "Quality Inspections",
                    description: "In-process and final inspections with statistical process control (SPC)",
                    icon: <BarChart3 className="w-6 h-6 text-primary" />
                },
                {
                    title: "Demand Forecasting",
                    description: "AI-powered demand forecasting to optimize inventory and production",
                    icon: <Zap className="w-6 h-6 text-primary" />
                },
                {
                    title: "Equipment Maintenance",
                    description: "Preventive maintenance scheduling and asset lifecycle management",
                    icon: <Cog className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "ISO 9001 Quality Management",
                "ISO 14001 Environmental",
                "AS9100 Aerospace",
                "IATF 16949 Automotive",
                "FDA 21 CFR Part 11",
                "Good Manufacturing Practice (GMP)",
                "OSHA Safety Standards"
            ]}

            useCases={[
                {
                    title: "Discrete Manufacturing",
                    description: "Manage complex assembly operations with multi-level BOMs, routing, and work order tracking. Perfect for electronics, machinery, and automotive parts manufacturing."
                },
                {
                    title: "Process Manufacturing",
                    description: "Handle batch production, formula management, and lot traceability for food, chemicals, and pharmaceuticals with built-in compliance tracking."
                },
                {
                    title: "Make-to-Order Production",
                    description: "Configure products per customer specs with real-time quoting, engineering change management, and project-based costing."
                },
                {
                    title: "Contract Manufacturing",
                    description: "Manage multiple customer contracts, shared resources, and variable cost allocation across different production runs."
                }
            ]}

            successStories={[
                {
                    company: "Precision Parts Inc.",
                    quote: "NexusAI's MRP module reduced our material waste by 30% and improved on-time delivery to 99%. The real-time shop floor visibility is a game-changer.",
                    result: "30% less waste, 99% on-time delivery"
                },
                {
                    company: "Global Electronics Manufacturing",
                    quote: "We cut our production planning time in half and gained complete traceability from raw materials to finished goods. ISO 9001 audits are now a breeze.",
                    result: "50% faster planning, full traceability"
                }
            ]}
        />
    );
}
