
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandardTable } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";

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
    const { data: orderTypes, isLoading: loadingTypes } = useQuery({ queryKey: ["om-types"], queryFn: fetchOrderTypes });
    const { data: holds, isLoading: loadingHolds } = useQuery({ queryKey: ["om-holds"], queryFn: fetchHolds });

    const typeColumns: any[] = [
        { header: "Type Name", accessorKey: "typeName" },
        { header: "Description", accessorKey: "description" },
        { header: "Workflow", accessorKey: "workflow" },
        { header: "Status", accessorKey: "isActive", cell: (info: any) => <Badge>{info.getValue() ? "Active" : "Inactive"}</Badge> },
    ];

    const holdColumns: any[] = [
        { header: "Hold Name", accessorKey: "holdName" },
        { header: "Description", accessorKey: "description" },
        { header: "Type", accessorKey: "type" },
        { header: "Status", accessorKey: "isActive", cell: (info: any) => <Badge>{info.getValue() ? "Active" : "Inactive"}</Badge> },
    ];

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
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Order Transaction Types</CardTitle>
                            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Type</Button>
                        </CardHeader>
                        <CardContent>
                            <StandardTable data={orderTypes || []} columns={typeColumns} isLoading={loadingTypes} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="holds">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Hold Definitions</CardTitle>
                            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Hold</Button>
                        </CardHeader>
                        <CardContent>
                            <StandardTable data={holds || []} columns={holdColumns} isLoading={loadingHolds} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
