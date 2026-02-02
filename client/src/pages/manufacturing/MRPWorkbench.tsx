import React, { useState } from 'react';
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, Boxes, Package, AlertTriangle, Calendar, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MrpRecommendation {
    id: string;
    productId: string;
    recommendationType: "PLANNED_WO" | "PLANNED_PO" | "EXPEDITE" | "CANCEL";
    suggestedQuantity: string;
    suggestedDate: string;
    status: string;
}

interface MrpPlan {
    id: string;
    planName: string;
    status: string;
    planDate: string;
}

export default function MRPWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);

    // Form State for New Plan
    const [planName, setPlanName] = useState("");
    const [horizonStart, setHorizonStart] = useState("");
    const [horizonEnd, setHorizonEnd] = useState("");

    const { data: plans = [] } = useQuery<MrpPlan[]>({
        queryKey: ["/api/manufacturing/planning/mrp-plans"],
    });

    const { data: recData, isLoading: recsLoading } = useQuery<{ items: MrpRecommendation[], total: number }>({
        queryKey: ["/api/manufacturing/planning/mrp-plans", selectedPlanId, "recommendations", page, pageSize],
        enabled: !!selectedPlanId,
        queryFn: async () => {
            const offset = (page - 1) * pageSize;
            const res = await fetch(`/api/manufacturing/planning/mrp-plans/${selectedPlanId}/recommendations?limit=${pageSize}&offset=${offset}`);
            return res.json();
        }
    });

    const recommendations = recData?.items || [];
    const totalRecs = recData?.total || 0;

    const runMrpMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/manufacturing/planning/mrp-plans/${id}/run`, { method: "POST" });
            if (!res.ok) throw new Error("MRP Run failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/planning/mrp-plans"] });
            toast({ title: "MRP Run Complete", description: "Recommendations have been generated." });
        }
    });

    const createPlanMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/manufacturing/planning/mrp-plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/planning/mrp-plans"] });
            setIsNewPlanOpen(false);
            setSelectedPlanId(data.id);
            toast({ title: "Plan Created", description: "Ready to run MRP engine." });
            // Reset form
            setPlanName("");
            setHorizonStart("");
            setHorizonEnd("");
        }
    });

    const columns: Column<MrpRecommendation>[] = [
        {
            header: "Product",
            accessorKey: "productId",
            cell: (row: MrpRecommendation) => <span className="font-semibold">{row.productId}</span>
        },
        {
            header: "Action Recommended",
            accessorKey: "recommendationType",
            cell: (row: MrpRecommendation) => (
                <Badge variant={row.recommendationType.startsWith('PLANNED') ? 'default' : 'outline'}>
                    {row.recommendationType.replace('_', ' ')}
                </Badge>
            )
        },
        {
            header: "Quantity",
            accessorKey: "suggestedQuantity",
            cell: (row: MrpRecommendation) => <span className="font-mono">{parseFloat(row.suggestedQuantity).toLocaleString()}</span>
        },
        {
            header: "Requested Date",
            accessorKey: "suggestedDate",
            cell: (row: MrpRecommendation) => new Date(row.suggestedDate).toLocaleDateString()
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: MrpRecommendation) => <Badge variant="secondary">{row.status}</Badge>
        }
    ];

    const handleCreatePlan = () => {
        createPlanMutation.mutate({
            planName,
            horizonStartDate: horizonStart,
            horizonEndDate: horizonEnd,
            status: "draft"
        });
    };

    return (
        <StandardPage
            title="MRP Planning Workbench"
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Planning" }, { label: "MRP" }]}
            actions={
                <div className="flex gap-2">
                    <Sheet open={isNewPlanOpen} onOpenChange={setIsNewPlanOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> New Plan</Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader><SheetTitle>Initiate Planning Horizon</SheetTitle></SheetHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Plan Name</Label>
                                    <Input value={planName} onChange={e => setPlanName(e.target.value)} placeholder="e.g. Q4 Master Plan" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Horizon Start</Label>
                                        <Input type="date" value={horizonStart} onChange={e => setHorizonStart(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Horizon End</Label>
                                        <Input type="date" value={horizonEnd} onChange={e => setHorizonEnd(e.target.value)} />
                                    </div>
                                </div>
                                <Button className="w-full" onClick={handleCreatePlan} disabled={createPlanMutation.isPending}>
                                    Create Planning Scope
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                    {selectedPlanId && (
                        <Button onClick={() => runMrpMutation.mutate(selectedPlanId)} disabled={runMrpMutation.isPending}>
                            <Play className="h-4 w-4 mr-2" /> {runMrpMutation.isPending ? "Running Engine..." : "Run MRP Engine"}
                        </Button>
                    )}
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Planning History</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y cursor-pointer">
                            {plans.map(plan => (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className={`p-4 hover:bg-muted/50 transition-colors ${selectedPlanId === plan.id ? 'bg-primary/5 border-r-4 border-primary' : ''}`}
                                >
                                    <div className="font-semibold">{plan.planName}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-muted-foreground">{new Date(plan.planDate).toLocaleDateString()}</span>
                                        <Badge variant="outline" className="text-[10px] h-4 px-1">{plan.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>MRP Recommendations</CardTitle>
                        {selectedPlanId && <div className="text-sm text-muted-foreground">Current Scope: {plans.find(p => p.id === selectedPlanId)?.planName}</div>}
                    </CardHeader>
                    <CardContent>
                        {selectedPlanId ? (
                            <StandardTable
                                data={recommendations}
                                columns={columns}
                                isLoading={recsLoading}
                                keyExtractor={(item) => item.id}
                                page={page}
                                pageSize={pageSize}
                                totalItems={totalRecs}
                                onPageChange={setPage}
                                filterColumn="productId"
                                filterPlaceholder="Filter by product..."
                            />
                        ) : (
                            <div className="py-20 text-center text-muted-foreground">
                                <AlertTriangle className="mx-auto h-12 w-12 opacity-20 mb-4" />
                                <p>Select or create a planning horizon to view recommendations.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}

