import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Building, FileText, Heart, Users,
    ChevronRight, Briefcase, MapPin, Calendar
} from "lucide-react";

const kpis = [
    { label: "Legal Entities", value: "12", icon: Building, color: "text-blue-500" },
    { label: "Business Units", value: "34", icon: Briefcase, color: "text-purple-500" },
    { label: "Departments", value: "148", icon: Users, color: "text-green-500" },
    { label: "Locations", value: "27", icon: MapPin, color: "text-amber-500" },
];

const modules = [
    { title: "Workforce Structures", description: "Legal entities, BUs, departments, grades", href: "/hr/setup/workforce-structures", icon: Building },
    { title: "Document Records", description: "Employee document management", href: "/hr/setup/document-records", icon: FileText },
    { title: "Benefits Programs", description: "Configure benefit plan structures", href: "/hr/setup/benefits-programs", icon: Heart },
    { title: "Grade Structures", description: "Job grades and salary ranges", href: "/hr/setup/workforce-structures", icon: Briefcase },
    { title: "Work Locations", description: "Office and remote location registry", href: "/hr/setup/workforce-structures", icon: MapPin },
    { title: "HR Calendars", description: "Work schedules and holiday calendars", href: "/hr/wfm/admin/holidays", icon: Calendar },
];

export default function WorkforceStructureDashboard() {
    return (
        <StandardPage
            title="Workforce Configuration"
            description="Setup and manage organizational structures, grades, locations and HR configuration"
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
