import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Save, Send, FileText, DollarSign, Calendar, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";

interface CrossChargeInvoice {
    id?: number;
    invoiceNumber?: string;
    sourceProjectId: number;
    targetProjectId: number;
    amount: number;
    description: string;
    lineItems: CrossChargeLineItem[];
    approvalStatus: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
    createdDate?: string;
    approvedDate?: string;
    approvedBy?: string;
}

interface CrossChargeLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    accountCode: string;
    expenditureType?: string;
}

export default function CrossChargeInvoicing() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);
    const [sourceProject, setSourceProject] = useState("");
    const [targetProject, setTargetProject] = useState("");
    const [description, setDescription] = useState("");
    const [lineItems, setLineItems] = useState<CrossChargeLineItem[]>([]);

    // Fetch invoices
    const { data: invoices, isLoading } = useQuery({
        queryKey: ["/api/ppm/cross-charge-invoices"],
        queryFn: () => apiRequest("/api/ppm/cross-charge-invoices"),
    });

    // Fetch projects
    const { data: projects } = useQuery({
        queryKey: ["/api/ppm/projects"],
        queryFn: () => apiRequest("/api/ppm/projects?status=ACTIVE"),
    });

    // Fetch expenditure types
    const { data: expenditureTypes } = useQuery({
        queryKey: ["/api/ppm/expenditure-types"],
        queryFn: () => apiRequest("/api/ppm/expenditure-types"),
    });

    // Save invoice mutation
    const saveMutation = useMutation({
        mutationFn: (data: CrossChargeInvoice) =>
            selectedInvoice
                ? apiRequest(`/api/ppm/cross-charge-invoices/${selectedInvoice}`, {
                    method: "PUT",
                    body: JSON.stringify(data),
                })
                : apiRequest("/api/ppm/cross-charge-invoices", {
                    method: "POST",
                    body: JSON.stringify(data),
                }),
        onSuccess: () => {
            toast({ title: "Success", description: "Cross-charge invoice saved" });
            queryClient.invalidateQueries({ queryKey: ["/api/ppm/cross-charge-invoices"] });
        },
    });

    // Submit for approval mutation
    const submitMutation = useMutation({
        mutationFn: (invoiceId: number) =>
            apiRequest(`/api/ppm/cross-charge-invoices/${invoiceId}/submit`, { method: "POST" }),
        onSuccess: () => {
            toast({ title: "Success", description: "Invoice submitted for approval" });
            queryClient.invalidateQueries({ queryKey: ["/api/ppm/cross-charge-invoices"] });
        },
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: (invoiceId: number) =>
            apiRequest(`/api/ppm/cross-charge-invoices/${invoiceId}/approve`, { method: "POST" }),
        onSuccess: () => {
            toast({ title: "Success", description: "Invoice approved" });
            queryClient.invalidateQueries({ queryKey: ["/api/ppm/cross-charge-invoices"] });
        },
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: ({ invoiceId, reason }: { invoiceId: number; reason: string }) =>
            apiRequest(`/api/ppm/cross-charge-invoices/${invoiceId}/reject`, {
                method: "POST",
                body: JSON.stringify({ reason }),
            }),
        onSuccess: () => {
            toast({ title: "Success", description: "Invoice rejected" });
            queryClient.invalidateQueries({ queryKey: ["/api/ppm/cross-charge-invoices"] });
        },
    });

    const addLineItem = () => {
        setLineItems([
            ...lineItems,
            {
                id: `line-${Date.now()}`,
                description: "",
                quantity: 1,
                unitPrice: 0,
                accountCode: "",
            },
        ]);
    };

    const updateLineItem = (id: string, updates: Partial<CrossChargeLineItem>) => {
        setLineItems(lineItems.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    };

    const removeLineItem = (id: string) => {
        setLineItems(lineItems.filter((item) => item.id !== id));
    };

    const calculateTotal = () => {
        return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    };

    const columns: SpreadsheetColumn[] = [
        {
            id: "description",
            header: "Description",
            width: "250px",
            cell: (row) => (
                <Input
                    value={row.description}
                    onChange={(e) => updateLineItem(row.id, { description: e.target.value })}
                    placeholder="Item description"
                    className="h-8 border-0 ring-0 focus-visible:ring-0 shadow-none px-2 bg-transparent"
                />
            )
        },
        {
            id: "quantity",
            header: "Qty",
            width: "100px",
            cell: (row) => (
                <Input
                    type="number"
                    value={row.quantity}
                    onChange={(e) => updateLineItem(row.id, { quantity: parseFloat(e.target.value) || 0 })}
                    className="h-8 border-0 ring-0 focus-visible:ring-0 shadow-none px-2 bg-transparent text-right"
                    step="0.01"
                />
            )
        },
        {
            id: "unitPrice",
            header: "Unit Price",
            width: "120px",
            cell: (row) => (
                <Input
                    type="number"
                    value={row.unitPrice}
                    onChange={(e) => updateLineItem(row.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                    className="h-8 border-0 ring-0 focus-visible:ring-0 shadow-none px-2 bg-transparent text-right"
                    step="0.01"
                />
            )
        },
        {
            id: "amount",
            header: "Amount",
            width: "120px",
            cell: (row) => (
                <div className="px-2 text-right font-medium">
                    ${(row.quantity * row.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            )
        },
        {
            id: "expenditureType",
            header: "Exp. Type",
            width: "150px",
            cell: (row) => (
                <Select
                    value={row.expenditureType}
                    onValueChange={(value) => updateLineItem(row.id, { expenditureType: value })}
                >
                    <SelectTrigger className="h-8 border-0 shadow-none bg-transparent">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {expenditureTypes?.map((type: any) => (
                            <SelectItem key={type.id} value={type.code}>
                                {type.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "actions",
            header: "",
            width: "80px",
            cell: (row) => (
                <div className="flex justify-end pr-2">
                    <Button size="sm" variant="ghost" onClick={() => removeLineItem(row.id)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    const saveInvoice = () => {
        const invoice: CrossChargeInvoice = {
            sourceProjectId: parseInt(sourceProject),
            targetProjectId: parseInt(targetProject),
            description,
            lineItems,
            amount: calculateTotal(),
            approvalStatus: 'DRAFT',
        };
        saveMutation.mutate(invoice);
    };

    const loadInvoice = (invoice: CrossChargeInvoice) => {
        setSelectedInvoice(invoice.id || null);
        setSourceProject(invoice.sourceProjectId.toString());
        setTargetProject(invoice.targetProjectId.toString());
        setDescription(invoice.description);
        setLineItems(invoice.lineItems);
    };

    const resetForm = () => {
        setSelectedInvoice(null);
        setSourceProject("");
        setTargetProject("");
        setDescription("");
        setLineItems([]);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            DRAFT: { variant: "secondary", label: "Draft" },
            PENDING_APPROVAL: { variant: "default", label: "Pending Approval" },
            APPROVED: { variant: "default", label: "Approved" },
            REJECTED: { variant: "destructive", label: "Rejected" },
        };
        const config = variants[status] || variants.DRAFT;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <StandardPage title="Cross-Charge Invoicing">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground">
                        Generate invoices for interproject cost transfers
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={resetForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Invoice
                    </Button>
                    <Button onClick={saveInvoice} disabled={saveMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                    </Button>
                    {selectedInvoice && (
                        <Button onClick={() => submitMutation.mutate(selectedInvoice)} disabled={submitMutation.isPending}>
                            <Send className="h-4 w-4 mr-2" />
                            Submit for Approval
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Invoice List */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Invoices</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {invoices?.map((invoice: CrossChargeInvoice) => (
                            <div
                                key={invoice.id}
                                className={`p-3 rounded-lg cursor-pointer border ${selectedInvoice === invoice.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                                    }`}
                                onClick={() => loadInvoice(invoice)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-medium">{invoice.invoiceNumber || "Draft"}</div>
                                    {getStatusBadge(invoice.approvalStatus)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Source: {projects?.find((p: any) => p.id === invoice.sourceProjectId)?.projectNumber}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Target: {projects?.find((p: any) => p.id === invoice.targetProjectId)?.projectNumber}
                                </div>
                                <div className="text-sm font-medium mt-2">${invoice.amount.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">
                                    {invoice.createdDate && new Date(invoice.createdDate).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Invoice Form */}
                <Card className="col-span-8">
                    <CardHeader>
                        <CardTitle>Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Header */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Source Project (Charging)</Label>
                                <Select value={sourceProject} onValueChange={setSourceProject}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects?.map((project: any) => (
                                            <SelectItem key={project.id} value={project.id.toString()}>
                                                {project.projectNumber} - {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Target Project (Receiving)</Label>
                                <Select value={targetProject} onValueChange={setTargetProject}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select target" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects?.filter((p: any) => p.id.toString() !== sourceProject).map((project: any) => (
                                            <SelectItem key={project.id} value={project.id.toString()}>
                                                {project.projectNumber} - {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Invoice description and notes"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">Line Items</h3>
                                <Button size="sm" onClick={addLineItem}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Line
                                </Button>
                            </div>

                            <div className="border rounded-lg h-[400px]">
                                <InteractiveSpreadsheet
                                    data={lineItems}
                                    columns={columns}
                                    containerHeight={400}
                                    virtualized={true}
                                />
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <div></div>
                                <div className="text-right">
                                    <span className="font-bold mr-4">TOTAL</span>
                                    <span className="text-lg font-bold">${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Approval Section */}
                        {selectedInvoice && invoices?.find((inv: CrossChargeInvoice) => inv.id === selectedInvoice)?.approvalStatus === 'PENDING_APPROVAL' && (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-4">Approval Actions</h3>
                                <div className="flex gap-2">
                                    <Button onClick={() => approveMutation.mutate(selectedInvoice)} disabled={approveMutation.isPending}>
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            const reason = prompt("Rejection reason:");
                                            if (reason) rejectMutation.mutate({ invoiceId: selectedInvoice, reason });
                                        }}
                                        disabled={rejectMutation.isPending}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
