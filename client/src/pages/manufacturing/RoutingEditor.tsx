import React, { useState } from 'react';
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Workflow, Save, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface WorkCenter { id: string; name: string; }
interface Resource { id: string; name: string; resourceCode: string; }
interface InventoryItem { id: string; itemName: string; }

interface RoutingOperation {
    operationSeq: number;
    description: string;
    workCenterId: string;
    resourceId: string;
    standardOperationId?: string; // L9 Integration
    setupTime: number;
    runTime: number;
}

interface RoutingHeader {
    id: string;
    routingNumber: string;
    productId: string;
    displayName?: string;
    status: string;
}

export default function RoutingEditor() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [newRoutingNumber, setNewRoutingNumber] = useState("");
    const [newProductId, setNewProductId] = useState("");
    const [operations, setOperations] = useState<RoutingOperation[]>([]);

    const { data: routings = [], isLoading: routingsLoading } = useQuery<RoutingHeader[]>({
        queryKey: ["/api/manufacturing/routings"],
    });

    const { data: workCenters = [] } = useQuery<WorkCenter[]>({
        queryKey: ["/api/manufacturing/work-centers"],
    });

    const { data: resources = [] } = useQuery<Resource[]>({
        queryKey: ["/api/manufacturing/resources"],
    });

    const { data: inventory = [] } = useQuery<InventoryItem[]>({
        queryKey: ["/api/scm/inventory"],
    });

    const { data: standardOps = [] } = useQuery<any[]>({
        queryKey: ["/api/manufacturing/standard-operations"],
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/manufacturing/routings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save Routing");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/routings"] });
            setIsEditing(false);
            setOperations([]);
            setNewRoutingNumber("");
            toast({ title: "Success", description: "Routing saved successfully" });
        }
    });

    const addOperation = () => {
        const nextSeq = operations.length > 0 ? Math.max(...operations.map(o => o.operationSeq)) + 10 : 10;
        setOperations([...operations, {
            operationSeq: nextSeq,
            operationSeq: nextSeq,
            description: "",
            standardOperationId: "",
            workCenterId: "",
            resourceId: "",
            setupTime: 0,
            runTime: 0
        }]);
    };

    const updateOperation = (index: number, field: keyof RoutingOperation, value: any) => {
        const updated = [...operations];
        updated[index] = { ...updated[index], [field]: value };
        setOperations(updated);
    };

    const handleSave = () => {
        if (!newRoutingNumber || !newProductId || operations.length === 0) {
            toast({ title: "Validation Error", description: "Missing required header or operations", variant: "destructive" });
            return;
        }
        createMutation.mutate({
            header: { routingNumber: newRoutingNumber, productId: newProductId, status: "active" },
            operations
        });
    };

    const routingsWithNames = routings.map(r => {
        const product = inventory.find(i => i.id === r.productId);
        return { ...r, displayName: product ? product.itemName : r.productId };
    });

    const routingsDetailed = routingsWithNames.map(r => {
        // If we were showing a detail view with operations, we'd join there too.
        // For the master list, the product name join is already handled.
        return r;
    });

    const columns: Column<RoutingHeader & { displayName: string }>[] = [
        {
            header: "Routing #",
            accessorKey: "routingNumber",
            cell: (row: any) => <span className="font-mono font-bold text-indigo-600">{row.routingNumber}</span>
        },
        {
            header: "Product",
            accessorKey: "displayName",
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: any) => <Badge variant="outline">{row.status}</Badge>
        }
    ];

    if (isEditing) {
        return (
            <StandardPage
                title="Define Manufacturing Sequence"
                breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Routings" }, { label: "Editor" }]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={createMutation.isPending}>
                            <Save className="mr-2 h-4 w-4" /> Save Routing
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Routing Header</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Routing Reference</Label>
                                <Input value={newRoutingNumber} onChange={e => setNewRoutingNumber(e.target.value)} placeholder="RT-XXXX" />
                            </div>
                            <div className="space-y-2">
                                <Label>Target Product</Label>
                                <Select value={newProductId} onValueChange={setNewProductId}>
                                    <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                                    <SelectContent>
                                        {inventory.map(item => (
                                            <SelectItem key={item.id} value={item.id}>{item.itemName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Process Steps / Operations</h3>
                            <Button size="sm" onClick={addOperation}><Plus className="h-4 w-4 mr-1" /> Add Step</Button>
                        </div>

                        {operations.map((op, idx) => (
                            <Card key={idx} className="relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                        <div className="md:col-span-1">
                                            <Label className="text-xs uppercase text-muted-foreground">Seq</Label>
                                            <Input type="number" value={op.operationSeq} onChange={e => updateOperation(idx, "operationSeq", parseInt(e.target.value))} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="text-xs uppercase text-muted-foreground">Standard Op</Label>
                                            <Select value={op.standardOperationId} onValueChange={val => {
                                                const std = standardOps.find((s: any) => s.id === val);
                                                const updated = [...operations];
                                                updated[idx] = {
                                                    ...updated[idx],
                                                    standardOperationId: val,
                                                    description: std?.name || updated[idx].description,
                                                    setupTime: std?.defaultSetupTime ? parseFloat(std.defaultSetupTime) : updated[idx].setupTime,
                                                    runTime: std?.defaultRunTime ? parseFloat(std.defaultRunTime) : updated[idx].runTime,
                                                    workCenterId: std?.defaultWorkCenterId || updated[idx].workCenterId
                                                };
                                                setOperations(updated);
                                            }}>
                                                <SelectTrigger className="h-10"><SelectValue placeholder="Template..." /></SelectTrigger>
                                                <SelectContent>
                                                    {standardOps.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.code}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="text-xs uppercase text-muted-foreground">Description</Label>
                                            <Input value={op.description} onChange={e => updateOperation(idx, "description", e.target.value)} placeholder="e.g. Rough Sanding" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="text-xs uppercase text-muted-foreground">Work Center</Label>
                                            <Select value={op.workCenterId} onValueChange={val => updateOperation(idx, "workCenterId", val)}>
                                                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                                                <SelectContent>
                                                    {workCenters.map(wc => <SelectItem key={wc.id} value={wc.id}>{wc.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="text-xs uppercase text-muted-foreground">Resource</Label>
                                            <Select value={op.resourceId} onValueChange={val => updateOperation(idx, "resourceId", val)}>
                                                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                                                <SelectContent>
                                                    {resources.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="md:col-span-1">
                                            <Label className="text-xs uppercase text-muted-foreground">Setup (m)</Label>
                                            <Input type="number" value={op.setupTime} onChange={e => updateOperation(idx, "setupTime", parseFloat(e.target.value))} />
                                        </div>
                                        <div className="md:col-span-1">
                                            <Label className="text-xs uppercase text-muted-foreground">Run (m)</Label>
                                            <Input type="number" value={op.runTime} onChange={e => updateOperation(idx, "runTime", parseFloat(e.target.value))} />
                                        </div>
                                        <div className="md:col-span-1 flex justify-end pt-5">
                                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setOperations(operations.filter((_, i) => i !== idx))}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </StandardPage>
        );
    }

    return (
        <StandardPage
            title="Manufacturing Routings"
            breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Engineering" }, { label: "Routings" }]}
            actions={
                <Button onClick={() => setIsEditing(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Routing
                </Button>
            }
        >
            <StandardTable
                data={routingsWithNames}
                columns={columns}
                isLoading={routingsLoading}
                keyExtractor={(item) => item.id}
                filterColumn="displayName"
                filterPlaceholder="Filter by product..."
            />
        </StandardPage>
    );
}
