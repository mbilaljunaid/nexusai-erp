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
    const [selectedRate, setSelectedRate] = useState<CarrierRate | null>(null);
    const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
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

    // Create rate card mutation
    const createRateMutation = useMutation({
        mutationFn: async (data: Partial<CarrierRate>) => {
            const res = await fetch("/api/carrier-rates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/carrier-rates"] });
            toast({ title: "Success", description: "Rate card created successfully" });
            setIsRateDialogOpen(false);
        },
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
        { key: "rateCardName", label: "Rate Card Name" },
        { key: "serviceLevel", label: "Service Level", render: (val: string) => <Badge>{val}</Badge> },
        { key: "baseRate", label: "Base Rate", render: (val: string) => `$${val}` },
        { key: "perKgRate", label: "Per Kg", render: (val: string) => `$${val}` },
        { key: "perMileRate", label: "Per Mile", render: (val: string) => `$${val}` },
        {
            key: "effectiveDate",
            label: "Effective",
            render: (val: string) => new Date(val).toLocaleDateString(),
        },
        {
            key: "status",
            label: "Status",
            render: (val: string) => (
                <Badge variant={val === "ACTIVE" ? "default" : "secondary"}>{val}</Badge>
            ),
        },
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
                                            {rateCardColumns.map((col) => (
                                                <TableHead key={col.key}>{col.label}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rateCards.slice(0, 5).map((rate) => (
                                            <TableRow key={rate.id}>
                                                {rateCardColumns.map((col) => (
                                                    <TableCell key={col.key}>
                                                        {col.render ? col.render(rate[col.key as keyof CarrierRate]) : rate[col.key as keyof CarrierRate]}
                                                    </TableCell>
                                                ))}
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
                        <h2 className="text-2xl font-bold">Rate Cards</h2>
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
                                onClick={() => exportToCSV(rateCards, 'carrier_rate_cards')}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                            <Button onClick={() => setIsRateDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Rate Card
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            {loadingRates ? (
                                <p className="text-center py-8 text-muted-foreground">Loading...</p>
                            ) : rateCards.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">No rate cards</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {rateCardColumns.map((col) => (
                                                <TableHead key={col.key}>{col.label}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rateCards.map((rate) => (
                                            <TableRow
                                                key={rate.id}
                                                className="cursor-pointer hover:bg-slate-50"
                                                onClick={() => {
                                                    setSelectedRate(rate);
                                                    setIsRateDialogOpen(true);
                                                }}
                                            >
                                                {rateCardColumns.map((col) => (
                                                    <TableCell key={col.key}>
                                                        {col.render ? col.render(rate[col.key as keyof CarrierRate]) : rate[col.key as keyof CarrierRate]}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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

            {/* Rate Card Dialog - placeholder for create/edit */}
            <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedRate ? "Edit Rate Card" : "Create Rate Card"}</DialogTitle>
                        <DialogDescription>Configure carrier pricing structure</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">Rate card form implementation pending</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRateDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
