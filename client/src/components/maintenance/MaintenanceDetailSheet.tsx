
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Clock, PlayCircle, Plus, AlertTriangle, ShoppingBag, HeartPulse } from "lucide-react";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CostAnalysisSection } from "./CostAnalysisSection";
import { PermitsSection, InspectionsSection } from "./QualityComponents";



import { useToast } from "@/hooks/use-toast";

interface Props {
    workOrderId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function MaintenanceDetailSheet({ workOrderId, open, onOpenChange }: Props) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [newOp, setNewOp] = useState({ sequence: 10, description: "" });

    const { data: wo, isLoading } = useQuery({
        queryKey: ["/api/maintenance/work-orders", workOrderId],
        queryFn: () => fetch(`/api/maintenance/work-orders/${workOrderId}`).then(r => r.json()),
        enabled: !!workOrderId
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status: string) => fetch(`/api/maintenance/work-orders/${workOrderId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        }).then(async r => {
            if (!r.ok) throw new Error((await r.json()).error);
            return r.json();
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders"] });
            toast({ title: "Status Updated" });
        },
        onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
    });

    const addOpMutation = useMutation({
        mutationFn: (data: any) => fetch(`/api/maintenance/work-orders/${workOrderId}/operations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders", workOrderId] });
            setNewOp({ sequence: newOp.sequence + 10, description: "" });
            toast({ title: "Operation Added" });
        }
    });

    const completeOpMutation = useMutation({
        mutationFn: (opId: string) => fetch(`/api/maintenance/operations/${opId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "COMPLETED" })
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders", workOrderId] });
            toast({ title: "Operation Completed" });
        }
    });

    const { data: health } = useQuery({
        queryKey: ["/api/maintenance/assets", wo?.assetId, "health"],
        queryFn: () => fetch(`/api/maintenance/assets/${wo.assetId}/health`).then(r => r.json()),
        enabled: !!wo?.assetId
    });

    if (!workOrderId) return null;


    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[800px] sm:w-[540px]">
                <SheetHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <SheetTitle>{wo?.workOrderNumber}</SheetTitle>
                            <SheetDescription>{wo ? wo.description : "Loading..."}</SheetDescription>
                        </div>
                        {wo && (
                            <Badge variant={wo.status === "COMPLETED" ? "default" : wo.status === "IN_PROGRESS" ? "secondary" : "outline"}>
                                {wo.status}
                            </Badge>
                        )}
                    </div>
                </SheetHeader>

                {isLoading ? (
                    <div className="py-10 text-center">Loading...</div>
                ) : (
                    <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                        <div className="space-y-6">
                            {/* Actions */}
                            <div className="flex gap-2">
                                {wo.status === "DRAFT" && (
                                    <Button size="sm" onClick={() => updateStatusMutation.mutate("RELEASED")}>Release WO</Button>
                                )}
                                {wo.status === "RELEASED" && (
                                    <Button size="sm" onClick={() => updateStatusMutation.mutate("IN_PROGRESS")}>Start Work</Button>
                                )}
                                {wo.status === "IN_PROGRESS" && (
                                    <Button size="sm" onClick={() => updateStatusMutation.mutate("COMPLETED")} className="bg-green-600 hover:bg-green-700">Complete WO</Button>
                                )}

                            </div>

                            {/* Asset Info */}
                            <Card>
                                <CardHeader className="py-3"><CardTitle className="text-sm">Asset Information</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <div className="flex items-center gap-2">
                                            <HeartPulse className={`h-4 w-4 ${health?.healthScore < 50 ? 'text-red-500' : health?.healthScore < 80 ? 'text-yellow-500' : 'text-green-500'}`} />
                                            <span className="font-bold">Health Score:</span>
                                        </div>
                                        <Badge variant="outline" className={health?.healthScore < 50 ? 'bg-red-50 text-red-700' : health?.healthScore < 80 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}>
                                            {health?.healthScore}% - {health?.status}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between mt-2"><span className="text-muted-foreground text-xs">MTBF:</span> <span className="text-xs font-medium">{health?.mtbfHours || 'N/A'} hrs</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground text-xs">MTTR:</span> <span className="text-xs font-medium">{health?.mttrHours || 'N/A'} hrs</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Asset Number:</span> <span>{wo.asset?.assetNumber}</span></div>

                                    <div className="flex justify-between"><span className="text-muted-foreground">Description:</span> <span>{wo.asset?.description}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Category:</span> <span>{wo.asset?.categoryId}</span></div>
                                </CardContent>
                            </Card>

                            {/* Operations */}
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Operations</h3>
                                <div className="space-y-2">
                                    {wo.operations?.map((op: any) => (
                                        <div key={op.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">{op.sequence}</Badge>
                                                <div className="text-sm">
                                                    <p>{op.description}</p>
                                                    <p className="text-xs text-muted-foreground">{op.status}</p>
                                                </div>
                                            </div>
                                            {op.status !== "COMPLETED" && (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => completeOpMutation.mutate(op.id)}>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {op.status === "COMPLETED" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                        </div>
                                    ))}

                                    {/* Add Operation */}
                                    {(wo.status === "DRAFT" || wo.status === "RELEASED" || wo.status === "IN_PROGRESS") && (
                                        <div className="flex gap-2 items-center p-2 border border-dashed rounded-md">
                                            <Input
                                                className="w-16 h-8 text-xs"
                                                type="number"
                                                value={newOp.sequence}
                                                onChange={e => setNewOp({ ...newOp, sequence: parseInt(e.target.value) })}
                                            />
                                            <Input
                                                className="h-8 text-xs flex-1"
                                                placeholder="New operation step..."
                                                value={newOp.description}
                                                onChange={e => setNewOp({ ...newOp, description: e.target.value })}
                                            />
                                            <Button size="sm" variant="secondary" onClick={() => addOpMutation.mutate(newOp)} disabled={!newOp.description}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Materials */}
                        <MaterialsSection
                            workOrderId={wo.id}
                            materials={wo.materials || []}
                            status={wo.status}
                            onUpdate={() => queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders", workOrderId] })}
                        />

                        {/* Resources */}
                        <ResourcesSection
                            workOrderId={wo.id}
                            resources={wo.resources || []}
                            status={wo.status}
                            onUpdate={() => queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders", workOrderId] })}
                        />
                        <ResourcesSection
                            workOrderId={wo.id}
                            resources={wo.resources || []}
                            status={wo.status}
                            onUpdate={() => queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders", workOrderId] })}
                        />

                        <Separator className="my-4" />

                        {/* Costs */}
                        <CostAnalysisSection workOrderId={wo.id} />

                        <Separator className="my-4" />

                        {/* Quality & Safety */}
                        <ReliabilityAnalysisSection workOrder={wo} onUpdate={() => queryClient.invalidateQueries({ queryKey: ["/api/maintenance/work-orders", workOrderId] })} />

                        <Separator className="my-4" />
                        <PermitsSection workOrderId={wo.id} />
                        <InspectionsSection workOrderId={wo.id} />


                    </ScrollArea>


                )}
            </SheetContent>
        </Sheet>
    );
}



function MaterialsSection({ workOrderId, materials, status, onUpdate }: { workOrderId: string, materials: any[], status: string, onUpdate: () => void }) {
    const { toast } = useToast();
    const [newMat, setNewMat] = useState({ inventoryId: "", plannedQuantity: 1 });
    // In real app, fetch inventory list. Stubbing for UI:
    const { data: inventoryItems } = useQuery({
        queryKey: ["/api/maintenance/inventory-stub"], // Replace with real endpoint if available or mock
        queryFn: async () => [
            { id: "inv-1", itemName: "Bearing 6205", quantity: 10 },
            { id: "inv-2", itemName: "Hydraulic Oil (L)", quantity: 50 },
            { id: "inv-3", itemName: "M6 Bolt", quantity: 100 }
        ]
    });

    const addMatMutation = useMutation({
        mutationFn: (data: any) => fetch(`/api/maintenance/work-orders/${workOrderId}/materials`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => { toast({ title: "Material Added" }); onUpdate(); setNewMat({ inventoryId: "", plannedQuantity: 1 }); }
    });

    const issueMatMutation = useMutation({
        mutationFn: (matId: string) => fetch(`/api/maintenance/materials/${matId}/issue`, {
            method: "POST"
        }).then(async r => { if (!r.ok) throw new Error((await r.json()).error); return r.json() }),
        onSuccess: () => { toast({ title: "Material Issued" }); onUpdate(); },
        onError: (e: any) => toast({ title: "Issue Failed", description: e.message, variant: "destructive" })
    });

    const raisePRMutation = useMutation({
        mutationFn: (matId: string) => fetch(`/api/maintenance/materials/${matId}/raise-pr`, {
            method: "POST"
        }).then(async r => { if (!r.ok) throw new Error((await r.json()).error); return r.json() }),
        onSuccess: () => { toast({ title: "Purchase Requisition Raised" }); onUpdate(); },
        onError: (e: any) => toast({ title: "PR Failed", description: e.message, variant: "destructive" })
    });

    return (
        <div>
            <h3 className="text-sm font-semibold mb-2">Spare Parts & Materials</h3>
            <div className="space-y-2">
                {materials.map((mat: any) => (
                    <div key={mat.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                        <div className="flex-1">
                            <p className="text-sm font-medium">Item: {mat.inventoryId.substring(0, 8)}... (Ref)</p>
                            <div className="text-xs text-muted-foreground flex gap-3">
                                <span>Planned: {mat.plannedQuantity}</span>
                                <span className={mat.actualQuantity >= mat.plannedQuantity ? "text-green-600 font-bold" : ""}>
                                    Actual: {mat.actualQuantity}
                                </span>
                                {mat.purchaseRequisitionLineId && (
                                    <Badge variant="outline" className="text-[9px] h-4 bg-blue-50">PR Linked</Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {status === "IN_PROGRESS" && mat.actualQuantity < mat.plannedQuantity && !mat.purchaseRequisitionLineId && (
                                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => raisePRMutation.mutate(mat.id)}>
                                    <ShoppingBag className="h-3 w-3" />
                                    Procure
                                </Button>
                            )}
                            {status === "IN_PROGRESS" && mat.actualQuantity < mat.plannedQuantity && (
                                <Button size="sm" variant="outline" className="h-8" onClick={() => issueMatMutation.mutate(mat.id)}>
                                    Issue
                                </Button>
                            )}
                        </div>
                    </div>
                ))}


                {/* Add Material Form */}
                {(status === "DRAFT" || status === "RELEASED" || status === "IN_PROGRESS") && (
                    <div className="flex gap-2 items-center p-2 border border-dashed rounded-md mt-2">
                        {/* Simple Input for Inv ID for now, normally Select */}
                        <Input
                            className="h-8 text-xs flex-1"
                            placeholder="Inventory ID"
                            value={newMat.inventoryId}
                            onChange={(e) => setNewMat({ ...newMat, inventoryId: e.target.value })}
                        />
                        <Input
                            className="w-16 h-8 text-xs"
                            type="number"
                            value={newMat.plannedQuantity}
                            onChange={(e) => setNewMat({ ...newMat, plannedQuantity: parseInt(e.target.value) })}
                        />
                        <Button size="sm" variant="secondary" onClick={() => addMatMutation.mutate(newMat)} disabled={!newMat.inventoryId}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

function ResourcesSection({ workOrderId, resources, status, onUpdate }: { workOrderId: string, resources: any[], status: string, onUpdate: () => void }) {
    const { toast } = useToast();
    const [newRes, setNewRes] = useState({ userId: "", plannedHours: 8 });
    const [logging, setLogging] = useState<{ id: string, hours: number } | null>(null);

    // In real app, fetch technicians list
    const { data: technicians } = useQuery({
        queryKey: ["/api/maintenance/technicians-stub"],
        queryFn: () => fetch("/api/maintenance/technicians-stub").then(r => r.json())
    });

    const assignMutation = useMutation({
        mutationFn: (data: any) => fetch(`/api/maintenance/work-orders/${workOrderId}/resources`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => { toast({ title: "Technician Assigned" }); onUpdate(); setNewRes({ userId: "", plannedHours: 8 }); }
    });

    const logHoursMutation = useMutation({
        mutationFn: ({ id, hours }: any) => fetch(`/api/maintenance/resources/${id}/log-hours`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hours })
        }).then(r => r.json()),
        onSuccess: () => { toast({ title: "Hours Logged" }); onUpdate(); setLogging(null); }
    });

    return (
        <div>
            <h3 className="text-sm font-semibold mb-2">Technicians & Labor</h3>
            <div className="space-y-2">
                {resources.map((res: any) => (
                    <div key={res.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                        <div>
                            <p className="text-sm font-medium">{res.technician?.name || res.technician?.email || 'Unknown Tech'}</p>
                            <div className="text-xs text-muted-foreground flex gap-3">
                                <span>Planned: {res.plannedHours}h</span>
                                <span className={Number(res.actualHours) > 0 ? "text-blue-600 font-bold" : ""}>
                                    Actual: {res.actualHours}h
                                </span>
                            </div>
                        </div>
                        {status === "IN_PROGRESS" && (
                            <div className="flex gap-1 items-center">
                                <Input
                                    className="w-16 h-7 text-xs" type="number" placeholder="Hrs"
                                    onChange={(e) => setLogging({ id: res.id, hours: parseFloat(e.target.value) })}
                                />
                                <Button size="sm" variant="ghost" className="h-7 w-7"
                                    onClick={() => logging && logging.id === res.id && logHoursMutation.mutate(logging)}
                                    disabled={!logging || logging.id !== res.id}
                                >
                                    <Clock className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                ))}

                {/* Assign Tech Form */}
                {(status === "DRAFT" || status === "RELEASED" || status === "IN_PROGRESS") && (
                    <div className="flex gap-2 items-center p-2 border border-dashed rounded-md mt-2">
                        {/* Simple Input for User ID for now, normally Select */}
                        <Select value={newRes.userId} onValueChange={(val) => setNewRes({ ...newRes, userId: val })}>
                            <SelectTrigger className="h-8 text-xs flex-1">
                                <SelectValue placeholder="Select Technician" />
                            </SelectTrigger>
                            <SelectContent>
                                {technicians?.map((t: any) => (
                                    <SelectItem key={t.id} value={t.id}>{t.fullName || t.username}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            className="w-16 h-8 text-xs"
                            type="number"
                            title="Planned Hours"
                            value={newRes.plannedHours}
                            onChange={(e) => setNewRes({ ...newRes, plannedHours: parseFloat(e.target.value) })}
                        />
                        <Button size="sm" variant="secondary" onClick={() => assignMutation.mutate(newRes)} disabled={!newRes.userId}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

function ReliabilityAnalysisSection({ workOrder, onUpdate }: { workOrder: any, onUpdate: () => void }) {
    const { toast } = useToast();

    const { data: problems } = useQuery({
        queryKey: ["/api/maintenance/failure-codes", "PROBLEM"],
        queryFn: () => fetch("/api/maintenance/failure-codes?type=PROBLEM").then(r => r.json())
    });

    const { data: causes } = useQuery({
        queryKey: ["/api/maintenance/failure-codes", "CAUSE", workOrder.failureProblemId],
        queryFn: () => fetch(`/api/maintenance/failure-codes?type=CAUSE&parentId=${workOrder.failureProblemId}`).then(r => r.json()),
        enabled: !!workOrder.failureProblemId
    });

    const { data: remedies } = useQuery({
        queryKey: ["/api/maintenance/failure-codes", "REMEDY", workOrder.failureCauseId],
        queryFn: () => fetch(`/api/maintenance/failure-codes?type=REMEDY&parentId=${workOrder.failureCauseId}`).then(r => r.json()),
        enabled: !!workOrder.failureCauseId
    });

    const updateFailureMutation = useMutation({
        mutationFn: (data: any) => fetch(`/api/maintenance/work-orders/${workOrder.id}/failure`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => {
            onUpdate();
            toast({ title: "Failure Analysis Updated" });
        }
    });

    return (
        <Card className="border-orange-100 bg-orange-50/20">
            <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    Reliability Analysis (RCAs)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Failure Problem</label>
                        <Select
                            value={workOrder.failureProblemId || ""}
                            onValueChange={(val) => updateFailureMutation.mutate({ problemId: val, causeId: null, remedyId: null })}
                        >
                            <SelectTrigger className="h-8 text-xs bg-white">
                                <SelectValue placeholder="Select Problem" />
                            </SelectTrigger>
                            <SelectContent>
                                {problems?.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id}>{p.code}: {p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Failure Cause</label>
                        <Select
                            value={workOrder.failureCauseId || ""}
                            onValueChange={(val) => updateFailureMutation.mutate({ causeId: val, remedyId: null })}
                            disabled={!workOrder.failureProblemId}
                        >
                            <SelectTrigger className="h-8 text-xs bg-white">
                                <SelectValue placeholder="Select Cause" />
                            </SelectTrigger>
                            <SelectContent>
                                {causes?.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id}>{c.code}: {c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Failure Remedy</label>
                        <Select
                            value={workOrder.failureRemedyId || ""}
                            onValueChange={(val) => updateFailureMutation.mutate({ remedyId: val })}
                            disabled={!workOrder.failureCauseId}
                        >
                            <SelectTrigger className="h-8 text-xs bg-white">
                                <SelectValue placeholder="Select Remedy" />
                            </SelectTrigger>
                            <SelectContent>
                                {remedies?.map((r: any) => (
                                    <SelectItem key={r.id} value={r.id}>{r.code}: {r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}



