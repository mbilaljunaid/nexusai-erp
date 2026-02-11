import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Ship,
    Calendar,
    DollarSign,
    ArrowLeft,
    Plus,
    Brain,
    Calculator,
    FileText,
    History,
    CheckCircle2,
    Clock,
    AlertCircle,
    Anchor,
    Box,
    Truck,
    LineChart,
    TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Progress } from "@/components/ui/progress";

export default function TradeOperationDetails() {
    const { id } = useParams<{ id: string }>();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("header");

    // Fetch Details
    const { data: op, isLoading, isError } = useQuery({
        queryKey: [`/api/lcm/trade-operations/${id}`],
        queryFn: async () => {
            const res = await fetch(`/api/lcm/trade-operations/${id}`);
            if (!res.ok) throw new Error("Failed to fetch operation details");
            return res.json();
        }
    });

    // Mutations
    const allocateMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/lcm/trade-operations/${id}/allocate`, { method: "POST" });
            if (!res.ok) throw new Error("Allocation failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/lcm/trade-operations/${id}`] });
            toast({ title: "Allocation Complete", description: "Costs have been distributed across shipment lines." });
        }
    });

    const predictMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/lcm/trade-operations/${id}/predict`, { method: "POST" });
            if (!res.ok) throw new Error("Prediction failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/lcm/trade-operations/${id}`] });
            toast({ title: "AI Prediction Ready", description: "Predictive cost analysis has been updated." });
        }
    });

    const accountingMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/lcm/trade-operations/${id}/accounting`, { method: "POST" });
            if (!res.ok) throw new Error("Accounting generation failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/lcm/trade-operations/${id}`] });
            toast({ title: "Accounting Generated", description: "GL journals have been created for this operation." });
        }
    });

    if (isLoading) return (
        <div className="flex h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Loading voyage telemetry...</p>
            </div>
        </div>
    );

    if (isError || !op) return (
        <Card className="m-6 border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Error Loading Operation</CardTitle>
                <CardDescription>The requested trade operation could not be found or is inaccessible.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => setLocation("/scm/lcm/operations")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Workbench
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setLocation("/scm/lcm/operations")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">{op.operationNumber}</h1>
                            <Badge variant={op.status === 'OPEN' ? 'default' : 'secondary'} className="uppercase">
                                {op.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{op.name} • {op.carrier || "Carrier Generic"} • {op.vessel || "Surface Vessel"}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => predictMutation.mutate()} disabled={predictMutation.isPending}>
                        <Brain className={`mr-2 h-4 w-4 ${predictMutation.isPending ? 'animate-pulse' : ''}`} />
                        {predictMutation.isPending ? "Analyzing..." : "AI Insight"}
                    </Button>
                    <Button variant="outline" onClick={() => allocateMutation.mutate()} disabled={allocateMutation.isPending}>
                        <Calculator className="mr-2 h-4 w-4" /> Allocate
                    </Button>
                    <Button onClick={() => accountingMutation.mutate()} disabled={accountingMutation.isPending}>
                        <FileText className="mr-2 h-4 w-4" /> Post Accounting
                    </Button>
                </div>
            </div>

            {/* Status Stepper High-Level */}
            <Card className="bg-muted/30">
                <CardContent className="py-4">
                    <div className="flex justify-between items-center px-4">
                        {[
                            { label: 'Created', icon: CheckCircle2, status: 'complete' },
                            { label: 'Shipped', icon: Anchor, status: op.departureDate ? 'complete' : 'pending' },
                            { label: 'Arrived', icon: Box, status: op.arrivalDate ? 'complete' : 'pending' },
                            { label: 'Allocated', icon: Calculator, status: op.status === 'CLOSED' ? 'complete' : 'current' },
                            { label: 'Closed', icon: Clock, status: op.status === 'CLOSED' ? 'complete' : 'pending' }
                        ].map((step, i, arr) => (
                            <React.Fragment key={step.label}>
                                <div className="flex flex-col items-center gap-1">
                                    <div className={`p-2 rounded-full ${step.status === 'complete' ? 'bg-primary text-primary-foreground' : step.status === 'current' ? 'bg-primary/20 text-primary border border-primary' : 'bg-muted text-muted-foreground'}`}>
                                        <step.icon className="h-4 w-4" />
                                    </div>
                                    <span className={`text-[10px] font-medium uppercase ${step.status === 'pending' ? 'text-muted-foreground' : 'text-primary'}`}>{step.label}</span>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className={`flex-1 h-[2px] mx-2 ${step.status === 'complete' ? 'bg-primary' : 'bg-muted'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="header" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6 h-12 bg-muted/50 p-1">
                    <TabsTrigger value="header">General Info</TabsTrigger>
                    <TabsTrigger value="lines">Shipment Lines</TabsTrigger>
                    <TabsTrigger value="charges">Est. Charges</TabsTrigger>
                    <TabsTrigger value="allocations">Allocation Workbench</TabsTrigger>
                    <TabsTrigger value="intelligence">AI Intelligence</TabsTrigger>
                    <TabsTrigger value="audit">Audit History</TabsTrigger>
                </TabsList>

                {/* --- Tab 1: Header --- */}
                <TabsContent value="header" className="space-y-4 mt-4">
                    <div className="grid grid-cols-3 gap-6">
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">Logistics Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Carrier</p>
                                    <p className="font-medium">{op.carrier || "Not assigned"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Vessel / Voyage</p>
                                    <p className="font-medium">{op.vessel || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Bill of Lading</p>
                                    <p className="font-medium">{op.billOfLading || "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Port of Delivery</p>
                                    <p className="font-medium">Rotterdam Gateway</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Departure Date
                                    </p>
                                    <p className="font-medium">{op.departureDate ? format(new Date(op.departureDate), 'PPP') : 'Not Shipped'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Arrival Date
                                    </p>
                                    <p className="font-medium">{op.arrivalDate ? format(new Date(op.arrivalDate), 'PPP') : 'ETA Pending'}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Financial Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center pb-2 border-b">
                                    <span className="text-sm text-muted-foreground">Est. Total Charges</span>
                                    <span className="font-bold text-lg font-mono">${Number(op.totalEstimatedCharges || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b">
                                    <span className="text-sm text-muted-foreground">Actual Charges</span>
                                    <span className="font-bold text-lg font-mono text-blue-600">${Number(op.totalActualCharges || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-red-600">
                                    <span className="text-sm">Variance</span>
                                    <span className="font-mono font-bold">+$2,450.00</span>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[10px] text-muted-foreground uppercase mb-1">Approval Workflow</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getApprovalVariant(op.approvalStatus)}>{op.approvalStatus || 'DRAFT'}</Badge>
                                        <span className="text-xs text-muted-foreground font-mono">ID: {id?.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- Tab 2: Shipment Lines --- */}
                <TabsContent value="lines" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Included Items</CardTitle>
                                <CardDescription>List of purchase order lines associated with this trade operation.</CardDescription>
                            </div>
                            <Button size="sm" variant="outline">
                                <Plus className="mr-2 h-4 w-4" /> Add Lines
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>PO Reference</TableHead>
                                        <TableHead>Item / Description</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Unit Value</TableHead>
                                        <TableHead className="text-right">Weight (KG)</TableHead>
                                        <TableHead className="text-right">Allocated Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {op.lines?.length > 0 ? (
                                        op.lines.map((line: any) => (
                                            <TableRow key={line.id}>
                                                <TableCell className="font-mono text-xs">{line.purchaseOrderLineId}</TableCell>
                                                <TableCell>Item Prefix - Generic Material</TableCell>
                                                <TableCell className="text-right font-medium">{line.quantity}</TableCell>
                                                <TableCell className="text-right font-mono">$125.00</TableCell>
                                                <TableCell className="text-right">{line.netWeight || '-'}</TableCell>
                                                <TableCell className="text-right font-mono font-semibold text-primary">
                                                    ${Number(line.allocatedAmount || 0).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground italic">
                                                No shipment lines added to this operation.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Tab 3: Charges --- */}
                <TabsContent value="charges" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Estimated Charges</CardTitle>
                                <CardDescription>Provisional costs for duties, freight, and insurance.</CardDescription>
                            </div>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" /> Add Charge
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cost Component</TableHead>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Referenece</TableHead>
                                        <TableHead>Allocation Basis</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {op.charges?.length > 0 ? (
                                        op.charges.map((charge: any) => (
                                            <TableRow key={charge.id}>
                                                <TableCell className="font-medium">Ocean Freight</TableCell>
                                                <TableCell>Blue Anchor Logistics</TableCell>
                                                <TableCell className="text-xs font-mono">{charge.referenceNumber || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[10px]">WEIGHT</Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-mono font-bold">${Number(charge.amount).toLocaleString()}</TableCell>
                                                <TableCell className="text-center">
                                                    {charge.isActual ? (
                                                        <Badge variant="success" className="text-[9px]">ACTUAL (AP)</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-[9px]">ESTIMATE</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground italic">
                                                No charges defined for this operation.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Tab 4: Allocation Workbench --- */}
                <TabsContent value="allocations" className="mt-4">
                    <div className="grid grid-cols-4 gap-6">
                        <div className="col-span-1 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Allocation Control</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span>Progress</span>
                                            <span>85%</span>
                                        </div>
                                        <Progress value={85} className="h-1.5" />
                                    </div>
                                    <Button className="w-full" onClick={() => allocateMutation.mutate()} disabled={allocateMutation.isPending}>
                                        <Calculator className="mr-2 h-4 w-4" /> Run Allocator
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        <LineChart className="mr-2 h-4 w-4" /> Simulate Variance
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="bg-blue-50/50 border-blue-100">
                                <CardContent className="p-4 flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                                    <p className="text-xs text-blue-800 leading-relaxed">
                                        <b>Tip:</b> Costs are currently allocated using the <b>Master Weighted Average</b> of Item Weights.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="col-span-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Distributed Costs</CardTitle>
                                    <CardDescription>Final unit cost impact per shipment line item.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border bg-muted/20 text-center py-20 text-muted-foreground italic">
                                        Detailed Allocation Matrix Visualization Coming in Phase 4.
                                        <br />
                                        <Button variant="link" className="mt-2">View Raw Allocation Log</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* --- Tab 5: AI Intelligence --- */}
                <TabsContent value="intelligence" className="mt-4">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Brain className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>Nexus AI Cost Prediction</CardTitle>
                                    <CardDescription>Predictive analytics for landed cost variances based on historical voyage data.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 rounded-lg bg-background border space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-600" /> Variance Probability
                                    </h4>
                                    <div className="text-3xl font-bold font-mono">+4.2%</div>
                                    <p className="text-xs text-muted-foreground">Predicted increase in Port Handling charges vs Estimated.</p>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Badge variant="outline" className="text-[9px]">HISTORY-SYNC</Badge>
                                        <Badge variant="outline" className="text-[9px]">CONGESTION-MODEL</Badge>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-background border space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <History className="h-4 w-4 text-blue-600" /> Historical Comparison
                                    </h4>
                                    <div className="text-3xl font-bold font-mono">-$1.2k</div>
                                    <p className="text-xs text-muted-foreground">Ocean freight is trending lower than previous similar shipments.</p>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-4">
                                        <div className="h-full bg-blue-500 w-[65%]" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border border-dashed rounded-lg">
                                <h4 className="text-sm font-semibold mb-2">AI Recommendation</h4>
                                <p className="text-sm text-muted-foreground italic">
                                    "Based on current fuel surcharges and carrier performance, we recommend increasing the provisional Duty allocation by 0.5% for this route to avoid period-end variance."
                                </p>
                                <Button size="sm" variant="outline" className="mt-4">Apply AI Rec</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Tab 6: Audit --- */}
                <TabsContent value="audit" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Operation Audit Log</CardTitle>
                            <CardDescription>Immutable record of all changes, approvals, and allocations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                                {[
                                    { action: 'POSTED_ACCOUNTING', user: 'SYSTEM', time: '2 hours ago', details: 'GL Journal J-LCM-1002 Created' },
                                    { action: 'ALLOCATION_RUN', user: 'mbjunaid', time: '1 day ago', details: 'Total $12k allocated to 45 lines' },
                                    { action: 'OPERATION_APPROVED', user: 'admin_finance', time: '2 days ago', details: 'Manual approval granted' },
                                    { action: 'CHARGES_ADDED', user: 'mbjunaid', time: '3 days ago', details: 'Insurance charge $450 added' },
                                    { action: 'OPERATION_CREATED', user: 'mbjunaid', time: '3 days ago', details: 'Initial draft initialized' },
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-4 relative">
                                        <div className={`mt-1 h-9 w-9 rounded-full border bg-background flex items-center justify-center shrink-0 z-10 ${i === 0 ? 'border-primary ring-4 ring-primary/10' : ''}`}>
                                            <History className={`h-4 w-4 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold uppercase tracking-tight">{log.action.replace('_', ' ')}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">{log.time}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-snug">{log.details}</p>
                                            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-medium text-muted-foreground uppercase">
                                                <Badge variant="outline" className="p-0 h-auto text-[9px] font-bold border-none">{log.user}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function getApprovalVariant(status: string) {
    switch (status) {
        case 'APPROVED': return 'success';
        case 'PENDING_APPROVAL': return 'warning';
        case 'REJECTED': return 'destructive';
        default: return 'outline';
    }
}
