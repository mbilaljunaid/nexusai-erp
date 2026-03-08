import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DollarSign, Heart, Users, Award,
    ChevronRight, BarChart3, Settings, FileText, CreditCard
} from "lucide-react";

const kpis = [
    { label: "Avg Total Compensation", value: "$92,400", icon: DollarSign, color: "text-green-500" },
    { label: "Benefits Enrolled", value: "96%", icon: Heart, color: "text-red-500" },
    { label: "Pay Equity Score", value: "94/100", icon: Award, color: "text-purple-500" },
    { label: "Open Enrolment Active", value: "Yes", icon: Users, color: "text-blue-500" },
];

const modules = [
    { title: "Compensation", description: "Salary bands and merit cycles", href: "/hr/rewards/compensation", icon: DollarSign },
    { title: "Payslips", description: "View and download payslips", href: "/hr/rewards/payslips", icon: FileText },
    { title: "Benefits Enrollment", description: "Manage benefit elections", href: "/hr/self-service/benefits", icon: Heart },
    { title: "Benefits Programs", description: "Configure benefit plans", href: "/hr/setup/benefits-programs", icon: Settings },
    { title: "Voluntary Deductions", description: "Employee-initiated deductions", href: "/hr/self-service/deductions", icon: CreditCard },
    { title: "Life Events", description: "Process qualifying life events", href: "/hr/self-service/life-events", icon: Users },
    { title: "Comp Analytics", description: "Pay equity and compensation trends", href: "/hr/analytics", icon: BarChart3 },
];

export default function CompBenDashboard() {
    return (
        <StandardPage
            title="Compensation & Benefits"
            description="Total rewards management — salary, benefits, and pay equity"
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
