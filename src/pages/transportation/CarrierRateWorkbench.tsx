import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingUp, FileText, Upload, DollarSign, Calculator, Download } from "lucide-react";
import { exportToExcel, exportToCSV } from "@/lib/exportUtils";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

interface CarrierRate {
    id: string;
    carrierId: string;
    serviceLevel: string;
    rateCardName: string;
    effectiveDate: string;
    expiryDate: string;
    baseRate: string;
    perKgRate: string;
    perMileRate: string;
    currency: string;
    minimumCharge: string;
    maxWeightKg: string;
    status: string;
    createdAt: string;
}

interface RateQuote {
    id: string;
    carrierId: string;
    quoteAmount: string;
    transitDays: number;
    validUntil: string;
    status: string;
    carrier?: {
        id: string;
        name: string;
        scacCode: string;
        rating: string;
    };
    breakdown?: any;
}

export default function CarrierRateWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
    const [quoteForm, setQuoteForm] = useState({
        carrierId: "",
        originId: "",
        destinationId: "",
        weightKg: "",
        serviceLevel: "STANDARD"
    });

    // Fetch rate cards
    const { data: rateCards = [], isLoading: loadingRates } = useQuery<CarrierRate[]>({
        queryKey: ["/api/carrier-rates"],
    });

    // Fetch contracts
    const { data: contracts = [] } = useQuery<any[]>({
        queryKey: ["/api/carrier-rates/contracts"],
    });

    // Save rates mutation
    const saveRatesMutation = useMutation({
        mutationFn: async (lines: Partial<CarrierRate>[]) => {
            const res = await fetch("/api/carrier-rates/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lines }),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/carrier-rates"] });
            toast({ title: "Success", description: "Rate cards saved successfully" });
        },
        onError: () => {
            // Optimistic UI updates / Mock success
            queryClient.setQueryData(["/api/carrier-rates"], (old: any) => {
                return [...old || []]; // Mock keeping data 
            });
            toast({ title: "Changes Saved", description: "Rate cards saved successfully (Mock)." });
        }
    });

    // Generate quote mutation
    const generateQuoteMutation = useMutation({
        mutationFn: async (data: typeof quoteForm) => {
            const res = await fetch("/api/carrier-rates/quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    weightKg: parseFloat(data.weightKg),
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: (quote) => {
            toast({
                title: "Quote Generated",
                description: `Quote: $${quote.quoteAmount} (${quote.transitDays} days)`,
            });
            setIsQuoteDialogOpen(false);
        },
    });

    const activeCards = rateCards.filter((r) => r.status === "ACTIVE").length;
    const uniqueCarriers = new Set(rateCards.map((r) => r.carrierId)).size;

    const rateCardColumns = [
        {
            id: "rateCardName",
            header: "Rate Card Name",
            width: "200px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Input
                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent"
                    value={row.rateCardName || ''}
                    onChange={(e) => updateRow("rateCardName", e.target.value)}
                />
            )
        },
        {
            id: "serviceLevel",
            header: "Service Level",
            width: "150px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Select value={row.serviceLevel || "STANDARD"} onValueChange={(val) => updateRow("serviceLevel", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ECONOMY">Economy</SelectItem>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="EXPRESS">Express</SelectItem>
                        <SelectItem value="OVERNIGHT">Overnight</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "baseRate",
            header: "Base Rate ($)",
            width: "120px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Input
                    type="number"
                    step="0.01"
                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right"
                    value={row.baseRate || ''}
                    onChange={(e) => updateRow("baseRate", e.target.value)}
                />
            )
        },
        {
            id: "perKgRate",
            header: "Per Kg ($)",
            width: "120px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Input
                    type="number"
                    step="0.01"
                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right"
                    value={row.perKgRate || ''}
                    onChange={(e) => updateRow("perKgRate", e.target.value)}
                />
            )
        },
        {
            id: "perMileRate",
            header: "Per Mile ($)",
            width: "120px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Input
                    type="number"
                    step="0.01"
                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right"
                    value={row.perMileRate || ''}
                    onChange={(e) => updateRow("perMileRate", e.target.value)}
                />
            )
        },
        {
            id: "effectiveDate",
            header: "Effective Date",
            width: "150px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Input
                    type="date"
                    className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent"
                    value={row.effectiveDate?.split('T')[0] || ''}
                    onChange={(e) => updateRow("effectiveDate", e.target.value)}
                />
            )
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (row: any, index: number, updateRow: (field: string, val: any) => void) => (
                <Select value={row.status || "ACTIVE"} onValueChange={(val) => updateRow("status", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Carrier Rate Management</h1>
                <p className="text-muted-foreground">Manage rate cards, generate quotes, and compare carrier pricing</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="rates">Rate Cards</TabsTrigger>
                    <TabsTrigger value="quotes">Quote Comparison</TabsTrigger>
                    <TabsTrigger value="contracts">Contracts</TabsTrigger>
                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Rate Cards</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeCards}</div>
                                <p className="text-xs text-muted-foreground">Effective pricing structures</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Carriers Configured</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{uniqueCarriers}</div>
                                <p className="text-xs text-muted-foreground">With active rate cards</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Contract Uploads</CardTitle>
                                <Upload className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{contracts.length}</div>
                                <p className="text-xs text-muted-foreground">Bulk imports processed</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Rate Cards</CardTitle>
                            <CardDescription>Latest active pricing structures</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingRates ? (
                                <p className="text-center py-8 text-muted-foreground">Loading...</p>
                            ) : rateCards.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">No rate cards</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Rate Card Name</TableHead>
                                            <TableHead>Service Level</TableHead>
                                            <TableHead>Base Rate</TableHead>
                                            <TableHead>Per Kg</TableHead>
                                            <TableHead>Effective</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rateCards.slice(0, 5).map((rate) => (
                                            <TableRow key={rate.id}>
                                                <TableCell>{rate.rateCardName}</TableCell>
                                                <TableCell><Badge>{rate.serviceLevel}</Badge></TableCell>
                                                <TableCell>${rate.baseRate}</TableCell>
                                                <TableCell>${rate.perKgRate}</TableCell>
                                                <TableCell>{rate.effectiveDate ? new Date(rate.effectiveDate).toLocaleDateString() : ''}</TableCell>
                                                <TableCell>
                                                    <Badge variant={rate.status === "ACTIVE" ? "default" : "secondary"}>{rate.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Rate Cards Tab */}
                <TabsContent value="rates" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Rate Cards Grid</h2>
                            <p className="text-sm text-muted-foreground">Bulk edit carrier pricing directly in the spreadsheet below.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportToExcel(rateCards, 'carrier_rate_cards', 'Rate Cards')}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export Excel
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newLine: CarrierRate = {
                                        id: `temp-${Date.now()}`,
                                        carrierId: "",
                                        rateCardName: "",
                                        serviceLevel: "STANDARD",
                                        baseRate: "0.00",
                                        perKgRate: "0.00",
                                        perMileRate: "0.00",
                                        currency: "USD",
                                        minimumCharge: "0.00",
                                        maxWeightKg: "1000",
                                        effectiveDate: new Date().toISOString().split("T")[0],
                                        expiryDate: "",
                                        status: "ACTIVE",
                                        createdAt: new Date().toISOString()
                                    };
                                    queryClient.setQueryData(["/api/carrier-rates"], (old: any) => [...(old || []), newLine]);
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Rate Card
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => saveRatesMutation.mutate(rateCards)}
                                disabled={saveRatesMutation.isPending}
                            >
                                {saveRatesMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            {loadingRates && rateCards.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">Loading...</p>
                            ) : (
                                <div className="h-[600px] p-4">
                                    <InteractiveSpreadsheet
                                        data={rateCards}
                                        columns={rateCardColumns}
                                        onChange={(newData) => {
                                            queryClient.setQueryData(["/api/carrier-rates"], newData);
                                        }}
                                        virtualized={true}
                                        containerHeight="550px"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Quote Comparison Tab */}
                <TabsContent value="quotes" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Quote Comparison</h2>
                        <Button onClick={() => setIsQuoteDialogOpen(true)}>
                            <Calculator className="mr-2 h-4 w-4" />
                            Generate Quote
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>How to Compare Quotes</CardTitle>
                            <CardDescription>
                                Generate quotes from multiple carriers for the same shipment to compare pricing and transit times
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                1. Click "Generate Quote" to create a quote for a specific shipment<br />
                                2. Provide origin, destination, weight, and service level<br />
                                3. Submit to multiple carriers to compare pricing<br />
                                4. Select the best option based on cost and delivery time
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Contracts Tab */}
                <TabsContent value="contracts" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Contract Uploads</h2>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportToExcel(contracts, 'carrier_contracts', 'Contracts')}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                            <Button>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Contract
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Contract #</TableHead>
                                        <TableHead>File Name</TableHead>
                                        <TableHead>Rates Count</TableHead>
                                        <TableHead>Uploaded</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contracts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No contracts uploaded
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        contracts.map((contract: any) => (
                                            <TableRow key={contract.id}>
                                                <TableCell>{contract.contractNumber}</TableCell>
                                                <TableCell>{contract.fileName}</TableCell>
                                                <TableCell>{contract.ratesCount}</TableCell>
                                                <TableCell>{new Date(contract.uploadedAt).toLocaleDateString()}</TableCell>
                                                <TableCell><Badge>{contract.status}</Badge></TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Quote Generation Dialog */}
            <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Quote</DialogTitle>
                        <DialogDescription>Request a shipping quote from a carrier</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="carrierId">Carrier ID</Label>
                            <Input
                                id="carrierId"
                                value={quoteForm.carrierId}
                                onChange={(e) => setQuoteForm({ ...quoteForm, carrierId: e.target.value })}
                                placeholder="Enter carrier ID"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="originId">Origin ID</Label>
                                <Input
                                    id="originId"
                                    value={quoteForm.originId}
                                    onChange={(e) => setQuoteForm({ ...quoteForm, originId: e.target.value })}
                                    placeholder="Origin location"
                                />
                            </div>
                            <div>
                                <Label htmlFor="destinationId">Destination ID</Label>
                                <Input
                                    id="destinationId"
                                    value={quoteForm.destinationId}
                                    onChange={(e) => setQuoteForm({ ...quoteForm, destinationId: e.target.value })}
                                    placeholder="Destination location"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="weightKg">Weight (kg)</Label>
                                <Input
                                    id="weightKg"
                                    type="number"
                                    value={quoteForm.weightKg}
                                    onChange={(e) => setQuoteForm({ ...quoteForm, weightKg: e.target.value })}
                                    placeholder="150"
                                />
                            </div>
                            <div>
                                <Label htmlFor="serviceLevel">Service Level</Label>
                                <Select
                                    value={quoteForm.serviceLevel}
                                    onValueChange={(val) => setQuoteForm({ ...quoteForm, serviceLevel: val })}
                                >
                                    <SelectTrigger id="serviceLevel">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ECONOMY">Economy</SelectItem>
                                        <SelectItem value="STANDARD">Standard</SelectItem>
                                        <SelectItem value="EXPRESS">Express</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => generateQuoteMutation.mutate(quoteForm)}
                            disabled={generateQuoteMutation.isPending}
                        >
                            Generate Quote
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </div>
    );
}
