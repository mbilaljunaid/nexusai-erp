import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ChevronRight, ChevronLeft, Save, Plus, ArrowRight, CheckCircle2, Loader2, Search } from "lucide-react";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { DatePicker } from '@/components/ui/DatePicker';
import { formatNumber } from '@/lib/formatters';

export default function APQuickPayment() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<any>({
        businessUnitId: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethodCode: "Check",
        bankAccountId: "",
        supplierId: "",
        paymentAmount: "0.00",
        documentNumber: "" // e.g., Check Number
    });

    const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());

    // Lookups
    const { data: bankAccounts = [] } = useQuery<any>({
        queryKey: ["/api/cash/accounts"],
    });

    const { data: suppliers = [] } = useQuery<any>({
        queryKey: ["/api/ap/suppliers"],
        queryFn: () => fetch("/api/ap/suppliers").then(r => r.json())
    });

    // Fetch invoices for the selected supplier
    const { data: supplierInvoices, isLoading: loadingInvoices } = useQuery<any>({
        queryKey: ["/api/ap/invoices", { supplierId: formData.supplierId }],
        queryFn: () => fetch(`/api/ap/invoices?supplierId=${formData.supplierId}&status=Approved&validationStatus=Validated`).then(r => r.json()),
        enabled: !!formData.supplierId
    });

    // Auto-calculate payment amount based on selection
    const toggleInvoice = (invoice: any) => {
        const next = new Set(selectedInvoices);
        let newAmount = parseFloat(formData.paymentAmount || "0");
        const invAmount = parseFloat(invoice.invoiceAmount);

        if (next.has(invoice.id)) {
            next.delete(invoice.id);
            newAmount -= invAmount;
        } else {
            next.add(invoice.id);
            newAmount += invAmount;
        }

        setSelectedInvoices(next);
        setFormData({ ...formData, paymentAmount: Math.max(0, newAmount).toFixed(2) });
    };

    const createPaymentMutation = useMutation({
        mutationFn: (data: any) =>
            fetch("/api/ap/payments/quick", { // Assumes a specific endpoint for direct/quick payments that bypasses the batch workflow, or creates a single-payment batch
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(r => {
                if (!r.ok) throw new Error("Payment failed");
                return r.json()
            }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/payments"] });
            queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
            toast({ title: "Payment created successfully", description: `Payment Number: ${res.documentNumber || 'Generated'}` });
            setLocation("/finance/ap/payments");
        },
        onError: (err: any) => {
            toast({ title: "Error creating payment", variant: "destructive", description: err.message });
        }
    });

    const handleSubmit = () => {
        if (!formData.supplierId || !formData.bankAccountId || selectedInvoices.size === 0) {
            toast({ title: "Validation Error", description: "Supplier, Bank Account, and at least one invoice are required.", variant: "destructive" });
            return;
        }

        const payload = {
            ...formData,
            invoiceIds: Array.from(selectedInvoices),
            type: "QUICK_PAYMENT"
        };
        createPaymentMutation.mutate(payload);
    };

    const invoiceColumns: SpreadsheetColumn<any>[] = [
        {
            header: "Select",
            id: "id", width: "150px",
            cell: (row) => <Checkbox checked={selectedInvoices.has(row.id)} onCheckedChange={() => toggleInvoice(row)} />,
            className: "w-12 text-center"
        },
        { header: "Invoice Number", id: "invoiceNumber", width: "150px" },
        { header: "Date", id: "invoiceDate", width: "150px", cell: (r) => formatDate(r.invoiceDate) },
        { header: "Amount", id: "invoiceAmount", width: "150px", cell: (r) => `$${formatNumber(parseFloat(r.invoiceAmount))}` },
        { header: "Due Date", id: "dueDate", width: "150px", cell: (r) => r.dueDate ? formatDate(r.dueDate) : "-" }
    ];

    return (
        <StandardPage
            title="Quick Payment"
            description="Create a manual payment for specific invoices"
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "AP", href: "/finance/ap" },
                { label: "Payment Batches", href: "/finance/ap/payments" },
                { label: "Quick Payment" }
            ]}
        >
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Payment Details Form */}
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Business Unit *</Label>
                                    <Select value={formData.businessUnitId} onValueChange={(v) => setFormData({ ...formData, businessUnitId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Business Unit" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BU_US">US Operations</SelectItem>
                                            <SelectItem value="BU_EU">EU Operations</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Supplier *</Label>
                                    <Select value={formData.supplierId} onValueChange={(v) => {
                                        setFormData({ ...formData, supplierId: v, paymentAmount: "0.00" });
                                        setSelectedInvoices(new Set());
                                    }}>
                                        <SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((s: any) => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Disbursement Bank Account *</Label>
                                    <Select value={formData.bankAccountId} onValueChange={(v) => setFormData({ ...formData, bankAccountId: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bankAccounts?.map((account: any) => (
                                                <SelectItem key={account.id} value={account.id}>
                                                    {account.accountName} (*{account.accountNumber?.toString().slice(-4)})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Payment Method</Label>
                                        <Select value={formData.paymentMethodCode} onValueChange={(v) => setFormData({ ...formData, paymentMethodCode: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Check">Check</SelectItem>
                                                <SelectItem value="Wire">Wire Transfer</SelectItem>
                                                <SelectItem value="EFT">EFT / BACS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Payment Date</Label>
                                        <DatePicker value={formData.paymentDate} onChange={v => setFormData({ ...formData, paymentDate: v })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Document Number</Label>
                                    <Input placeholder="e.g. Check # (Optional)" value={formData.documentNumber} onChange={e => setFormData({ ...formData, documentNumber: e.target.value })} />
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center mb-2">
                                        <Label className="text-lg">Payment Amount</Label>
                                        <span className="text-2xl font-bold text-green-700">${formData.paymentAmount}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Amount is auto-calculated based on selected invoices.</p>
                                </div>

                                <Button className="w-full mt-4" size="lg" onClick={handleSubmit} disabled={createPaymentMutation.isPending || !formData.supplierId || selectedInvoices.size === 0}>
                                    {createPaymentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Create Payment
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Invoice Selection */}
                    <div className="md:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Select Invoices to Pay</CardTitle>
                                <CardDescription>
                                    {formData.supplierId ? "Select outstanding invoices for the chosen supplier." : "Please select a supplier first to view open invoices."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!formData.supplierId ? (
                                    <div className="flex flex-col items-center justify-center h-72 text-muted-foreground border-2 border-dashed rounded-lg">
                                        <Search className="h-8 w-8 mb-2 opacity-50" />
                                        <p>No supplier selected</p>
                                    </div>
                                ) : (
                                    <InteractiveSpreadsheet
                                        data={supplierInvoices?.data || []}
                                        columns={invoiceColumns}
                                        isLoading={loadingInvoices}
                                     onChange={() => {}} containerHeight="600px" />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </StandardPage>
    );
}
