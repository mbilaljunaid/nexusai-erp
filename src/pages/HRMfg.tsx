import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Award, TrendingUp, Activity, Briefcase } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function HRMfg() {
    const { data: employees = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/mfg-hr"],
        queryFn: () => fetch("/api/mfg-hr").then(r => r.json()).catch(() => []),
    });

    const active = employees.filter((e: any) => e.status === "active").length;
    const skilled = employees.filter((e: any) => e.skilled).length;
    const skillPercent = employees.length > 0 ? (skilled / employees.length) * 100 : 0;

    return (
        <StandardDashboard
            header={
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">HR & Workforce Management</h1>
                    <p className="text-muted-foreground mt-1">Employee lifecycle, skill matrices, scheduling, and shop floor labor allocation</p>
                </div>
            }
        >
            <DashboardWidget title="Total Workforce" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100/50">
                        <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{employees.length}</div>
                        <p className="text-xs text-muted-foreground">Master headcount</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Active Duty" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-emerald-100/50">
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600">{active}</div>
                        <p className="text-xs text-muted-foreground">Clocked in today</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Skilled Labor" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-indigo-100/50">
                        <Award className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-indigo-600">{skilled}</div>
                        <p className="text-xs text-muted-foreground">Certified operators</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Skill Index" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-amber-100/50">
                        <TrendingUp className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-amber-600">{skillPercent.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">Workforce readiness</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Workforce Management Directory" icon={Briefcase}>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : employees.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8 font-medium">No employee records found</p>
                    ) : (
                        employees.slice(0, 10).map((e: any) => (
                            <div key={e.id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`emp-${e.id}`}>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                        {e.employeeId?.substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{e.employeeId}</p>
                                        <p className="text-xs text-muted-foreground uppercase tracking-tight font-mono">{e.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={e.status === "active" ? "default" : "secondary"} className="text-[10px] uppercase font-mono">
                                        {e.status}
                                    </Badge>
                                    <Badge variant={e.skilled ? "default" : "outline"} className={`text-[10px] uppercase font-mono ${e.skilled ? "bg-blue-100 text-blue-700 border-transparent" : ""}`}>
                                        {e.skilled ? "Skilled" : "Trainee"}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}

