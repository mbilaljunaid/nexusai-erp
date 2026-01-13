import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { FileText, ClipboardList, Timer, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function eBatchRecord() {
    const { data: batches = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/pharma-ebr"],
        queryFn: () => fetch("/api/pharma-ebr").then(r => r.json()).catch(() => []),
    });

    const completedCount = batches.filter((b: any) => b.status === "completed").length;
    const inExecution = batches.filter((b: any) => b.status === "in-progress").length;
    const onHold = batches.filter((b: any) => b.status === "on-hold").length;

    return (
        <StandardDashboard
            header={
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-heading">Electronic Batch Record (eBR)</h1>
                    <p className="text-muted-foreground mt-1">S88 workflow, step-wise instructions, digital signatures, and MES integration for GMP compliance</p>
                </div>
            }
        >
            <DashboardWidget title="Total Batches" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-100/50">
                        <ClipboardList className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight">{batches.length}</div>
                        <p className="text-xs text-muted-foreground">Production runs</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="In Progress" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-indigo-100/50">
                        <Timer className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-indigo-600">{inExecution}</div>
                        <p className="text-xs text-muted-foreground">Active execution</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget title="On Hold" colSpan={1}>
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-amber-100/50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-amber-600">{onHold}</div>
                        <p className="text-xs text-muted-foreground">QC/Process holds</p>
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
                        <p className="text-xs text-muted-foreground">Archived records</p>
                    </div>
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={4} title="Batch Records" icon={Activity}>
                <div className="space-y-3">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                    ) : batches.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No batch records found</p>
                    ) : (
                        batches.slice(0, 10).map((b: any) => (
                            <div key={b.id} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex items-center justify-between" data-testid={`batch-${b.id}`}>
                                <div className="flex-1">
                                    <p className="font-semibold">{b.batchId}</p>
                                    <p className="text-xs text-muted-foreground">Recipe v{b.recipeVersion} • Qty: {b.quantity} • {b.batchId.split('-')[0]}</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Badge variant={b.status === "completed" ? "default" : b.status === "on-hold" ? "destructive" : "secondary"} className="text-xs font-mono uppercase">
                                        {b.status}
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

