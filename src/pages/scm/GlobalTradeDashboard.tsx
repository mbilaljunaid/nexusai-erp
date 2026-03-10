import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Globe, Ship, FileText, AlertTriangle, CheckCircle,
    ChevronRight, BarChart3, Truck, Scale, ClipboardList
} from "lucide-react";

const kpis = [
    { label: "Open Shipments", value: "284", icon: Ship, color: "text-blue-500" },
    { label: "Trade Compliance Score", value: "97%", icon: CheckCircle, color: "text-green-500" },
    { label: "Customs Holds", value: "3", icon: AlertTriangle, color: "text-amber-500" },
    { label: "Countries of Trade", value: "42", icon: Globe, color: "text-purple-500" },
];

const modules = [
    { title: "LCM Operations", description: "Landed cost management workbench", href: "/scm/lcm/operations", icon: Truck },
    { title: "Cost Components", description: "Define LCM cost elements", href: "/scm/lcm/components", icon: Scale },
    { title: "Trade Operations", description: "Import/export trade transactions", href: "/scm/lcm/operations", icon: Ship },
    { title: "Logistics Dashboard", description: "Shipment and freight tracking", href: "/logistics", icon: Globe },
    { title: "Transportation Planning", description: "Route planning workbench", href: "/transportation/planning", icon: Truck },
    { title: "Carrier Management", description: "Manage approved carriers", href: "/transportation/carriers", icon: ClipboardList },
    { title: "Freight Settlement", description: "Carrier invoice and settlement", href: "/transportation/freight", icon: FileText },
    { title: "Trade Analytics", description: "Global trade performance reports", href: "/analytics", icon: BarChart3 },
];

export default function GlobalTradeDashboard() {
    return (
        <StandardPage
            title="Global Trade Management"
            description="International trade compliance, landed cost management, and logistics operations"
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {modules.map((mod) => (
                    <Link key={`${mod.href}-${mod.title}`} to={mod.href}>
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
