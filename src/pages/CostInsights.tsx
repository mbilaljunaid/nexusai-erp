
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { StandardTable } from "@/components/ui/StandardTable";
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
            header: "Severity",
            accessorKey: "severity",
            cell: (info: any) => {
                const val = info.getValue();
                return (
                    <Badge variant={val === "HIGH" ? "destructive" : val === "MEDIUM" ? "default" : "secondary"}>
                        {val}
                    </Badge>
                );
            }
        },
        {
            header: "Type",
            accessorKey: "anomalyType",
            cell: (info: any) => (
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{info.getValue().replace("_", " ")}</span>
                </div>
            )
        },
        {
            header: "Target",
            accessorKey: "targetId",
            cell: (info: any) => <span className="font-mono text-xs">{info.getValue().substring(0, 8)}...</span>
        },
        {
            header: "Description",
            accessorKey: "description",
        },
        {
            header: "Detected",
            accessorKey: "createdAt",
            cell: (info: any) => format(new Date(info.getValue()), "MMM dd, HH:mm")
        }
    ];

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <BrainCircuit className="h-8 w-8 text-indigo-600" />
                        Cost Management AI
                    </h1>
                    <p className="text-muted-foreground">Proactive financial surveillance and predictive costing insights.</p>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-white">
                    <Sparkles className="h-3 w-3 mr-2 text-amber-500 fill-amber-500" />
                    AI Engine Active
                </Badge>
            </div>

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
                            <StandardTable
                                data={anomalies || []}
                                columns={anomalyColumns}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
