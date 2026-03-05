import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";

import {
    DollarSign, FileText, Plus, CheckCircle2, AlertCircle,
    TrendingUp, Upload, Download, Filter
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface FreightCharge {
    id: string;
    shipmentId: string;
    chargeType: string;
    plannedAmount: string;
    actualAmount?: string;
    currency: string;
    status: "PLANNED" | "ACCRUED" | "MATCHED" | "DISPUTED" | "PAID";
    glPosted: boolean;
    glJournalId?: string;
    createdAt: string;
    varianceAmount?: string;
}

interface GLJournal {
    id: string;
    source: string;
    category: string;
    description: string;
    status: "Draft" | "Posted";
    totalDebit: string;
    totalCredit: string;
    createdAt: string;
}

export default function FreightAccountingWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Form state for new charge
    const [newCharge, setNewCharge] = useState({
        shipmentId: "",
        chargeType: "BASE_FREIGHT",
        plannedAmount: "",
        currency: "USD"
    });

    // Fetch freight charges
    const { data: charges = [], isLoading: loadingCharges } = useQuery<FreightCharge[]>({
        queryKey: ["/api/freight/charges", selectedStatus],
        queryFn: async () => {
            const params = selectedStatus !== "all" ? `?status=${selectedStatus}` : "";
            const res = await fetch(`/api/freight/charges${params}`);
            if (!res.ok) throw new Error("Failed to fetch freight charges");
            return res.json();
        }
    });

    // Fetch accrued liability
    const { data: liability } = useQuery<{ total: number }>({
        queryKey: ["/api/freight/liability"],
        queryFn: async () => {
            const res = await fetch("/api/freight/liability");
            if (!res.ok) throw new Error("Failed to fetch liability");
            return res.json();
        }
    });

    // Fetch recent GL journals
    const { data: journals = [] } = useQuery<GLJournal[]>({
        queryKey: ["/api/gl/journals"],
        queryFn: async () => {
            const res = await fetch("/api/gl/journals?source=Transportation&limit=10");
            if (!res.ok) throw new Error("Failed to fetch GL journals");
            return res.json();
        }
    });

    // Create charge mutation
    const createChargeMutation = useMutation({
        mutationFn: async (data: typeof newCharge) => {
            const res = await fetch("/api/freight/charges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create charge");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/freight/charges"] });
            setIsCreateOpen(false);
            setNewCharge({ shipmentId: "", chargeType: "BASE_FREIGHT", plannedAmount: "", currency: "USD" });
            toast({ title: "Freight Charge Created", description: "Charge has been added successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to create freight charge.", variant: "destructive" });
        }
    });

    // Generate accrual journal mutation
    const generateAccrualMutation = useMutation({
        mutationFn: async (chargeId: string) => {
            const res = await fetch(`/api/freight/charges/${chargeId}/accrue`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to generate accrual");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/freight/charges"] });
            queryClient.invalidateQueries({ queryKey: ["/api/freight/liability"] });
            queryClient.invalidateQueries({ queryKey: ["/api/gl/journals"] });
            toast({ title: "Accrual Generated", description: "GL journal created successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to generate accrual journal.", variant: "destructive" });
        }
    });

    // Batch post mutation
    const batchPostMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/freight/batch-post", {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to batch post");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/freight/charges"] });
            queryClient.invalidateQueries({ queryKey: ["/api/gl/journals"] });
            toast({
                title: "Batch Posted",
                description: `Successfully posted ${data.success || 0} charges to GL.`
            });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to batch post charges.", variant: "destructive" });
        }
    });

    const handleCreateCharge = () => {
        if (!newCharge.shipmentId || !newCharge.plannedAmount) {
            toast({ title: "Validation Error", description: "Please fill all required fields.", variant: "destructive" });
            return;
        }
        createChargeMutation.mutate(newCharge);
    };

    // Filter charges
    const filteredCharges = charges.filter(charge => {
        const matchesStatus = selectedStatus === "all" || charge.status === selectedStatus;
        const matchesSearch = charge.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            charge.chargeType.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const unpostedCount = charges.filter(c => !c.glPosted && (c.status === "ACCRUED" || c.status === "MATCHED")).length;

    return (
        <StandardPage title="Freight Accounting Workbench">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>

                    <p className="text-muted-foreground mt-1">Manage freight costs, accruals, and GL integration</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Charge
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Freight Charge</DialogTitle>
                                <DialogDescription>Add a new freight charge to a shipment</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="shipmentId">Shipment ID *</Label>
                                    <Input
                                        id="shipmentId"
                                        placeholder="e.g. SHP-001"
                                        value={newCharge.shipmentId}
                                        onChange={(e) => setNewCharge({ ...newCharge, shipmentId: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="chargeType">Charge Type *</Label>
                                    <Select value={newCharge.chargeType} onValueChange={(v) => setNewCharge({ ...newCharge, chargeType: v })}>
                                        <SelectTrigger id="chargeType">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BASE_FREIGHT">Base Freight</SelectItem>
                                            <SelectItem value="FUEL_SURCHARGE">Fuel Surcharge</SelectItem>
                                            <SelectItem value="ACCESSORIAL">Accessorial Fees</SelectItem>
                                            <SelectItem value="DETENTION">Detention</SelectItem>
                                            <SelectItem value="STORAGE">Storage</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="plannedAmount">Planned Amount *</Label>
                                    <Input
                                        id="plannedAmount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={newCharge.plannedAmount}
                                        onChange={(e) => setNewCharge({ ...newCharge, plannedAmount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select value={newCharge.currency} onValueChange={(v) => setNewCharge({ ...newCharge, currency: v })}>
                                        <SelectTrigger id="currency">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateCharge} disabled={createChargeMutation.isPending}>
                                    {createChargeMutation.isPending ? "Creating..." : "Create Charge"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
                        <FileText className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{charges.length}</div>
                        <p className="text-xs text-muted-foreground">All freight charges</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accrued Liability</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(liability?.total || 0)}</div>
                        <p className="text-xs text-muted-foreground">Outstanding accruals</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending GL Post</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{unpostedCount}</div>
                        <p className="text-xs text-muted-foreground">Awaiting journal entry</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">GL Journals</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{journals.length}</div>
                        <p className="text-xs text-muted-foreground">Recent accrual entries</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="charges" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="charges">Freight Charges</TabsTrigger>
                    <TabsTrigger value="journals">GL Journals</TabsTrigger>
                    <TabsTrigger value="batch">Batch Operations</TabsTrigger>
                </TabsList>

                {/* Charges Tab */}
                <TabsContent value="charges" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Freight Charges</CardTitle>
                                    <CardDescription>View and manage all freight cost allocations</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative max-w-sm">
                                        <Input
                                            placeholder="Search by Shipment ID..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8"
                                        />
                                        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="PLANNED">Planned</SelectItem>
                                            <SelectItem value="ACCRUED">Accrued</SelectItem>
                                            <SelectItem value="MATCHED">Matched</SelectItem>
                                            <SelectItem value="DISPUTED">Disputed</SelectItem>
                                            <SelectItem value="PAID">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingCharges ? (
                                <p className="text-center py-8 text-muted-foreground">Loading charges...</p>
                            ) : filteredCharges.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">No freight charges found</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Shipment ID</TableHead>
                                            <TableHead>Charge Type</TableHead>
                                            <TableHead className="text-right">Planned</TableHead>
                                            <TableHead className="text-right">Actual</TableHead>
                                            <TableHead className="text-right">Variance</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>GL Posted</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCharges.map((charge) => (
                                            <TableRow key={charge.id}>
                                                <TableCell className="font-medium">{charge.shipmentId}</TableCell>
                                                <TableCell>
                                                    <span className="text-sm">{charge.chargeType.replace(/_/g, " ")}</span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {charge.currency} {formatCurrency(parseFloat(charge.plannedAmount)).replace('$', '')}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {charge.actualAmount ? `${charge.currency} ${formatCurrency(parseFloat(charge.actualAmount)).replace('$', '')}` : "-"}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {charge.varianceAmount ? (
                                                        <span className={parseFloat(charge.varianceAmount) > 0 ? "text-rose-600" : "text-emerald-600"}>
                                                            {parseFloat(charge.varianceAmount) > 0 ? "+" : ""}
                                                            {formatCurrency(parseFloat(charge.varianceAmount)).replace('$', '')}
                                                        </span>
                                                    ) : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        charge.status === "PAID" ? "default" :
                                                            charge.status === "MATCHED" ? "secondary" :
                                                                charge.status === "DISPUTED" ? "destructive" : "outline"
                                                    }>
                                                        {charge.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {charge.glPosted ? (
                                                        <div className="flex items-center gap-1 text-emerald-600">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            <span className="text-xs">{charge.glJournalId}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Not posted</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {!charge.glPosted && (charge.status === "PLANNED" || charge.status === "MATCHED") && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => generateAccrualMutation.mutate(charge.id)}
                                                            disabled={generateAccrualMutation.isPending}
                                                        >
                                                            <Upload className="h-3 w-3 mr-1" />
                                                            Accrue
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* GL Journals Tab */}
                <TabsContent value="journals" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent GL Journals</CardTitle>
                            <CardDescription>Freight accrual journal entries</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {journals.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">No GL journals found</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Journal ID</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Debit</TableHead>
                                            <TableHead className="text-right">Credit</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {journals.map((journal) => (
                                            <TableRow key={journal.id}>
                                                <TableCell className="font-medium font-mono text-sm">{journal.id}</TableCell>
                                                <TableCell className="max-w-md truncate">{journal.description}</TableCell>
                                                <TableCell className="text-right font-mono">{formatCurrency(parseFloat(journal.totalDebit))}</TableCell>
                                                <TableCell className="text-right font-mono">{formatCurrency(parseFloat(journal.totalCredit))}</TableCell>
                                                <TableCell>
                                                    <Badge variant={journal.status === "Posted" ? "default" : "secondary"}>
                                                        {journal.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(journal.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Batch Operations Tab */}
                <TabsContent value="batch" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Batch Operations</CardTitle>
                            <CardDescription>Post multiple charges to GL at once</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-blue-900">Batch Post Freight Charges</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            This will automatically generate GL accrual journals for all matched and accrued charges
                                            that haven't been posted yet, then post them to the General Ledger.
                                        </p>
                                        <div className="mt-3 flex items-center gap-4">
                                            <div className="text-sm">
                                                <span className="font-semibold text-blue-900">{unpostedCount}</span>
                                                <span className="text-blue-700"> charges ready to post</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    This action will create journal entries and update charge statuses
                                </div>
                                <Button
                                    onClick={() => batchPostMutation.mutate()}
                                    disabled={batchPostMutation.isPending || unpostedCount === 0}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {batchPostMutation.isPending ? "Processing..." : `Post ${unpostedCount} Charges`}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
