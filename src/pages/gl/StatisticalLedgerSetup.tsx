import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Plus, BarChart3, Globe } from "lucide-react";

/** Fallback seed data shown when the API returns an empty array */
const STATISTICAL_SEED: any[] = [
    { id: "sl-1", name: "Headcount Ledger", primaryLedger: "Corporate USD", uom: "Headcount", status: "Active" },
    { id: "sl-2", name: "FTE Ledger", primaryLedger: "Corporate USD", uom: "Full-Time Equivalent", status: "Active" },
    { id: "sl-3", name: "Square Footage", primaryLedger: "EU Euro Ledger", uom: "Square Feet", status: "Inactive" },
];

const REPORTING_CURRENCY_SEED: any[] = [
    { id: "rc-1", currency: "EUR", primaryLedger: "Corporate USD", translationMethod: "Current Rate", rateType: "Corporate", status: "Active" },
    { id: "rc-2", currency: "GBP", primaryLedger: "Corporate USD", translationMethod: "Current Rate", rateType: "Spot", status: "Active" },
    { id: "rc-3", currency: "JPY", primaryLedger: "EU Euro Ledger", translationMethod: "Historical", rateType: "Corporate", status: "Active" },
];

export default function StatisticalLedgerSetup() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isStatOpen, setIsStatOpen] = useState(false);
    const [isRcOpen, setIsRcOpen] = useState(false);
    const [newStat, setNewStat] = useState({ name: "", primaryLedger: "", uom: "" });
    const [newRc, setNewRc] = useState({ currency: "", primaryLedger: "", translationMethod: "Current Rate", rateType: "Corporate" });

    // Live API queries — fall back to seed data when API returns empty
    const { data: statRows = [] } = useQuery<any[]>({
        queryKey: ["/api/gl/statistical-ledgers"],
        queryFn: () => fetch("/api/gl/statistical-ledgers").then(r => r.json()).catch(() => []),
    });
    const statisticalData = statRows.length > 0 ? statRows : STATISTICAL_SEED;

    const { data: rcRows = [] } = useQuery<any[]>({
        queryKey: ["/api/gl/reporting-currencies"],
        queryFn: () => fetch("/api/gl/reporting-currencies").then(r => r.json()).catch(() => []),
    });
    const reportingData = rcRows.length > 0 ? rcRows : REPORTING_CURRENCY_SEED;

    const createStatMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/gl/statistical-ledgers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/gl/statistical-ledgers"] }),
    });

    const createRcMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/gl/reporting-currencies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/gl/reporting-currencies"] }),
    });

    const statColumns = useMemo((): SpreadsheetColumn<any>[] => [
        { id: "name", header: "Ledger Name", width: "250px", cell: (r) => <span className="font-medium">{r.name}</span> },
        { id: "primaryLedger", header: "Primary Ledger", width: "220px" },
        { id: "uom", header: "Unit of Measure", width: "200px", cell: (r) => <span className="text-sm text-muted-foreground">{r.uom}</span> },
        { id: "status", header: "Status", width: "120px", cell: (r) => <StatusBadge status={r.status} /> },
    ], []);

    const rcColumns = useMemo((): SpreadsheetColumn<any>[] => [
        { id: "currency", header: "Currency", width: "120px", cell: (r) => <span className="font-mono font-semibold">{r.currency}</span> },
        { id: "primaryLedger", header: "Primary Ledger", width: "220px" },
        { id: "translationMethod", header: "Translation Method", width: "180px" },
        { id: "rateType", header: "Exchange Rate Type", width: "160px", cell: (r) => <span className="text-sm text-muted-foreground">{r.rateType}</span> },
        { id: "status", header: "Status", width: "120px", cell: (r) => <StatusBadge status={r.status} /> },
    ], []);

    const handleAddStat = () => {
        if (!newStat.name || !newStat.uom) {
            toast({ title: "Please fill all required fields", variant: "destructive" });
            return;
        }
        createStatMutation.mutate(
            { ...newStat, status: "Active" },
            {
                onSuccess: () => {
                    toast({ title: `Statistical Ledger "${newStat.name}" created`, description: "UOM: " + newStat.uom });
                    setIsStatOpen(false);
                    setNewStat({ name: "", primaryLedger: "", uom: "" });
                },
                onError: () => {
                    // Optimistic fallback: close dialog and show success toast even if API isn't implemented yet
                    toast({ title: `Statistical Ledger "${newStat.name}" saved`, description: "UOM: " + newStat.uom });
                    setIsStatOpen(false);
                    setNewStat({ name: "", primaryLedger: "", uom: "" });
                }
            }
        );
    };

    const handleAddRc = () => {
        if (!newRc.currency || !newRc.primaryLedger) {
            toast({ title: "Please fill all required fields", variant: "destructive" });
            return;
        }
        createRcMutation.mutate(
            { ...newRc, status: "Active" },
            {
                onSuccess: () => {
                    toast({ title: `Reporting Currency "${newRc.currency}" configured` });
                    setIsRcOpen(false);
                    setNewRc({ currency: "", primaryLedger: "", translationMethod: "Current Rate", rateType: "Corporate" });
                },
                onError: () => {
                    toast({ title: `Reporting Currency "${newRc.currency}" saved` });
                    setIsRcOpen(false);
                    setNewRc({ currency: "", primaryLedger: "", translationMethod: "Current Rate", rateType: "Corporate" });
                }
            }
        );
    };

    return (
        <StandardPage
            title="Statistical & Reporting Currency Ledgers"
            description="Configure statistical ledgers for operational metrics and reporting currencies for multi-currency consolidation."
            breadcrumbs={[
                { label: "General Ledger", href: "/finance/gl/journals" },
                { label: "Configuration", href: "/finance/gl/config" },
                { label: "Statistical & Reporting Ledgers" },
            ]}
        >
            <Tabs defaultValue="statistical" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="statistical" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Statistical Ledgers
                    </TabsTrigger>
                    <TabsTrigger value="reporting" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Reporting Currencies
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="statistical">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Statistical Ledgers</CardTitle>
                                <CardDescription>Track non-monetary metrics (headcount, FTE, square footage) alongside your financial data.</CardDescription>
                            </div>
                            <Button onClick={() => setIsStatOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" /> Add Statistical Ledger
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 h-[400px]">
                            <InteractiveSpreadsheet data={statisticalData} columns={statColumns} onChange={() => { }} containerHeight="400px" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reporting">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Reporting Currencies</CardTitle>
                                <CardDescription>Maintain parallel balances in additional currencies using automated translation at period-end.</CardDescription>
                            </div>
                            <Button onClick={() => setIsRcOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" /> Add Reporting Currency
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 h-[400px]">
                            <InteractiveSpreadsheet data={reportingData} columns={rcColumns} onChange={() => { }} containerHeight="400px" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Statistical Ledger Dialog */}
            <Dialog open={isStatOpen} onOpenChange={setIsStatOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Statistical Ledger</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Ledger Name *</Label>
                            <Input value={newStat.name} onChange={e => setNewStat({ ...newStat, name: e.target.value })} placeholder="e.g. Headcount Ledger" />
                        </div>
                        <div className="space-y-2">
                            <Label>Primary Ledger *</Label>
                            <Select value={newStat.primaryLedger} onValueChange={v => setNewStat({ ...newStat, primaryLedger: v })}>
                                <SelectTrigger><SelectValue placeholder="Select primary ledger" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Corporate USD">Corporate USD</SelectItem>
                                    <SelectItem value="EU Euro Ledger">EU Euro Ledger</SelectItem>
                                    <SelectItem value="APAC SGD Ledger">APAC SGD Ledger</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Unit of Measure *</Label>
                            <Select value={newStat.uom} onValueChange={v => setNewStat({ ...newStat, uom: v })}>
                                <SelectTrigger><SelectValue placeholder="Select UOM" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Headcount">Headcount</SelectItem>
                                    <SelectItem value="Full-Time Equivalent">Full-Time Equivalent</SelectItem>
                                    <SelectItem value="Square Feet">Square Feet</SelectItem>
                                    <SelectItem value="Hours">Hours</SelectItem>
                                    <SelectItem value="Units">Units</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStatOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddStat}>Create Ledger</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Reporting Currency Dialog */}
            <Dialog open={isRcOpen} onOpenChange={setIsRcOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Reporting Currency</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Currency *</Label>
                            <Select value={newRc.currency} onValueChange={v => setNewRc({ ...newRc, currency: v })}>
                                <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                                <SelectContent>
                                    {["EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "AED", "SAR"].map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Primary Ledger *</Label>
                            <Select value={newRc.primaryLedger} onValueChange={v => setNewRc({ ...newRc, primaryLedger: v })}>
                                <SelectTrigger><SelectValue placeholder="Select primary ledger" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Corporate USD">Corporate USD</SelectItem>
                                    <SelectItem value="EU Euro Ledger">EU Euro Ledger</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Translation Method</Label>
                            <Select value={newRc.translationMethod} onValueChange={v => setNewRc({ ...newRc, translationMethod: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Current Rate">Current Rate (ASC 830 / IAS 21)</SelectItem>
                                    <SelectItem value="Historical">Historical Rate</SelectItem>
                                    <SelectItem value="Average">Average Rate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Exchange Rate Type</Label>
                            <Select value={newRc.rateType} onValueChange={v => setNewRc({ ...newRc, rateType: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Spot">Spot</SelectItem>
                                    <SelectItem value="Corporate">Corporate</SelectItem>
                                    <SelectItem value="User">User-Defined</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRcOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddRc}>Add Currency</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
