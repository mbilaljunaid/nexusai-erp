import { useState } from "react";
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
import { Plus, Trash2, Save, ArrowLeft, Calculator, Network } from "lucide-react";
import { APInvoiceDistributions } from "./APInvoiceDistributions";

export default function APInvoiceEntry() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
    const [selectedLineForDistributions, setSelectedLineForDistributions] = useState<number | null>(null);

    const { data: items } = useQuery({
        queryKey: ["/api/mdm/items"],
        queryFn: () => fetch("/api/mdm/items").then(r => r.json()),
    });

    const [header, setHeader] = useState({
        supplierId: "",
        invoiceNumber: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        invoiceType: "STANDARD",
        invoiceAmount: "",
        invoiceCurrencyCode: "USD",
        description: "",
        paymentTerms: "Net 30",
        businessUnitId: "",
        legalEntityId: "",
        glDate: new Date().toISOString().split("T")[0],
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
        taxClassificationCode: "EXEMPT",
        trackAsAssetFlag: false
    }]);

    const handlePOSelection = async (poId: string) => {
        if (!poId || poId === "none") return;

        const po = purchaseOrders?.find((p: any) => p.id === poId);
        if (po) {
            setHeader({ ...header, supplierId: po.supplierId, invoiceAmount: po.totalAmount || header.invoiceAmount });

            try {
                const res = await fetch(`/api/scm/procurement/purchase-orders/${poId}/lines`);
                if (res.ok) {
                    const poLines = await res.json();
                    if (poLines && poLines.length > 0) {
                        setLines(poLines.map((l: any, i: number): InvoiceLine => ({
                            lineNumber: i + 1,
                            lineType: "ITEM",
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
                console.error("Failed to fetch PO lines", err);
            }
        }
    };

    const { data: suppliers } = useQuery({
        queryKey: ["/api/ap/suppliers"],
        queryFn: api.ap.suppliers.list,
    });

    const { data: purchaseOrders } = useQuery({
        queryKey: ["/api/scm/procurement/purchase-orders"],
        queryFn: () => fetch("/api/scm/procurement/purchase-orders").then(r => r.json()),
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

    const handleLineChange = (index: number, field: string, value: string) => {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setLines(newLines);
    };

    const handleSave = () => {
        if (!header.supplierId || !header.invoiceNumber || !header.invoiceAmount) {
            toast({ title: "Validation Error", description: "Supplier, Invoice Number, and Amount are required.", variant: "destructive" });
            return;
        }

        const payload = {
            header: {
                ...header,
                invoiceDate: new Date(header.invoiceDate).toISOString()
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
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Header</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Supplier *</Label>
                            <Select value={header.supplierId || undefined} onValueChange={v => setHeader({ ...header, supplierId: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.isArray(suppliers) ? suppliers.filter(s => s && s.id).map((sup: any) => (
                                        <SelectItem key={sup.id} value={sup.id}>{String(sup.name || "Unknown Supplier")}</SelectItem>
                                    )) : null}
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
                            <Input type="date" value={header.invoiceDate} onChange={e => setHeader({ ...header, invoiceDate: e.target.value })} />
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
                            <Label>Currency</Label>
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
                        <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <Input value={header.description} onChange={e => setHeader({ ...header, description: e.target.value })} placeholder="Invoice description..." />
                        </div>
                    </CardContent>
                </Card>

                {/* Advanced Options Toggle */}
                <div className="flex justify-end">
                    <Button variant="link" onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}>
                        {advancedOptionsOpen ? "Hide Advanced Options" : "Show Advanced Options"}
                    </Button>
                </div>

                {advancedOptionsOpen && (
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-md">Advanced Enterprise Options</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Business Unit</Label>
                                <Select value={header.businessUnitId} onValueChange={v => setHeader({ ...header, businessUnitId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select BU..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BU_US">US Operations</SelectItem>
                                        <SelectItem value="BU_EU">EU Operations</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Legal Entity</Label>
                                <Select value={header.legalEntityId} onValueChange={v => setHeader({ ...header, legalEntityId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select LE..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LE_1">NexusAI Inc.</SelectItem>
                                        <SelectItem value="LE_2">NexusAI Ltd.</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Control Amount</Label>
                                <Input type="number" step="0.01" value={header.controlAmount} onChange={e => setHeader({ ...header, controlAmount: e.target.value })} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>GL Date</Label>
                                <Input type="date" value={header.glDate} onChange={e => setHeader({ ...header, glDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Terms Date</Label>
                                <Input type="date" value={header.termsDate} onChange={e => setHeader({ ...header, termsDate: e.target.value })} />
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                    <CardContent>
                        <div className="space-y-4">
                            {lines.map((line, index) => (
                                <div key={index} className="flex items-end gap-4 p-4 border rounded-lg bg-slate-50">
                                    <div className="w-12 text-center text-sm font-medium text-muted-foreground pb-2">
                                        #{line.lineNumber}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>Line Type</Label>
                                        <Select value={line.lineType} onValueChange={v => handleLineChange(index, "lineType", v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ITEM">Item</SelectItem>
                                                <SelectItem value="FREIGHT">Freight</SelectItem>
                                                <SelectItem value="TAX">Tax</SelectItem>
                                                <SelectItem value="MISC">Miscellaneous</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {line.lineType === 'ITEM' && (
                                        <div className="flex-[1.5] space-y-2">
                                            <Label>Item Number</Label>
                                            <Select value={line.itemId || undefined} onValueChange={(v) => {
                                                const selectedItem = items?.find((i: any) => i.id === v);
                                                handleLineChange(index, "itemId", v);
                                                if (selectedItem) {
                                                    handleLineChange(index, "description", selectedItem.name || selectedItem.description || "");
                                                }
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Item" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {Array.isArray(items) ? items.map((item: any) => (
                                                        <SelectItem key={item.id} value={item.id}>{item.itemNumber || item.name}</SelectItem>
                                                    )) : null}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className={line.lineType === 'ITEM' ? "flex-1 space-y-2" : "flex-[2.5] space-y-2"}>
                                        <Label>Description</Label>
                                        <Input value={line.description} onChange={e => handleLineChange(index, "description", e.target.value)} placeholder="Line description..." />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>Tax Classification</Label>
                                        <Select value={line.taxClassificationCode} onValueChange={v => handleLineChange(index, "taxClassificationCode", v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="STANDARD_20">Standard (20%)</SelectItem>
                                                <SelectItem value="REDUCED_5">Reduced (5%)</SelectItem>
                                                <SelectItem value="EXEMPT">Exempt (0%)</SelectItem>
                                                <SelectItem value="ZERO">Zero-Rated</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>Match to PO</Label>
                                        <div className="flex gap-2">
                                            <Select value={(line.poHeaderId === "none" ? undefined : line.poHeaderId) || undefined} onValueChange={v => handleLineChange(index, "poHeaderId", v)}>
                                                <SelectTrigger className="flex-1">
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
                                                placeholder="Line #"
                                                className="w-20"
                                                value={line.poLineId || ""}
                                                onChange={e => handleLineChange(index, "poLineId", e.target.value)}
                                                disabled={!line.poHeaderId || line.poHeaderId === "none"}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 pb-0">
                                        <Button variant="ghost" size="icon" title="View Distributions" onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedLineForDistributions(selectedLineForDistributions === index ? null : index);
                                        }}>
                                            <Network className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => removeLine(index)} disabled={lines.length === 1} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {selectedLineForDistributions === index && (
                                        <div className="pt-0 px-4 pb-4">
                                            <APInvoiceDistributions
                                                invoiceId="draft"
                                                invoiceLineId="draft_line"
                                                lineAmount={parseFloat(line.amount || "0")}
                                                onClose={() => setSelectedLineForDistributions(null)}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
