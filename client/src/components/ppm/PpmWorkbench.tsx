
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, RefreshCw, Layers, DollarSign, TrendingUp, Briefcase } from "lucide-react";
import { ProjectHealthCard } from "./ProjectHealthCard";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function PpmWorkbench() {
    const [activeTab, setActiveTab] = useState("overview");
    const [projectId, setProjectId] = useState<string>("default-project-001"); // Future: Selector
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // 1. Fetch Performance Metrics
    const { data: performance, isLoading: isPerfLoading, refetch: refetchPerf } = useQuery({
        queryKey: ["/api/ppm/projects", projectId, "performance"],
        enabled: !!projectId
    });

    // 2. Fetch Expenditures (Basic list for now)
    const { data: expenditures, isLoading: isExpLoading, refetch: refetchCosts } = useQuery({
        queryKey: ["/api/ppm/expenditures", projectId],
        queryFn: async () => {
            const res = await fetch(`/api/ppm/expenditures?projectId=${projectId}`);
            return res.json();
        },
        enabled: !!projectId && activeTab === 'costs'
    });

    // Mutations
    const importMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("POST", "/api/ppm/costs/import", {});
        },
        onSuccess: (data) => {
            toast({ title: "Costs Imported", description: `Collected ${(data as any).summary?.total} new items.` });
            refetchCosts();
            refetchPerf();
        }
    });

    const distributeMutation = useMutation({
        mutationFn: async (id: string) => {
            // Hardcoded GL Accounts for MVP (Project Expense / Accrual)
            await apiRequest("POST", `/api/ppm/costs/${id}/distribute`, {
                drCcid: "PROJECT-EXP-001",
                crCcid: "PROJECT-ACCRUAL-001"
            });
        },
        onSuccess: () => {
            toast({ title: "Cost Distributed", description: "SLA Journals generated." });
            refetchCosts();
        }
    });

    const capitalizeMutation = useMutation({
        mutationFn: async (assetId: string) => {
            await apiRequest("POST", `/api/ppm/assets/${assetId}/capitalize`, {});
        },
        onSuccess: () => {
            toast({ title: "Asset Capitalized", description: "Lines pushed to Fixed Assets." });
        }
    });


    const columns: Column<any>[] = [
        { header: "Date", accessorKey: "date", cell: (item) => format(new Date(item.date), "MMM dd, yyyy") },
        { header: "Trans Type", accessorKey: "source", cell: (item) => <Badge variant="outline">{item.source}</Badge> },
        { header: "Exp Type", accessorKey: "expenditureType" },
        { header: "Amount", accessorKey: "rawCost", className: "text-right font-mono", cell: (item) => `$${Number(item.rawCost).toFixed(2)}` },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => {
                const colors: Record<string, string> = {
                    UNCOSTED: "bg-gray-100", COSTED: "bg-blue-100 text-blue-700", DISTRIBUTED: "bg-emerald-100 text-emerald-700"
                };
                return <Badge className={colors[item.status] || "bg-gray-100"}>{item.status}</Badge>
            }
        },
        {
            header: "Actions",
            accessorKey: "id",
            className: "text-right",
            cell: (item) => (
                <div className="flex justify-end gap-2">
                    {item.status === 'COSTED' && (
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => distributeMutation.mutate(item.id)}>
                            <DollarSign className="w-3 h-3 text-emerald-600" />
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Project Financials</h1>
                    <p className="text-lg text-slate-500 mt-2">Cost Performance, Asset Capitalization, and Budget Control</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => importMutation.mutate()} disabled={importMutation.isPending}>
                        {importMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Import Costs
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger value="overview" className="gap-2"><TrendingUp className="w-4 h-4" /> Overview</TabsTrigger>
                    <TabsTrigger value="costs" className="gap-2"><DollarSign className="w-4 h-4" /> Expenditures</TabsTrigger>
                    <TabsTrigger value="assets" className="gap-2"><Briefcase className="w-4 h-4" /> Assets & CIP</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    {isPerfLoading ? (
                        <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : performance ? (
                        <ProjectHealthCard metrics={performance.metrics} alerts={performance.alerts || []} />
                    ) : (
                        <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">Select a project to view performance.</div>
                    )}
                </TabsContent>

                <TabsContent value="costs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Expenditure Items</CardTitle>
                            <CardDescription>Review and process project costs from AP, Inventory, and Labor.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <StandardTable
                                columns={columns}
                                data={expenditures?.data || []}
                                isLoading={isExpLoading}
                                pageSize={10}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assets">
                    <div className="p-12 text-center border-2 border-dashed rounded-xl bg-slate-50">
                        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">CIP Asset Tracking</h3>
                        <p className="text-slate-500">Capitalization features coming in Chunk B.2</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
