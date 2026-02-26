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
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";

export default function APInvoiceEntry() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [header, setHeader] = useState({
        supplierId: "",
        invoiceNumber: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        invoiceType: "STANDARD",
        invoiceAmount: "",
        invoiceCurrencyCode: "USD",
        description: "",
        paymentTerms: "Net 30"
    });

    const [lines, setLines] = useState([
        { lineNumber: 1, lineType: "ITEM", amount: "", description: "" }
    ]);

    const { data: suppliers } = useQuery({
        queryKey: ["/api/ap/suppliers"],
        queryFn: api.ap.suppliers.list,
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
        setLines([...lines, { lineNumber: lines.length + 1, lineType: "ITEM", amount: "", description: "" }]);
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
                            <Select value={header.supplierId} onValueChange={v => setHeader({ ...header, supplierId: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers?.map((sup: any) => (
                                        <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
                                    ))}
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

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Invoice Lines</CardTitle>
                        <Button variant="outline" size="sm" onClick={addLine}>
                            <Plus className="mr-2 h-4 w-4" /> Add Line
                        </Button>
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
                                    <div className="flex-[2] space-y-2">
                                        <Label>Description</Label>
                                        <Input value={line.description} onChange={e => handleLineChange(index, "description", e.target.value)} placeholder="Line description..." />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>Amount</Label>
                                        <Input type="number" step="0.01" value={line.amount} onChange={e => handleLineChange(index, "amount", e.target.value)} placeholder="0.00" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>Match to PO</Label>
                                        <Input value={line.poHeaderId || ""} onChange={e => handleLineChange(index, "poHeaderId", e.target.value)} placeholder="PO ID..." />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeLine(index)} disabled={lines.length === 1} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
