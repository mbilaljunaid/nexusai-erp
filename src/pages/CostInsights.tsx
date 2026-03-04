
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, Sparkles, BrainCircuit, Activity } from "lucide-react";
import { format } from "date-fns";

export default function CostInsights() {
    const { data: anomalies, isLoading: loadingAnomalies } = useQuery({
        queryKey: ["costAnomalies"],
        queryFn: async () => {
            const res = await fetch("/api/manufacturing/cost-anomalies");
            if (!res.ok) throw new Error("Failed to fetch anomalies");
            return res.json();
        }
    });

    const anomalyColumns = [
        {
            id: "severity",
            header: "Severity",
            width: "120px",
            cell: (row: any) => {
                const val = row.severity || "";
                return (
                    <div className="flex items-center h-full px-2">
                        <Badge variant={val === "HIGH" ? "destructive" : val === "MEDIUM" ? "default" : "secondary"}>
                            {val}
                        </Badge>
                    </div>
                );
            }
        },
        {
            id: "anomalyType",
            header: "Type",
            width: "250px",
            cell: (row: any) => (
                <div className="flex items-center gap-2 h-full px-2">
                    <AlertCircle className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-sm">{(row.anomalyType || "").replace("_", " ")}</span>
                </div>
            )
        },
        {
            id: "targetId",
            header: "Target",
            width: "150px",
            cell: (row: any) => <div className="flex items-center h-full px-2 font-mono text-xs text-muted-foreground">{String(row.targetId || "").substring(0, 8)}...</div>
        },
        {
            id: "description",
            header: "Description",
            width: "350px",
            cell: (row: any) => <div className="flex items-center h-full px-2 text-sm text-foreground">{row.description}</div>
        },
        {
            id: "createdAt",
            header: "Detected",
            width: "150px",
            cell: (row: any) => <div className="flex items-center h-full px-2 text-xs text-muted-foreground">{row.createdAt ? format(new Date(row.createdAt), "MMM dd, HH:mm") : ""}</div>
        }
    ];

    return (
        <StandardPage
            title="Cost Management AI"
            description="Proactive financial surveillance and predictive costing insights."
            actions={
                <div className="flex items-center justify-between">
                    <Badge variant="outline" className="px-3 py-1 bg-white">
                        <Sparkles className="h-3 w-3 mr-2 text-amber-500 fill-amber-500" />
                        AI Engine Active
                    </Badge>
                </div>
            }
        >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-none shadow-sm border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                        <CardDescription>High Severity Anomalies</CardDescription>
                        <CardTitle className="text-3xl flex items-center justify-between">
                            {anomalies?.filter((a: any) => a.severity === "HIGH").length || 0}
                            <Activity className="h-5 w-5 text-red-500" />
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-white border-none shadow-sm border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardDescription>Pending Investigations</CardDescription>
                        <CardTitle className="text-3xl">
                            {anomalies?.filter((a: any) => a.status === "PENDING").length || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-white border-none shadow-sm border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-2">
                        <CardDescription>Cost Precision Score</CardDescription>
                        <CardTitle className="text-3xl flex items-center justify-between">
                            94.2%
                            <TrendingUp className="h-5 w-5 text-indigo-500" />
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b">
                        <CardTitle>Surveillance Feed</CardTitle>
                        <CardDescription>Real-time anomaly detection across production and procurement.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loadingAnomalies ? (
                            <div className="p-8 space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : (
                            <div className="h-[500px]">
                                <InteractiveSpreadsheet
                                    data={anomalies || []}
                                    columns={anomalyColumns}
                                    onChange={() => { }}
                                    virtualized={true}
                                    containerHeight="500px"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
