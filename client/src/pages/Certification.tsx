import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle, Clock, Percent, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Certification() {
    const { data: certs = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/ed-certificates"],
        queryFn: () => fetch("/api/ed-certificates").then(r => r.json()).catch(() => []),
    });

    const issuedCount = certs.filter((c: any) => c.status === "issued").length;
    const pendingCount = certs.filter((c: any) => c.status === "pending").length;
    const issuePercent = certs.length > 0 ? (issuedCount / certs.length) * 100 : 0;

    return (
        <StandardDashboard
            header={
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">Certificate & Credential Issuance</h1>
                    <p className="text-muted-foreground mt-1">Digital badges, PDF certificates, credential verification, and issuance tracking</p>
                </div>
            }
        >
            <DashboardWidget title="Certificates" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100/50">
                        <Award className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{certs.length}</div>
                        <p className="text-xs text-muted-foreground">Master registry</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Issued" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-emerald-100/50">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600">{issuedCount}</div>
                        <p className="text-xs text-muted-foreground">Digitally signed</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Pending" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-amber-100/50">
                        <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-amber-600">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Issue %" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-slate-100/50">
                        <Percent className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{issuePercent.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">Completion rate</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Certificates" icon={Activity}>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : certs.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No certificates found</p>
                    ) : (
                        certs.slice(0, 10).map((c: any) => (
                            <div key={c.id} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`cert-${c.id}`}>
                                <div className="flex-1">
                                    <p className="font-semibold">{c.certificateId}</p>
                                    <p className="text-xs text-muted-foreground">Course: {c.courseId} • Issued: {c.issuedDate || "Pending"}</p>
                                </div>
                                <Badge variant={c.status === "issued" ? "default" : "secondary"} className="text-xs font-mono uppercase">
                                    {c.status}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}

