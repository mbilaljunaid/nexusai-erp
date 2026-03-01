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
import { ChevronRight, ChevronLeft, Save, Plus, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { StandardTable, Column } from "@/components/ui/StandardTable";

const steps = [
    { id: 1, name: "Template & Criteria" },
    { id: 2, name: "Review Selected Invoices" },
    { id: 3, name: "Build Payments" },
    { id: 4, name: "Review & Submit" }
];

export default function CreatePPR() {
    const [currentStep, setCurrentStep] = useState(1);
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<any>({
        batchName: `PPR-${new Date().toISOString().split('T')[0]}-01`,
        paymentMethodCode: "EFT",
        paymentCurrency: "USD",
        checkDate: new Date().toISOString().split("T")[0],
        bankAccountId: "",
        payThroughDate: new Date().toISOString().split("T")[0],
        supplierId: "all",
        businessUnitId: "all",
        templateId: "none",
    });

    // Step 2 & 3 State
    const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
    const [proposedPayments, setProposedPayments] = useState<any[]>([]);

    const { data: bankAccounts = [] } = useQuery({
        queryKey: ["/api/cash/accounts"],
    });

    const { data: eligibleInvoices, isLoading: loadingInvoices } = useQuery({
        queryKey: ["/api/ap/invoices/eligible-for-payment", formData.payThroughDate, formData.paymentMethodCode],
        queryFn: () => fetch(`/api/ap/invoices?status=Approved&validationStatus=Validated&limit=100`).then(r => r.json()),
        enabled: currentStep === 2
    });

    const createBatchMutation = useMutation({
        mutationFn: (data: any) =>
            fetch("/api/ap/payment-batches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(r => r.json()),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/payment-batches"] });
            toast({ title: "Payment Process Request submitted successfully", description: `Batch ID: ${res[0]?.id || 'N/A'}` });
            setLocation("/finance/ap/payments");
        },
        onError: () => {
            toast({ title: "Error submitting PPR", variant: "destructive" });
        }
    });

    const handleNext = () => {
        if (currentStep === 1) {
            if (!formData.bankAccountId) {
                toast({ title: "Please select a bank account", variant: "destructive" });
                return;
            }
        }
        if (currentStep === 2) {
            // Group selected invoices by supplier to form "proposed payments"
            if (selectedInvoices.size === 0) {
                toast({ title: "Please select at least one invoice", variant: "destructive" });
                return;
            }
            const invoicesToPay = (eligibleInvoices?.data || []).filter((i: any) => selectedInvoices.has(i.id));
            const grouped = invoicesToPay.reduce((acc: any, inv: any) => {
                const supId = inv.supplierId;
                if (!acc[supId]) {
                    acc[supId] = { supplierId: supId, supplierName: inv.supplier?.name, invoiceCount: 0, totalAmount: 0, invoices: [] };
                }
                acc[supId].invoiceCount++;
                acc[supId].totalAmount += parseFloat(inv.invoiceAmount);
                acc[supId].invoices.push(inv);
                return acc;
            }, {});
            setProposedPayments(Object.values(grouped));
        }

        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = () => {
        const payload = {
            ...formData,
            invoiceIds: Array.from(selectedInvoices),
            status: "NEW"
        }
        createBatchMutation.mutate(payload);
    };

    const toggleInvoice = (id: string) => {
        const next = new Set(selectedInvoices);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedInvoices(next);
    };

    const toggleAllInvoices = () => {
        if (selectedInvoices.size === eligibleInvoices?.data?.length) {
            setSelectedInvoices(new Set());
        } else {
            setSelectedInvoices(new Set((eligibleInvoices?.data || []).map((i: any) => i.id)));
        }
    };

    const invoiceColumns: Column<any>[] = [
        {
            header: "Select",
            accessorKey: "id",
            cell: (row) => <Checkbox checked={selectedInvoices.has(row.id)} onCheckedChange={() => toggleInvoice(row.id)} />,
            className: "w-12 text-center"
        },
        { header: "Supplier", accessorKey: "supplierId", cell: (r) => r.supplier?.name || "Unknown" },
        { header: "Invoice Number", accessorKey: "invoiceNumber" },
        { header: "Date", accessorKey: "invoiceDate", cell: (r) => new Date(r.invoiceDate).toLocaleDateString() },
        { header: "Amount", accessorKey: "invoiceAmount", cell: (r) => `$${parseFloat(r.invoiceAmount).toLocaleString()}` },
        { header: "Due Date", accessorKey: "dueDate", cell: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "-" }
    ];

    const paymentColumns: Column<any>[] = [
        { header: "Payee (Supplier)", accessorKey: "supplierName" },
        { header: "Invoices to Pay", accessorKey: "invoiceCount" },
        { header: "Total Payment Amount", accessorKey: "totalAmount", cell: (r) => <span className="font-bold text-green-700">£{parseFloat(r.totalAmount).toLocaleString()}</span> }
    ];

    return (
        <StandardPage
            title="Submit Payment Process Request"
            description="Wizard to select invoices and build a payment batch"
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "AP", href: "/finance/ap" },
                { label: "Payment Batches", href: "/finance/ap/payments" },
                { label: "Create PPR" }
            ]}
        >
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Stepper */}
                <div className="relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded" />
                    <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-300 rounded" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />
                    <div className="flex justify-between">
                        {steps.map((step) => (
                            <div key={step.id} className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${currentStep >= step.id ? "bg-blue-600 text-white" : "bg-white border-2 border-gray-300 text-gray-500"}`}>
                                    {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                                </div>
                                <span className={`text-xs font-medium ${currentStep >= step.id ? "text-blue-900" : "text-gray-500"}`}>{step.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{steps[currentStep - 1].name}</CardTitle>
                        <CardDescription>
                            {currentStep === 1 && "Define selection criteria and payment parameters."}
                            {currentStep === 2 && "Review and adjust the specific invoices selected by the criteria."}
                            {currentStep === 3 && "Review the consolidated proposed payments before submission."}
                            {currentStep === 4 && "Final review of the Payment Process Request."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 min-h-[400px]">
                        {currentStep === 1 && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h3 className="font-semibold text-sm">Identification</h3>
                                        <div className="flex items-center gap-2">
                                            <Label className="text-xs text-muted-foreground">Load Template</Label>
                                            <Select value={formData.templateId} onValueChange={(v) => {
                                                if (v === 'weekly_eft') {
                                                    setFormData({ ...formData, templateId: v, paymentMethodCode: 'EFT', batchName: `PPR-Weekly-${new Date().toISOString().split('T')[0]}` });
                                                    toast({ title: "Weekly Check Run template applied" });
                                                }
                                            }}>
                                                <SelectTrigger className="h-7 text-xs w-[140px]"><SelectValue placeholder="None" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="weekly_eft">Weekly EFT Run</SelectItem>
                                                    <SelectItem value="monthly_wires">Monthly Wires</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>PPR Name</Label>
                                        <Input value={formData.batchName} onChange={e => setFormData({ ...formData, batchName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Payment Date</Label>
                                        <Input type="date" value={formData.checkDate} onChange={e => setFormData({ ...formData, checkDate: e.target.value })} />
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
                                    <div className="space-y-2">
                                        <Label>Payment Method</Label>
                                        <Select value={formData.paymentMethodCode} onValueChange={(v) => setFormData({ ...formData, paymentMethodCode: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EFT">EFT / BACS</SelectItem>
                                                <SelectItem value="Check">Check</SelectItem>
                                                <SelectItem value="Wire">Wire Transfer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Payment Currency</Label>
                                        <Select value={formData.paymentCurrency} onValueChange={(v) => setFormData({ ...formData, paymentCurrency: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-sm border-b pb-2">Selection Criteria</h3>
                                    <div className="space-y-2">
                                        <Label>Business Unit *</Label>
                                        <Select value={formData.businessUnitId} onValueChange={(v) => setFormData({ ...formData, businessUnitId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Business Unit" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All BUs</SelectItem>
                                                <SelectItem value="BU_US">US Operations</SelectItem>
                                                <SelectItem value="BU_EU">EU Operations</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pay Through Date</Label>
                                        <Input type="date" value={formData.payThroughDate} onChange={e => setFormData({ ...formData, payThroughDate: e.target.value })} />
                                        <p className="text-xs text-muted-foreground">Selects invoices due on or before this date.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Supplier Group/Type</Label>
                                        <Select value={formData.supplierId} onValueChange={(v) => setFormData({ ...formData, supplierId: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Suppliers</SelectItem>
                                                <SelectItem value="domestic">Domestic Only</SelectItem>
                                                <SelectItem value="international">International Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="p-4 bg-slate-50 border rounded text-sm text-slate-600 mt-4">
                                        Note: Only invoices with 'Validated' status and 'Approved' workflow will be selected in the next step.
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-muted-foreground">{eligibleInvoices?.data?.length || 0} eligible invoices found. {selectedInvoices.size} selected.</span>
                                </div>
                                <StandardTable
                                    data={eligibleInvoices?.data || []}
                                    columns={invoiceColumns}
                                    isLoading={loadingInvoices}
                                    filterColumn="invoiceNumber"
                                />
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 text-green-800 border-green-200 border rounded-md mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span>System has grouped <strong>{selectedInvoices.size}</strong> invoices into <strong>{proposedPayments.length}</strong> proposed payments based on Supplier grouping rules.</span>
                                </div>
                                <StandardTable
                                    data={proposedPayments}
                                    columns={paymentColumns}
                                />
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="max-w-2xl mx-auto space-y-6 py-6">
                                <h2 className="text-xl font-bold text-center">Ready to Submit</h2>
                                <div className="border rounded-md divide-y">
                                    <div className="grid grid-cols-2 p-4">
                                        <span className="text-muted-foreground">PPR Name</span>
                                        <span className="font-medium text-right">{formData.batchName}</span>
                                    </div>
                                    <div className="grid grid-cols-2 p-4">
                                        <span className="text-muted-foreground">Payment Date</span>
                                        <span className="font-medium text-right">{formData.checkDate}</span>
                                    </div>
                                    <div className="grid grid-cols-2 p-4">
                                        <span className="text-muted-foreground">Total Payments Generated</span>
                                        <span className="font-medium text-right">{proposedPayments.length}</span>
                                    </div>
                                    <div className="grid grid-cols-2 p-4">
                                        <span className="text-muted-foreground">Total Value</span>
                                        <span className="font-bold text-green-700 text-right">
                                            £{proposedPayments.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-center text-sm text-muted-foreground mt-4">
                                    Upon submission, this batch will enter the final Payment Approval workflow before funds are disbursed.
                                </p>
                            </div>
                        )}

                    </CardContent>
                    <div className="p-6 border-t flex justify-between bg-slate-50/50 rounded-b-lg">
                        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setLocation("/finance/ap/payments")}>Cancel</Button>
                            {currentStep < 4 ? (
                                <Button onClick={handleNext}>
                                    Next <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={createBatchMutation.isPending}>
                                    {createBatchMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Submit Request
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </StandardPage>
    );
}
