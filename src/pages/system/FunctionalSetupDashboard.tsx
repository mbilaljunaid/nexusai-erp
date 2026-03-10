import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Settings, Building2, Users, Globe, ShieldCheck,
    ChevronRight, Database, Workflow, ToggleLeft, BarChart3
} from "lucide-react";

const kpis = [
    { label: "Features Enabled", value: "148", icon: ToggleLeft, color: "text-green-500" },
    { label: "Business Units", value: "34", icon: Building2, color: "text-blue-500" },
    { label: "Active Users", value: "1,240", icon: Users, color: "text-purple-500" },
    { label: "Security Profiles", value: "22", icon: ShieldCheck, color: "text-amber-500" },
];

const modules = [
    { title: "Manage Offerings", description: "Enable/disable application features", href: "/system-configuration", icon: ToggleLeft },
    { title: "Business Units", description: "Define and manage business units", href: "/company-setup/business-units", icon: Building2 },
    { title: "Legal Entities", description: "Company legal entity registry", href: "/company-setup/legal-groups", icon: Globe },
    { title: "Security Profiles", description: "User roles and data access", href: "/compliance/security", icon: ShieldCheck },
    { title: "Ledger Setup", description: "Configure accounting ledgers", href: "/finance/gl/config/ledgers", icon: Database },
    { title: "Workforce Structures", description: "HR org hierarchy configuration", href: "/hr/setup/workforce-structures", icon: Users },
    { title: "Workflow Config", description: "Approval and notification workflows", href: "/system-configuration", icon: Workflow },
    { title: "System Analytics", description: "Usage reports and audit trails", href: "/compliance/audit", icon: BarChart3 },
    { title: "Document Records", description: "System document templates", href: "/hr/setup/document-records", icon: Settings },
];

export default function FunctionalSetupDashboard() {
    return (
        <StandardPage
            title="Functional Setup Manager"
            description="Configure applications, features, security and organizational hierarchies across all modules"
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
                    <Link key={`${mod.title}-${mod.href}`} to={mod.href}>
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
