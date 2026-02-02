import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Briefcase, GraduationCap, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function AlumniEngagement() {
    const { data: alumni = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/ed-alumni"],
        queryFn: () => fetch("/api/ed-alumni").then(r => r.json()).catch(() => []),
    });

    const engagedCount = alumni.filter((a: any) => a.engagementStatus === "active").length;
    const employedCount = alumni.filter((a: any) => a.employmentStatus === "employed").length;
    const employmentPercent = alumni.length > 0 ? (employedCount / alumni.length) * 100 : 0;

    return (
        <StandardDashboard
            header={
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">CRM, Alumni & Student Engagement</h1>
                    <p className="text-muted-foreground mt-1">Alumni campaigns, feedback, surveys, scholarships, and career placement tracking</p>
                </div>
            }
        >
            <DashboardWidget title="Alumni" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100/50">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{alumni.length}</div>
                        <p className="text-xs text-muted-foreground">Total records</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Engaged" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-emerald-100/50">
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600">{engagedCount}</div>
                        <p className="text-xs text-muted-foreground">Active participants</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Employed" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-indigo-100/50">
                        <Briefcase className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-indigo-600">{employedCount}</div>
                        <p className="text-xs text-muted-foreground">Career verified</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Employment %" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-slate-100/50">
                        <Activity className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{employmentPercent.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">Placement rate</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Alumni Directory" icon={Users}>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : alumni.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No alumni records found</p>
                    ) : (
                        alumni.slice(0, 10).map((a: any) => (
                            <div key={a.id} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`alumni-${a.id}`}>
                                <div className="flex-1">
                                    <p className="font-semibold">{a.alumniId}</p>
                                    <p className="text-xs text-muted-foreground">Employment: {a.employmentStatus} • Class of {a.gradYear || "2023"}</p>
                                </div>
                                <Badge variant={a.engagementStatus === "active" ? "default" : "secondary"} className="text-xs font-mono uppercase">
                                    {a.engagementStatus}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}

