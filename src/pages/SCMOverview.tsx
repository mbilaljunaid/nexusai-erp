import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    Truck,
    Users,
    DollarSign,
    BarChart3,
    FileText,
    Warehouse,
    TrendingUp,
    ShoppingCart,
    LucideIcon,
} from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";

interface SCMModule {
    title: string;
    description: string;
    icon: LucideIcon;
    path: string;
    badge?: string;
    metrics?: { label: string; value: string }[];
}

const scmModules: SCMModule[] = [
    {
        title: "Procurement",
        description: "Purchase orders, requisitions, and supplier management",
        icon: ShoppingCart,
        path: "/procurement",
        badge: "Core",
        metrics: [
            { label: "Active POs", value: "142" },
            { label: "Pending Approvals", value: "8" },
        ],
    },
    {
        title: "Inventory",
        description: "Stock levels, warehousing, and fulfillment operations",
        icon: Package,
        path: "/inventory",
        badge: "Core",
        metrics: [
            { label: "Items Tracked", value: "3,247" },
            { label: "Low Stock Items", value: "34" },
        ],
    },
    {
        title: "Supplier Management",
        description: "Supplier onboarding, performance, and contracts",
        icon: Users,
        path: "/suppliers",
        badge: "Essential",
        metrics: [
            { label: "Active Suppliers", value: "158" },
            { label: "Top Tier", value: "42" },
        ],
    },
    {
        title: "Cost Management",
        description: "Costing, margins, and price variance analysis",
        icon: DollarSign,
        path: "/scm/costing/dashboard",
        badge: "Analytics",
        metrics: [
            { label: "Avg Margin", value: "23.4%" },
            { label: "Price Variance", value: "-$12K" },
        ],
    },
    {
        title: "WMS Operations",
        description: "Advanced warehouse management and logistics",
        icon: Warehouse,
        path: "/scm/wms/dashboard",
        badge: "Advanced",
        metrics: [
            { label: "Warehouses", value: "12" },
            { label: "Capacity", value: "82%" },
        ],
    },
    {
        title: "Transportation",
        description: "Fleet management, shipping, and logistics",
        icon: Truck,
        path: "/transportation",
        badge: "Logistics",
        metrics: [
            { label: "Active Shipments", value: "89" },
            { label: "On-Time %", value: "94.2%" },
        ],
    },
    {
        title: "Demand Planning",
        description: "Forecasting, planning, and optimization",
        icon: TrendingUp,
        path: "/scm/demand-planning",
        badge: "Planning",
        metrics: [
            { label: "Forecast Accuracy", value: "87%" },
            { label: "Next Period", value: "Q2 2026" },
        ],
    },
    {
        title: "SCM Analytics",
        description: "Supply chain insights and performance dashboards",
        icon: BarChart3,
        path: "/scm/analytics",
        badge: "BI",
        metrics: [
            { label: "Reports", value: "24" },
            { label: "Dashboards", value: "8" },
        ],
    },
    {
        title: "Compliance & Docs",
        description: "Regulatory compliance and documentation",
        icon: FileText,
        path: "/scm/compliance",
        badge: "Governance",
    },
];

const getBadgeVariant = (badge?: string) => {
    switch (badge) {
        case "Core":
            return "default";
        case "Essential":
            return "secondary";
        case "Advanced":
            return "outline";
        default:
            return "secondary";
    }
};

export default function SCMOverview() {
    return (
        <StandardPage
            title="Supply Chain Management"
            description="End-to-end supply chain operations from procurement to delivery"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scmModules.map((module) => (
                    <Link key={module.path} to={module.path}>
                        <Card className="hover:shadow-lg transition-all cursor-pointer h-full group">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <module.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    {module.badge && (
                                        <Badge variant={getBadgeVariant(module.badge)} className="text-xs">
                                            {module.badge}
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-lg mt-3">{module.title}</CardTitle>
                                <CardDescription className="text-sm">{module.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {module.metrics && (
                                    <div className="space-y-2">
                                        {module.metrics.map((metric, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">{metric.label}</span>
                                                <span className="font-semibold">{metric.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!module.metrics && (
                                    <Button variant="ghost" size="sm" className="w-full mt-2">
                                        View Details →
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Spend (YTD)</CardDescription>
                        <CardTitle className="text-2xl">$8.4M</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Inventory Value</CardDescription>
                        <CardTitle className="text-2xl">$2.1M</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Active Suppliers</CardDescription>
                        <CardTitle className="text-2xl">158</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Avg Lead Time</CardDescription>
                        <CardTitle className="text-2xl">12 days</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        </StandardPage>
    );
}
