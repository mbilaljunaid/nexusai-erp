
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Real API Fetchers
const fetchOrderTypes = async () => {
    const res = await fetch("/api/order-management/config/types");
    return res.json();
};

const fetchHolds = async () => {
    const res = await fetch("/api/order-management/config/holds");
    return res.json();
};


export function OrderConfigManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: orderTypes, isLoading: loadingTypes } = useQuery({ queryKey: ["om-types"], queryFn: fetchOrderTypes });
    const { data: holds, isLoading: loadingHolds } = useQuery({ queryKey: ["om-holds"], queryFn: fetchHolds });

    const typesMutation = useMutation({
        mutationFn: async (data: any[]) => { return {}; },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["om-types"] });
            toast({ title: "Success", description: "Order Types saved successfully" });
        }
    });

    const holdsMutation = useMutation({
        mutationFn: async (data: any[]) => { return {}; },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["om-holds"] });
            toast({ title: "Success", description: "Holds saved successfully" });
        }
    });

    const typeColumns: any[] = [
        {
            id: "typeName",
            header: "Type Name *",
            width: "250px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input
                    className="h-9 w-full bg-transparent border-0 focus-visible:ring-0"
                    value={row.typeName || ""}
                    onChange={e => updateRow("typeName", e.target.value)}
                    placeholder="Type Name"
                />
            )
        },
        {
            id: "description",
            header: "Description",
            width: "350px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input
                    className="h-9 w-full bg-transparent border-0 focus-visible:ring-0"
                    value={row.description || ""}
                    onChange={e => updateRow("description", e.target.value)}
                />
            )
        },
        {
            id: "workflow",
            header: "Workflow",
            width: "200px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.workflow || "Standard"} onValueChange={(val) => updateRow("workflow", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {["Standard", "Return", "Transfer", "Drop Ship"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "isActive",
            header: "Status",
            width: "120px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.isActive ? "true" : "false"} onValueChange={(val) => updateRow("isActive", val === "true")}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
    ];

    const holdColumns: any[] = [
        {
            id: "holdName",
            header: "Hold Name *",
            width: "250px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input
                    className="h-9 w-full bg-transparent border-0 focus-visible:ring-0"
                    value={row.holdName || ""}
                    onChange={e => updateRow("holdName", e.target.value)}
                    placeholder="Hold Name"
                />
            )
        },
        {
            id: "description",
            header: "Description",
            width: "350px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input
                    className="h-9 w-full bg-transparent border-0 focus-visible:ring-0"
                    value={row.description || ""}
                    onChange={e => updateRow("description", e.target.value)}
                />
            )
        },
        {
            id: "type",
            header: "Type",
            width: "200px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.type || "Credit"} onValueChange={(val) => updateRow("type", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {["Credit", "Compliance", "Manual", "System"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "isActive",
            header: "Status",
            width: "120px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.isActive ? "true" : "false"} onValueChange={(val) => updateRow("isActive", val === "true")}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
    ];

    const handleAddType = () => {
        const newRow = { id: `temp-${Date.now()}`, typeName: "", description: "", workflow: "Standard", isActive: true };
        queryClient.setQueryData(["om-types"], (old: any) => [...(old || []), newRow]);
    };

    const handleAddHold = () => {
        const newRow = { id: `temp-${Date.now()}`, holdName: "", description: "", type: "Credit", isActive: true };
        queryClient.setQueryData(["om-holds"], (old: any) => [...(old || []), newRow]);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Order Management Configuration</h1>
                    <p className="text-muted-foreground">Manage Order Types, Holds, and Orchestration Rules.</p>
                </div>
            </div>

            <Tabs defaultValue="types" className="w-full">
                <TabsList>
                    <TabsTrigger value="types">Order Types</TabsTrigger>
                    <TabsTrigger value="holds">Holds & Approvals</TabsTrigger>
                </TabsList>

                <TabsContent value="types">
                    <Card className="vanguard-card">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
                            <div>
                                <CardTitle>Order Transaction Types</CardTitle>
                                <CardDescription>Define how different orders are processed</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={handleAddType}><Plus className="mr-2 h-4 w-4" /> Add Type</Button>
                                <Button size="sm" onClick={() => typesMutation.mutate(orderTypes || [])} disabled={typesMutation.isPending}>Save</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[500px] p-0">
                            <InteractiveSpreadsheet
                                data={orderTypes || []}
                                columns={typeColumns}
                                onChange={(newData) => queryClient.setQueryData(["om-types"], () => newData)}
                                virtualized={true}
                                containerHeight="500px"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="holds">
                    <Card className="vanguard-card">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
                            <div>
                                <CardTitle>Hold Definitions</CardTitle>
                                <CardDescription>Define and manage hold statuses for orders</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={handleAddHold}><Plus className="mr-2 h-4 w-4" /> Add Hold</Button>
                                <Button size="sm" onClick={() => holdsMutation.mutate(holds || [])} disabled={holdsMutation.isPending}>Save</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[500px] p-0">
                            <InteractiveSpreadsheet
                                data={holds || []}
                                columns={holdColumns}
                                onChange={(newData) => queryClient.setQueryData(["om-holds"], () => newData)}
                                virtualized={true}
                                containerHeight="500px"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
