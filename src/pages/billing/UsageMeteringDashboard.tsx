import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    Activity,
    Plus,
    AlertCircle,
    TrendingUp,
    Zap,
    Settings,
    Bell,
    Download,
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
import { PageHeader } from "@/components/ui/PageHeader";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export default function UsageMeteringDashboard() {
    const { businessUnitId } = useEnterpriseStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedCustomer, setSelectedCustomer] = useState<string>("");
    const [createMeterOpen, setCreateMeterOpen] = useState(false);

    // Fetch meters
    const { data: meters = [], isLoading: metersLoading } = useQuery<any>({
        queryKey: ["usage-meters", businessUnitId],
        queryFn: async () => {
            const res = await fetch("/api/billing/usage/meters", {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            if (!res.ok) throw new Error("Failed to fetch meters");
            return res.json();
        },
    });

    // Fetch usage metrics
    const { data: metrics } = useQuery<any>({
        queryKey: ["usage-metrics", selectedCustomer, businessUnitId],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (selectedCustomer) params.append("customerId", selectedCustomer);
            if (businessUnitId) params.append("businessUnitId", businessUnitId);
            const res = await fetch(`/api/billing/usage/metrics?${params}`, {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            if (!res.ok) throw new Error("Failed to fetch metrics");
            return res.json();
        },
    });

    // Fetch customers
    const { data: customers = [] } = useQuery<any>({
        queryKey: ["customers", businessUnitId],
        queryFn: async () => {
            const res = await fetch("/api/ar/customers", {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            return res.json();
        },
    });

    // Usage summary query (for selected customer)
    const { data: usageSummary = [] } = useQuery<any>({
        queryKey: ["usage-summary", selectedCustomer, businessUnitId],
        queryFn: async () => {
            if (!selectedCustomer) return [];
            const params = new URLSearchParams([["period", "current"]]);
            if (businessUnitId) params.append("businessUnitId", businessUnitId);
            const res = await fetch(`/api/billing/usage/summary/${selectedCustomer}?${params}`, {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            if (!res.ok) return [];
            return res.json();
        },
        enabled: !!selectedCustomer,
    });

    // Create meter mutation
    const createMeterMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/billing/usage/meters", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(businessUnitId ? { "x-business-unit-id": businessUnitId } : {})
                },
                body: JSON.stringify({ ...data, entBusinessUnitId: businessUnitId }),
            });
            if (!res.ok) throw new Error("Failed to create meter");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Usage meter created" });
            queryClient.invalidateQueries({ queryKey: ["usage-meters"] });
            setCreateMeterOpen(false);
        },
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
                        <BreadcrumbPage>Usage Metering</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <PageHeader
                title="Usage Metering Dashboard"
                description="Real-time usage tracking, threshold monitoring, and metered billing"
            />

            {/* Customer Filter */}
            <div className="flex gap-2 items-center">
                <Label>Filter by Customer:</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="All Customers" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Customers</SelectItem>
                        {customers.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Usage Events</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalUsageEvents?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">{metrics?.period || "Current Month"}</p>
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Billable Amount</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            ${usageSummary.reduce((sum: number, m: any) => sum + m.billableAmount, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Current period</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Meters</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.activeMeters || meters.length}</div>
                        <p className="text-xs text-muted-foreground">Tracking usage now</p>
                    </CardContent>
                </Card>

                <Card className="border-orange-500/50 bg-orange-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600">Threshold Alerts</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{metrics?.activeThresholds || 0}</div>
                        <p className="text-xs text-muted-foreground">Active thresholds</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="summary" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="summary">Usage Summary</TabsTrigger>
                    <TabsTrigger value="meters">Meter Configuration</TabsTrigger>
                    <TabsTrigger value="thresholds">Alert Thresholds</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Summary by Meter</CardTitle>
                            <CardDescription>
                                Current period usage aggregated by meter type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedCustomer ? (
                                <InteractiveSpreadsheet
                                    data={usageSummary}
                                    columns={[
                                        { id: "meterName", header: "Meter Name", width: "150px", cell: (item: any) => <div className="p-2 font-medium">{item.meterName}</div> },
                                        { id: "totalQuantity", header: "Total Quantity", width: "150px", cell: (item: any) => <div className="p-2">{item.totalQuantity}</div> },
                                        { id: "unit", header: "Unit", width: "100px", cell: (item: any) => <div className="p-2">{item.unit}</div> },
                                        { id: "eventCount", header: "Event Count", width: "150px", cell: (item: any) => <div className="p-2">{item.eventCount}</div> },
                                        {
                                            id: "billableAmount", header: "Billable Amount", width: "150px",
                                            cell: (item: any) => <div className="p-2 font-bold text-primary">${item.billableAmount}</div>,
                                        },
                                    ]}
                                    onChange={() => { }}
                                    virtualized={true} containerHeight="300px"
                                />
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    Select a customer to view usage summary
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="meters" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Usage Meters</CardTitle>
                                <CardDescription>Configure usage tracking and pricing tiers</CardDescription>
                            </div>
                            <CreateMeterDialog
                                open={createMeterOpen}
                                onOpenChange={setCreateMeterOpen}
                                onSubmit={(data) => createMeterMutation.mutate(data)}
                            />
                        </CardHeader>
                        <CardContent>
                            <InteractiveSpreadsheet
                                data={meters}
                                columns={[
                                    { id: "name", header: "Meter Name", width: "200px", cell: (item: any) => <div className="p-2 font-medium">{item.name}</div> },
                                    { id: "unitOfMeasure", header: "Unit of Measure", width: "150px", cell: (item: any) => <div className="p-2">{item.unitOfMeasure}</div> },
                                    { id: "meterType", header: "Type", width: "150px", cell: (item: any) => <div className="p-2">{item.meterType}</div> },
                                    {
                                        id: "isActive", header: "Status", width: "100px",
                                        cell: (item: any) => (
                                            <div className="p-2">
                                                <Badge variant={item.isActive ? "default" : "secondary"}>
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                        ),
                                    },
                                    {
                                        id: "actions", header: "Actions", width: "100px",
                                        cell: (item: any) => (
                                            <div className="p-2">
                                                <Button variant="ghost" size="sm">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ),
                                    },
                                ]}
                                onChange={() => { }}
                                virtualized={true} containerHeight="400px"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="thresholds" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Threshold Alerts</CardTitle>
                            <CardDescription>
                                Configure automatic alerts when usage exceeds thresholds
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No thresholds configured yet</p>
                                <Button className="mt-4" variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add First Threshold
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function CreateMeterDialog({
    open,
    onOpenChange,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
}) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        unitOfMeasure: "",
        meterType: "Counter",
        pricingTiers: [{ min: 0, max: 1000, price: "0" }, { min: 1001, max: null, price: "0.01" }],
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Meter
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Usage Meter</DialogTitle>
                    <DialogDescription>Define a new usage meter with pricing tiers</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Meter Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., API Calls"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="unit">Unit of Measure</Label>
                        <Input
                            id="unit"
                            placeholder="e.g., requests, GB, hours"
                            value={formData.unitOfMeasure}
                            onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Brief description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Pricing Tiers (JSON)</Label>
                        <div className="text-xs text-muted-foreground">
                            Example: First 1000 free, then $0.01 per unit
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={() => onSubmit(formData)} disabled={!formData.name || !formData.unitOfMeasure}>
                        Create Meter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
