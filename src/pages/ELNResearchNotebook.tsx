import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileEdit, CheckCircle2, Signature, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function ELNResearchNotebook() {
    const { data: notebooks = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/pharma-eln"],
        queryFn: () => fetch("/api/pharma-eln").then(r => r.json()).catch(() => []),
    });

    const completedCount = notebooks.filter((n: any) => n.status === "completed").length;
    const draftCount = notebooks.filter((n: any) => n.status === "draft").length;
    const signaturePercent = notebooks.length > 0 ? (completedCount / notebooks.length) * 100 : 0;

    return (
        <StandardDashboard
            header={
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">ELN - Research Notebook</h1>
                    <p className="text-muted-foreground mt-1">Structured observations, electronic signatures, and 21 CFR Part 11 compliant audit trails</p>
                </div>
            }
        >
            <DashboardWidget title="Total Entries" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100/50">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{notebooks.length}</div>
                        <p className="text-xs text-muted-foreground">Experiment logs</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Draft" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-amber-100/50">
                        <FileEdit className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-amber-600">{draftCount}</div>
                        <p className="text-xs text-muted-foreground">Work in progress</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Completed" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-emerald-100/50">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-emerald-600">{completedCount}</div>
                        <p className="text-xs text-muted-foreground">Fully witnessed</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Signature %" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-indigo-100/50">
                        <Signature className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{signaturePercent.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">Compliance rate</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Research Entries" icon={Activity}>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : notebooks.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No entries found</p>
                    ) : (
                        notebooks.slice(0, 10).map((n: any) => (
                            <div key={n.id} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`entry-${n.id}`}>
                                <div className="flex-1">
                                    <p className="font-semibold">{n.studyId}</p>
                                    <p className="text-xs text-muted-foreground">Researcher: {n.researcher} • v{n.version || "1.0"}</p>
                                </div>
                                <Badge variant={n.status === "completed" ? "default" : "secondary"} className="text-xs font-mono uppercase">
                                    {n.status}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}

