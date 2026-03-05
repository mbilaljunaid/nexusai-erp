import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Plus, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomerPicker } from "@/components/shared/CustomerPicker";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SubscriptionDetailSheet } from "./components/SubscriptionDetailSheet";

import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export function SubscriptionWorkbench() {
    const { businessUnitId } = useEnterpriseStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedSub, setSelectedSub] = useState<any>(null);

    // --- Fetch Query ---

    // Fetch Customers for Lookup
    const { data: customers = [] } = useQuery<any>({
        queryKey: ["customers", businessUnitId],
        queryFn: async () => fetch("/api/ar/customers", {
            headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
        }).then(res => res.json())
    });

    const getCustomerName = (id: string) => {
        const c = customers.find((c: any) => c.id === id);
        return c ? c.name : id;
    };

    const { data: subscriptions, isLoading } = useQuery<any>({
        queryKey: ["subscriptions", businessUnitId],
        queryFn: async () => {
            const res = await fetch("/api/billing/subscriptions", {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            if (!res.ok) return [];
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/billing/subscriptions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(businessUnitId ? { "x-business-unit-id": businessUnitId } : {})
                },
                body: JSON.stringify({ ...data, entBusinessUnitId: businessUnitId }),
            });
            if (!res.ok) throw new Error("Failed to create");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Subscription Created" });
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        }
    });

    const billingCycleMutation = useMutation({
        mutationFn: async () => fetch("/api/billing/subscriptions/process-billing", {
            method: "POST",
            headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
        }).then(res => res.json()),
        onSuccess: (data: any) => {
            toast({ title: "Billing Cycle Complete", description: `Generated ${data.count} billing events.` });
        }
    });

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/finance/billing">Billing</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Subscriptions</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subscription Workbench</h1>
                    <p className="text-muted-foreground">Manage recurring revenue contracts and lifecycle events.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => billingCycleMutation.mutate()}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Run Billing Cycle
                    </Button>
                    <Button onClick={() => {
                        // Demo Creation
                        createMutation.mutate({
                            contractNumber: `SUB-${Date.now()}`,
                            customerId: "cus_demo_new",
                            startDate: new Date(),
                            totalTcv: "12000",
                            totalMrr: "1000",
                            products: [
                                { itemId: "prod_saas_gold", itemName: "SaaS Gold Plan", quantity: "10", unitPrice: "100", amount: "1000" }
                            ]
                        });
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> New Subscription
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                    <InteractiveSpreadsheet
                        data={subscriptions || []}
                        columns={[
                            { id: "contractNumber", header: "Contract #", width: "150px", cell: (item: any) => <div className="p-2 font-medium">{item.contractNumber}</div> },
                            { id: "customerId", header: "Customer", width: "200px", cell: (item: any) => <div className="p-2">{getCustomerName(item.customerId)}</div> },
                            { id: "status", header: "Status", width: "150px", cell: (item: any) => <div className="p-2"><Badge variant="outline">{item.status}</Badge></div> },
                            { id: "totalMrr", header: "MRR", width: "150px", cell: (item: any) => <div className="p-2">${Number(item.totalMrr).toLocaleString()}</div> },
                            {
                                id: "actions", header: "Actions", width: "150px",
                                cell: (item: any) => (
                                    <div className="p-2">
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedSub(item); }}>
                                            View Details
                                        </Button>
                                    </div>
                                )
                            }
                        ]}
                        onChange={() => { }}
                        virtualized={true} containerHeight="400px"
                    />
                </CardContent>
            </Card>

            {/* Detail View Sheet */}
            <SubscriptionDetailSheet
                subscriptionId={selectedSub?.id}
                open={!!selectedSub}
                onOpenChange={(open) => !open && setSelectedSub(null)}
            />
        </div>
    );
}
