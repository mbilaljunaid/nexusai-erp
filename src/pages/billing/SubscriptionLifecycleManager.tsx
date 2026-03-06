import { formatDate } from "@/lib/dateUtils";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Plus,
    RefreshCw,
    Edit,
    Ban,
    TrendingUp,
    DollarSign,
    Users,
    Calendar,
    CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SubscriptionDetailSheet } from "./components/SubscriptionDetailSheet";
import { PageHeader } from "@/components/ui/PageHeader";
import { useEnterpriseStore } from "@/lib/enterpriseStore";
import { DatePicker } from '@/components/ui/DatePicker';

interface SubscriptionFormData {
    contractNumber: string;
    customerId: string;
    startDate: string;
    billingFrequency: string;
    products: Array<{
        itemId: string;
        itemName: string;
        quantity: string;
        unitPrice: string;
        amount: string;
    }>;
}

export default function SubscriptionLifecycleManager() {
    const { businessUnitId } = useEnterpriseStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedSub, setSelectedSub] = useState<any>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [cancelSubId, setCancelSubId] = useState<string | null>(null);

    // Fetch subscriptions
    const { data: subscriptionsResult, isLoading } = useQuery<any>({
        queryKey: ["subscriptions", statusFilter, businessUnitId],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (statusFilter && statusFilter !== "all") {
                params.append("status", statusFilter);
            }
            if (businessUnitId) {
                params.append("businessUnitId", businessUnitId);
            }
            const res = await fetch(`/api/billing/subscriptions?${params}`, {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            if (!res.ok) throw new Error("Failed to fetch subscriptions");
            return res.json();
        },
    });

    // Fetch customers for picker
    const { data: customers = [] } = useQuery<any>({
        queryKey: ["customers", businessUnitId],
        queryFn: async () => {
            const res = await fetch("/api/ar/customers", {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            return res.json();
        },
    });

    // Create subscription mutation
    const createMutation = useMutation({
        mutationFn: async (data: SubscriptionFormData) => {
            const res = await fetch("/api/billing/subscriptions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(businessUnitId ? { "x-business-unit-id": businessUnitId } : {})
                },
                body: JSON.stringify({
                    ...data,
                    totalTcv: data.products.reduce((sum, p) => sum + parseFloat(p.amount), 0).toString(),
                    totalMrr: (data.products.reduce((sum, p) => sum + parseFloat(p.amount), 0) / 12).toFixed(2),
                    entBusinessUnitId: businessUnitId,
                }),
            });
            if (!res.ok) throw new Error("Failed to create subscription");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Subscription created successfully" });
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
            setCreateDialogOpen(false);
        },
    });

    // Renew mutation
    const renewMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/billing/subscriptions/${id}/renew`, {
                method: "POST",
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            if (!res.ok) throw new Error("Failed to renew");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Subscription renewed" });
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        },
    });

    // Cancel mutation
    const cancelMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            const res = await fetch(`/api/billing/subscriptions/${id}/terminate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(businessUnitId ? { "x-business-unit-id": businessUnitId } : {})
                },
                body: JSON.stringify({ reason }),
            });
            if (!res.ok) throw new Error("Failed to cancel");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Subscription cancelled" });
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        },
    });

    const subscriptions = subscriptionsResult?.data || [];

    // Calculate metrics
    const metrics = {
        totalActive: subscriptions.filter((s: any) => s.status === "Active").length,
        totalMrr: subscriptions
            .filter((s: any) => s.status === "Active")
            .reduce((sum: number, s: any) => sum + parseFloat(s.totalMrr || "0"), 0),
        avgContractValue: subscriptions.length > 0
            ? subscriptions.reduce((sum: number, s: any) => sum + parseFloat(s.totalTcv || "0"), 0) / subscriptions.length
            : 0,
        churnRate: 5.2,
    };

    const getCustomerName = (id: string) => {
        const customer = customers.find((c: any) => c.id === id);
        return customer?.name || id;
    };



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
                        <BreadcrumbPage>Subscription Lifecycle</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <PageHeader
                title="Subscription Lifecycle Manager"
                description="Manage recurring revenue contracts with full lifecycle support"
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalActive}</div>
                        <p className="text-xs text-muted-foreground">Across all customers</p>
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">${metrics.totalMrr.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Contract Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.avgContractValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-muted-foreground">Per customer</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.churnRate}%</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Subscription Management</CardTitle>
                        <CardDescription>Create, renew, amend, and cancel subscriptions</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <CreateSubscriptionDialog
                            open={createDialogOpen}
                            onOpenChange={setCreateDialogOpen}
                            customers={customers}
                            onSubmit={(data) => createMutation.mutate(data)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <InteractiveSpreadsheet
                        data={subscriptions}
                        columns={[
                            { id: "contractNumber", header: "Contract #", width: "150px", cell: (r) => <div className="p-2 font-medium">{r.contractNumber}</div> },
                            {
                                id: "customer", header: "Customer", width: "200px",
                                cell: (item: any) => <div className="p-2">{getCustomerName(item.customerId)}</div>,
                            },
                            {
                                id: "status", header: "Status", width: "150px",
                                cell: (item: any) => <div className="p-2"><StatusBadge status={item.status} /></div>,
                            },
                            {
                                id: "totalMrr", header: "MRR", width: "150px",
                                cell: (item: any) => <div className="p-2">${parseFloat(item.totalMrr || "0").toLocaleString()}</div>,
                            },
                            {
                                id: "startDate", header: "Start Date", width: "150px",
                                cell: (item: any) => <div className="p-2">{formatDate(item.startDate)}</div>,
                            },
                            {
                                id: "endDate", header: "End Date", width: "150px",
                                cell: (item: any) => <div className="p-2">{item.endDate ? formatDate(item.endDate) : "—"}</div>,
                            },
                            {
                                id: "actions", header: "Actions", width: "200px",
                                cell: (item: any) => (
                                    <div className="flex gap-2 p-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSub(item);
                                            }}
                                        >
                                            View
                                        </Button>
                                        {item.status === "Active" && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        renewMutation.mutate(item.id);
                                                    }}
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCancelSubId(item.id);
                                                    }}
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        onChange={() => { }}
                        virtualized={true} containerHeight="400px"
                    />
                </CardContent>
            </Card>

            {/* Detail Sheet */}
            <SubscriptionDetailSheet
                subscriptionId={selectedSub?.id}
                open={!!selectedSub}
                onOpenChange={(open) => !open && setSelectedSub(null)}
            />

            <AlertDialog open={!!cancelSubId} onOpenChange={(open) => !open && setCancelSubId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this subscription? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (cancelSubId) {
                                    cancelMutation.mutate({
                                        id: cancelSubId,
                                        reason: "Customer request",
                                    });
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Cancel Subscription
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function CreateSubscriptionDialog({
    open,
    onOpenChange,
    customers,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customers: any[];
    onSubmit: (data: SubscriptionFormData) => void;
}) {
    const [formData, setFormData] = useState<SubscriptionFormData>({
        contractNumber: `SUB-${Date.now().toString().slice(-6)}`,
        customerId: "",
        startDate: new Date().toISOString().split("T")[0],
        billingFrequency: "Monthly",
        products: [
            { itemId: "prod_001", itemName: "SaaS Gold Plan", quantity: "1", unitPrice: "1000", amount: "1000" },
        ],
    });

    const handleSubmit = () => {
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Subscription
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Subscription</DialogTitle>
                    <DialogDescription>Configure a new recurring revenue contract</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contractNumber">Contract Number</Label>
                            <Input
                                id="contractNumber"
                                value={formData.contractNumber}
                                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customer">Customer</Label>
                            <Select
                                value={formData.customerId}
                                onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <DatePicker value={formData.startDate} onChange={(v) => setFormData({ ...formData, startDate: v })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="frequency">Billing Frequency</Label>
                            <Select
                                value={formData.billingFrequency}
                                onValueChange={(value) => setFormData({ ...formData, billingFrequency: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                                    <SelectItem value="Annually">Annually</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Products</Label>
                        <div className="border rounded-md p-4 space-y-2">
                            {formData.products.map((product, idx) => (
                                <div key={idx} className="grid grid-cols-4 gap-2">
                                    <Input
                                        placeholder="Item Name"
                                        value={product.itemName}
                                        onChange={(e) => {
                                            const products = [...formData.products];
                                            products[idx].itemName = e.target.value;
                                            setFormData({ ...formData, products });
                                        }}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Qty"
                                        value={product.quantity}
                                        onChange={(e) => {
                                            const products = [...formData.products];
                                            products[idx].quantity = e.target.value;
                                            products[idx].amount = (
                                                parseFloat(e.target.value) * parseFloat(product.unitPrice)
                                            ).toString();
                                            setFormData({ ...formData, products });
                                        }}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Unit Price"
                                        value={product.unitPrice}
                                        onChange={(e) => {
                                            const products = [...formData.products];
                                            products[idx].unitPrice = e.target.value;
                                            products[idx].amount = (
                                                parseFloat(product.quantity) * parseFloat(e.target.value)
                                            ).toString();
                                            setFormData({ ...formData, products });
                                        }}
                                    />
                                    <Input placeholder="Amount" value={product.amount} disabled />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.customerId}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Create Subscription
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
