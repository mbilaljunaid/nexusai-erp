import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ShieldCheck, FileText, AlertTriangle, ClipboardList,
    ChevronRight, BarChart3, Lock, Search
} from "lucide-react";

const kpis = [
    { label: "Controls Tested", value: "312", icon: ShieldCheck, color: "text-green-500" },
    { label: "Open Issues", value: "14", icon: AlertTriangle, color: "text-amber-500" },
    { label: "SOX Controls", value: "86", icon: Lock, color: "text-blue-500" },
    { label: "Audit Findings", value: "4", icon: ClipboardList, color: "text-red-500" },
];

const modules = [
    { title: "Control Framework", description: "Internal controls register and COSO mapping", href: "/compliance/controls", icon: ShieldCheck },
    { title: "SOX Compliance", description: "Sarbanes-Oxley control testing workbench", href: "/compliance/sox", icon: Lock },
    { title: "Security Profiles", description: "User roles and data access security", href: "/compliance/security", icon: Lock },
    { title: "Audit Trails", description: "System-wide audit log viewer", href: "/compliance/audit", icon: Search },
    { title: "Risk Register", description: "Enterprise risk assessments and mitigations", href: "/compliance/dashboard", icon: AlertTriangle },
    { title: "Compliance Reports", description: "Regulatory reporting and analytics", href: "/analytics", icon: BarChart3 },
];

export default function ComplianceDashboard() {
    return (
        <StandardPage
            title="Compliance & Risk"
            description="Internal controls, SOX testing, security profiles and regulatory compliance management"
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
