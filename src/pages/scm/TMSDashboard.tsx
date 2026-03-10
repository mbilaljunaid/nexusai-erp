import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Truck, BarChart3, Users, DollarSign, CheckCircle,
    ChevronRight, Map, Package, CreditCard, TrendingUp, Settings
} from "lucide-react";

const kpis = [
    { label: "Active Shipments", value: "284", icon: Truck, color: "text-blue-500" },
    { label: "On-Time Delivery", value: "94.2%", icon: CheckCircle, color: "text-green-500" },
    { label: "Freight Cost/Unit", value: "$8.42", icon: DollarSign, color: "text-amber-500" },
    { label: "Carrier Utilization", value: "87%", icon: TrendingUp, color: "text-purple-500" },
];

const modules = [
    { title: "Route Planning", description: "Intelligent route optimization workbench", href: "/transportation/planning", icon: Map },
    { title: "Carrier Management", description: "Approve and rate-negotiate carriers", href: "/transportation/carriers", icon: Users },
    { title: "Freight Settlement", description: "Carrier invoice matching and settlement", href: "/transportation/freight", icon: CreditCard },
    { title: "Freight Accounting", description: "Freight cost allocation workbench", href: "/transportation/freight-accounting", icon: DollarSign },
    { title: "Carrier Scorecard", description: "Carrier KPI tracking and ratings", href: "/transportation/carrier-scorecard", icon: BarChart3 },
    { title: "Carrier Rates", description: "Rate tables and tariff management", href: "/transportation/carrier-rates", icon: Package },
    { title: "Shipment Tracking", description: "Real-time shipment visibility", href: "/transportation/tracking", icon: Truck },
    { title: "TMS Analytics", description: "Transportation business intelligence", href: "/tms/analytics", icon: TrendingUp },
    { title: "Logistics Dashboard", description: "Logistics operations overview", href: "/logistics", icon: Settings },
];

export default function TMSDashboard() {
    return (
        <StandardPage
            title="Transportation Management"
            description="Multi-carrier transportation operations, route planning, freight settlement and logistics analytics"
        >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
                {kpis.map((kpi) => (
                    <Card key={kpi.label}>
                        <CardContent className="flex items-center gap-3 p-4">
                            <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
                            <div>
                                <p className="text-2xl font-bold">{kpi.value}</p>
                                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map((mod) => (
                    <Link key={mod.href} to={mod.href}>
                        <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{mod.title}</CardTitle>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <mod.icon className="h-6 w-6 text-muted-foreground mb-2" />
                                <p className="text-xs text-muted-foreground">{mod.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </StandardPage>
    );
}
