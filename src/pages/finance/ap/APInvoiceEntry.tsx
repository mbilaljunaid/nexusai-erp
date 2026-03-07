import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardPage } from "@/components/layout/StandardPage";
import { Plus, Trash2, Save, ArrowLeft, Calculator, Network, Building2 } from "lucide-react";
import { APInvoiceDistributions } from "./APInvoiceDistributions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DatePicker } from '@/components/ui/DatePicker';
import { Checkbox } from "@/components/ui/checkbox";
function useActiveBu() {
    return useMemo(() => ({
        id: localStorage.getItem("nexus_active_bu") || null,
        name: localStorage.getItem("nexus_active_bu_name") || localStorage.getItem("nexus_active_bu") || "All Business Units"
    }), []);
}

export default function APInvoiceEntry() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const activeBu = useActiveBu();

    const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
    const [selectedLineForDistributions, setSelectedLineForDistributions] = useState<number | null>(null);

    const { data: items } = useQuery<any>({
        queryKey: ["/api/mdm/items"],
        queryFn: () => fetch("/api/mdm/items").then(r => r.json()),
    });

    const [header, setHeader] = useState({
        supplierId: "",
        supplierSiteId: "",
        invoiceNumber: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        invoiceType: "STANDARD",
        invoiceAmount: "",
        invoiceCurrencyCode: "USD",
        paymentCurrencyCode: "USD",
        exchangeRate: "1.0",
        payGroupId: "",
        description: "",
        paymentTerms: "Net 30",
        businessUnitId: activeBu.id || "",
        transactionDate: new Date().toISOString().split("T")[0],
        termsDate: new Date().toISOString().split("T")[0],
        controlAmount: ""
    });

    interface InvoiceLine {
        lineNumber: number;
        lineType: string;
        amount: string;
        description: string;
        poHeaderId: string;
        poLineId: string;
        itemId: string;
        quantityInvoiced: string;
        unitPrice: string;
        uom: string;
        taxClassificationCode: string;
        trackAsAssetFlag: boolean;
    }

    const [lines, setLines] = useState<InvoiceLine[]>([{
        lineNumber: 1,
        lineType: "ITEM",
        amount: "",
        description: "",
        poHeaderId: "",
        poLineId: "",
        itemId: "",
        quantityInvoiced: "",
        unitPrice: "",
        uom: "EA",
        taxClassificationCode: "EXEMPT",
        trackAsAssetFlag: false
    }]);

    const handlePOSelection = async (poId: string) => {
        if (!poId || poId === "none") return;

        const po = purchaseOrders?.find((p: any) => p.id === poId);
        if (po) {
            setHeader({ ...header, supplierId: po.supplierId, supplierSiteId: "", invoiceAmount: po.totalAmount || header.invoiceAmount });

            try {
                const res = await fetch(`/api/scm/procurement/purchase-orders/${poId}/lines`);
                if (res.ok) {
                    const poLines = await res.json();
                    if (poLines && poLines.length > 0) {
                        setLines(poLines.map((l: any, i: number): InvoiceLine => ({
                            lineNumber: i + 1,
                            lineType: "ITEM",
                            quantityInvoiced: l.quantity ? String(l.quantity) : "",
                            unitPrice: l.unitPrice ? String(l.unitPrice) : "",
                            uom: "EA",
                            amount: l.unitPrice && l.quantity ? (parseFloat(l.unitPrice) * parseFloat(l.quantity)).toString() : "0",
                            description: l.description || "PO Line",
                            poHeaderId: poId,
                            poLineId: l.id || "",
                            itemId: l.itemId || "",
                            taxClassificationCode: "EXEMPT",
                            trackAsAssetFlag: false
                        })));
                    }
                }
            } catch (err) {
            }
        }
    };

    const { data: suppliers } = useQuery<any>({
        queryKey: ["/api/ap/suppliers"],
        queryFn: api.ap.suppliers.list,
    });

    const { data: supplierSites } = useQuery<any>({
        queryKey: ["/api/finance/ap/supplier-sites", header.supplierId],
        queryFn: () => fetch(`/api/finance/ap/suppliers/${header.supplierId}/sites`).then(r => r.json()),
        enabled: !!header.supplierId,
    });

    const { data: purchaseOrders } = useQuery<any>({
        queryKey: ["/api/scm/procurement/purchase-orders"],
        queryFn: () => fetch("/api/scm/procurement/purchase-orders").then(r => r.json()),
    });

    const { data: payGroups } = useQuery<any>({
        queryKey: ["/api/finance/ap/pay-groups"],
        queryFn: () => fetch("/api/finance/ap/pay-groups").then(r => r.json()),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.ap.invoices.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
            toast({ title: "Invoice created successfully" });
            setLocation("/finance/ap/invoices");
        },
        onError: (error: Error) => {
            toast({ title: "Failed to create invoice", description: error.message, variant: "destructive" });
        }
    });

    const addLine = () => {
        setLines([...lines, {
            lineNumber: lines.length + 1,
            lineType: "ITEM",
            quantityInvoiced: "",
            unitPrice: "",
            uom: "EA",
            amount: "",
            description: "",
            poHeaderId: "",
            poLineId: "",
            itemId: "",
            taxClassificationCode: "EXEMPT",
            trackAsAssetFlag: false
        }]);
    };

    const calculateTax = () => {
        // Assume 5% standard tax on all ITEM lines for demo purposes
        const itemTotal = lines.filter(l => l.lineType === "ITEM").reduce((sum, l) => sum + parseFloat(l.amount || "0"), 0);
        if (itemTotal > 0) {
            const taxAmount = (itemTotal * 0.05).toFixed(2);
            setLines([...lines, {
                lineNumber: lines.length + 1,
                lineType: "TAX",
                quantityInvoiced: "1",
                unitPrice: taxAmount,
                uom: "EA",
                amount: taxAmount,
                description: "Standard Tax (5%)",
                poHeaderId: "",
                poLineId: "",
                itemId: "",
                taxClassificationCode: "STANDARD_20",
                trackAsAssetFlag: false
            }]);
            toast({ title: "Tax Calculated", description: "Added 5% standard tax line." });
        } else {
            toast({ title: "No Items", description: "Add ITEM lines first to calculate tax", variant: "destructive" });
        }
    };

    const removeLine = (index: number) => {
        setLines(lines.filter((_, i) => i !== index).map((l, i) => ({ ...l, lineNumber: i + 1 })));
    };

    const handleLineChange = (index: number, updates: Partial<InvoiceLine>) => {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], ...updates };
        setLines(newLines);
    };

    const invoiceColumns: SpreadsheetColumn<InvoiceLine>[] = [
        {
            id: "lineNumber",
            header: "#",
            width: "w-12",
            headerClassName: "text-center",
            cellClassName: "text-center text-muted-foreground font-medium",
            cell: (row) => row.lineNumber
        },
        {
            id: "lineType",
            header: "Line Type",
            width: "w-36",
            cell: (line, index, updateRow) => (
                <Select value={line.lineType} onValueChange={v => updateRow("lineType", v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ITEM">Item</SelectItem>
                        <SelectItem value="FREIGHT">Freight</SelectItem>
                        <SelectItem value="TAX">Tax</SelectItem>
                        <SelectItem value="MISC">Miscellaneous</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "item",
            header: "Item",
            width: "w-48",
            cell: (line, index) => line.lineType === 'ITEM' ? (
                <Select value={line.itemId || undefined} onValueChange={(v) => {
                    const selectedItem = items?.find((i: any) => i.id === v);
                    const updates: Partial<InvoiceLine> = { itemId: v };
                    if (selectedItem) {
                        updates.description = selectedItem.name || selectedItem.description || "";
                        if (selectedItem.primaryUom) updates.uom = selectedItem.primaryUom;
                    }
                    handleLineChange(index, updates);
                }}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Item..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {Array.isArray(items) ? items.map((item: any) => (
                            <SelectItem key={item.id} value={item.id}>{item.itemNumber || item.name}</SelectItem>
                        )) : null}
                    </SelectContent>
                </Select>
            ) : <div className="h-9" />
        },
        {
            id: "description",
            header: "Description",
            width: "min-w-48",
            cell: (line, index, updateRow) => (
                <Input className="h-9" value={line.description} onChange={e => updateRow("description", e.target.value)} placeholder="Description..." />
            )
        },
        {
            id: "qty",
            header: "Qty",
            width: "w-24",
            cell: (line, index) => (
                <Input className="h-9" type="number" step="0.01" value={line.quantityInvoiced} onChange={e => {
                    const qty = e.target.value;
                    const price = line.unitPrice || "0";
                    handleLineChange(index, {
                        quantityInvoiced: qty,
                        amount: (parseFloat(qty || "0") * parseFloat(price)).toFixed(2)
                    });
                }} placeholder="0" />
            )
        },
        {
            id: "uom",
            header: "UOM",
            width: "w-24",
            cell: (line, index, updateRow) => (
                <Input className="h-9 text-center px-1" value={line.uom} onChange={e => updateRow("uom", e.target.value)} placeholder="EA" />
            )
        },
        {
            id: "unitPrice",
            header: "Unit Price",
            width: "w-32",
            cell: (line, index) => (
                <Input className="h-9" type="number" step="0.01" value={line.unitPrice} onChange={e => {
                    const price = e.target.value;
                    const qty = line.quantityInvoiced || "0";
                    handleLineChange(index, {
                        unitPrice: price,
                        amount: (parseFloat(qty) * parseFloat(price || "0")).toFixed(2)
                    });
                }} placeholder="0.00" />
            )
        },
        {
            id: "amount",
            header: "Amount",
            width: "w-32",
            cell: (line, index, updateRow) => (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Input className="h-9 bg-slate-500/10 font-medium text-foreground/90" type="number" step="0.01" value={line.amount} readOnly onChange={e => updateRow("amount", e.target.value)} placeholder="0.00" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Auto-calculated from Qty * Price. Override manually if needed.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
        {
            id: "taxAsset",
            header: "Tax / Asset",
            width: "w-48",
            cell: (line, index, updateRow) => (
                <div className="flex flex-col gap-2">
                    <Select value={line.taxClassificationCode} onValueChange={v => updateRow("taxClassificationCode", v)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="STANDARD_20">Standard (20%)</SelectItem>
                            <SelectItem value="REDUCED_5">Reduced (5%)</SelectItem>
                            <SelectItem value="EXEMPT">Exempt (0%)</SelectItem>
                            <SelectItem value="ZERO">Zero-Rated</SelectItem>
                        </SelectContent>
                    </Select>
                    {line.lineType === 'ITEM' && (
                        <Label className="flex items-center gap-2 text-xs text-muted-foreground px-1 hover:text-foreground dark:text-slate-200 cursor-pointer">
                            <Checkbox className="rounded text-primary focus:ring-primary h-3.5 w-3.5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" checked={line.trackAsAssetFlag} onCheckedChange={c => updateRow("trackAsAssetFlag", !!c)} />
                            Track as Asset
                        </Label>
                    )}
                </div>
            )
        },
        {
            id: "poMatch",
            header: "Match to PO",
            width: "w-56",
            cell: (line, index, updateRow) => (
                <div className="flex gap-2">
                    <Select value={(line.poHeaderId === "none" ? undefined : line.poHeaderId) || undefined} onValueChange={v => updateRow("poHeaderId", v)}>
                        <SelectTrigger className="h-9 flex-1">
                            <SelectValue placeholder="PO" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {Array.isArray(purchaseOrders) ? purchaseOrders.filter((po: any) => po && po.id && (!header.supplierId || po.supplierId === header.supplierId)).map((po: any) => (
                                <SelectItem key={po.id} value={po.id}>{String(po.poNumber)}</SelectItem>
                            )) : null}
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Ln"
                        className="h-9 w-12 px-2 text-center"
                        value={line.poLineId || ""}
                        onChange={e => updateRow("poLineId", e.target.value)}
                        disabled={!line.poHeaderId || line.poHeaderId === "none"}
                    />
                </div>
            )
        },
        {
            id: "actions",
            header: "Actions",
            width: "w-24",
            headerClassName: "text-center",
            cell: (line, index) => (
                <div className="flex justify-center items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground dark:text-slate-200" onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedLineForDistributions(selectedLineForDistributions === index ? null : index);
                                }} aria-label="Network">
                                    <Network className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View Distributions</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground/70 hover:text-red-700 hover:bg-red-500/10" onClick={() => removeLine(index)} disabled={lines.length === 1} aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <Dialog open={selectedLineForDistributions === index} onOpenChange={(open) => {
                        if (!open) setSelectedLineForDistributions(null);
                    }}>
                        <DialogContent className="max-w-5xl">
                            <DialogHeader>
                                <DialogTitle>Line Distributions - Line #{line.lineNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="pt-4">
                                <APInvoiceDistributions
                                    invoiceId="draft"
                                    invoiceLineId="draft_line"
                                    lineAmount={parseFloat(line.amount || "0")}
                                    onClose={() => setSelectedLineForDistributions(null)}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )
        }
    ];

    const handleSave = () => {
        if (!header.businessUnitId || !header.supplierId || !header.invoiceNumber || !header.invoiceAmount) {
            toast({ title: "Validation Error", description: "Business Unit, Supplier, Invoice Number, and Amount are required.", variant: "destructive" });
            return;
        }

        const payload = {
            header: {
                ...header,
                supplierSiteId: header.supplierSiteId ? parseInt(header.supplierSiteId) : undefined, // Backend expects number or undefined
                invoiceDate: new Date(header.invoiceDate).toISOString(),
                transactionDate: header.transactionDate ? new Date(header.transactionDate).toISOString() : undefined,
                termsDate: header.termsDate ? new Date(header.termsDate).toISOString() : undefined,
            },
            lines: lines.map(l => ({ ...l, amount: l.amount || "0" }))
        };

        createMutation.mutate(payload);
    };

    return (
        <StandardPage
            title="Create Invoice"
            description="Enter standard AP invoice details"
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Payable", href: "/finance/ap" },
                { label: "Invoices", href: "/finance/ap/invoices" },
                { label: "New" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setLocation("/finance/ap/invoices")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={createMutation.isPending}>
                        <Save className="mr-2 h-4 w-4" /> {createMutation.isPending ? "Saving..." : "Save Invoice"}
                    </Button>
                </div>
            }
        >
            {/* BU Context Banner */}
            <div className="flex items-center gap-2 px-1 mb-4">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Creating invoice under BU:</span>
                <Badge variant="secondary" className="font-mono text-xs">
                    {header.businessUnitId || "Not Selected"}
                </Badge>
                {!activeBu.id && (
                    <span className="text-xs text-amber-600">(No global BU active — select below)</span>
                )}
            </div>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Header</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Mandatory Business Unit first */}
                        <div className="space-y-2 md:col-span-2">
                            <Label>Business Unit *</Label>
                            <Select value={header.businessUnitId} onValueChange={v => setHeader({ ...header, businessUnitId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select BU..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BU_US">US Operations</SelectItem>
                                    <SelectItem value="BU_EU">EU Operations</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Supplier *</Label>
                            <Select value={header.supplierId || undefined} onValueChange={v => setHeader({ ...header, supplierId: v, supplierSiteId: "" })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.isArray(suppliers) ? suppliers.filter(s => s && s.id).map((sup: any) => (
                                        <SelectItem key={sup.id} value={sup.id.toString()}>{String(sup.name || "Unknown Supplier")}</SelectItem>
                                    )) : null}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Supplier Site *</Label>
                            <Select value={header.supplierSiteId || undefined} onValueChange={v => setHeader({ ...header, supplierSiteId: v })} disabled={!header.supplierId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Site" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.isArray(supplierSites) && supplierSites.length > 0 ? supplierSites.map((site: any) => (
                                        <SelectItem key={site.id} value={site.id.toString()}>{String(site.siteName)}</SelectItem>
                                    )) : (
                                        <SelectItem value="none" disabled>No sites found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Purchase Order Reference</Label>
                            <Select onValueChange={handlePOSelection}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Auto-populate from PO" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {Array.isArray(purchaseOrders) ? purchaseOrders.filter(po => po && po.id && (!header.supplierId || po.supplierId === header.supplierId)).map((po: any) => (
                                        <SelectItem key={po.id} value={po.id}>{String(po.poNumber || po.id)} - ${po.totalAmount}</SelectItem>
                                    )) : null}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Invoice Number *</Label>
                            <Input value={header.invoiceNumber} onChange={e => setHeader({ ...header, invoiceNumber: e.target.value })} placeholder="INV-001" />
                        </div>
                        <div className="space-y-2">
                            <Label>Invoice Date *</Label>
                            <DatePicker value={header.invoiceDate} onChange={v => setHeader({ ...header, invoiceDate: v })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Transaction Date</Label>
                            <DatePicker value={header.transactionDate} onChange={v => setHeader({ ...header, transactionDate: v })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Terms Date</Label>
                            <DatePicker value={header.termsDate} onChange={v => setHeader({ ...header, termsDate: v })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Invoice Type</Label>
                            <Select value={header.invoiceType} onValueChange={v => setHeader({ ...header, invoiceType: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STANDARD">Standard</SelectItem>
                                    <SelectItem value="PREPAYMENT">Prepayment</SelectItem>
                                    <SelectItem value="CREDIT_MEMO">Credit Memo</SelectItem>
                                    <SelectItem value="DEBIT_MEMO">Debit Memo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Total Amount *</Label>
                            <Input type="number" step="0.01" value={header.invoiceAmount} onChange={e => setHeader({ ...header, invoiceAmount: e.target.value })} placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label>Invoice Currency</Label>
                            <Select value={header.invoiceCurrencyCode} onValueChange={v => setHeader({ ...header, invoiceCurrencyCode: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Currency</Label>
                            <Select value={header.paymentCurrencyCode} onValueChange={v => setHeader({ ...header, paymentCurrencyCode: v, exchangeRate: v === header.invoiceCurrencyCode ? "1.0" : header.exchangeRate })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Exchange Rate</Label>
                            <Input
                                type="number"
                                step="0.000001"
                                value={header.exchangeRate}
                                onChange={e => setHeader({ ...header, exchangeRate: e.target.value })}
                                disabled={header.invoiceCurrencyCode === header.paymentCurrencyCode}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Terms</Label>
                            <Select value={header.paymentTerms} onValueChange={v => setHeader({ ...header, paymentTerms: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Immediate">Immediate</SelectItem>
                                    <SelectItem value="Net 15">Net 15</SelectItem>
                                    <SelectItem value="Net 30">Net 30</SelectItem>
                                    <SelectItem value="Net 45">Net 45</SelectItem>
                                    <SelectItem value="Net 60">Net 60</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Pay Group</Label>
                            <Select value={header.payGroupId || undefined} onValueChange={v => setHeader({ ...header, payGroupId: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="System Default" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.isArray(payGroups) ? payGroups.map((pg: any) => (
                                        <SelectItem key={pg.id} value={pg.id.toString()}>{pg.name}</SelectItem>
                                    )) : <SelectItem value="none" disabled>No custom pay groups</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Control Amount</Label>
                            <Input type="number" step="0.01" value={header.controlAmount} onChange={e => setHeader({ ...header, controlAmount: e.target.value })} placeholder="0.00" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <Input value={header.description} onChange={e => setHeader({ ...header, description: e.target.value })} placeholder="Invoice description..." />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Invoice Lines</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={calculateTax}>
                                <Calculator className="mr-2 h-4 w-4" /> Calculate Tax
                            </Button>
                            <Button variant="outline" size="sm" onClick={addLine}>
                                <Plus className="mr-2 h-4 w-4" /> Add Line
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <InteractiveSpreadsheet
                            data={lines}
                            columns={invoiceColumns}
                            onChange={setLines}
                        />
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
