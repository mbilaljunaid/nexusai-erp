import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, FileText, Loader2, Sparkles, Send } from "lucide-react";
import { ViewAccountingModal } from "@/components/sla/ViewAccountingModal";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatNumber } from '@/lib/formatters';

const salesCreditSchema = z.object({
    salespersonId: z.string().min(1, "Salesperson ID required"),
    salesCreditType: z.string().min(1, "Type required"),
    percentage: z.string().min(1, "Percentage required"),
    amount: z.string().min(1, "Amount required"),
});

export default function ARInvoiceDetail() {
    const [, params] = useRoute("/finance/ar/invoices/:id");
    const invoiceId = (params as any)?.id;
    const { toast } = useToast();

    const [accountingModalOpen, setAccountingModalOpen] = useState(false);

    const { data: invoiceData, isLoading } = useQuery<any>({
        queryKey: [`/api/ar/invoices/${invoiceId}`],
        enabled: !!invoiceId,
    });

    const approveMutation = useMutation({
        mutationFn: async () => await apiRequest("POST", `/api/billing/invoices/${invoiceId}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/ar/invoices/${invoiceId}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
            toast({ title: "Invoice Approved" });
        }
    });

    const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

    const { data: salesCredits = [], isLoading: loadingCredits } = useQuery<any[]>({
        queryKey: ["/api/ar/sales-credits", selectedLineId],
        enabled: !!selectedLineId,
    });

    const [localCredits, setLocalCredits] = useState<any[]>([]);

    useEffect(() => {
        if (salesCredits) {
            setLocalCredits(salesCredits);
        }
    }, [salesCredits, selectedLineId]);

    const saveCreditsMutation = useMutation({
        mutationFn: async (credits: any[]) => {
            await Promise.all(credits.map(credit =>
                apiRequest("POST", "/api/ar/sales-credits", { ...credit, invoiceLineId: selectedLineId })
            ));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/sales-credits", selectedLineId] });
            toast({ title: "Sales Credits Saved" });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const form = useForm<z.infer<typeof salesCreditSchema>>({
        resolver: zodResolver(salesCreditSchema),
        defaultValues: {
            salespersonId: "",
            salesCreditType: "Quota",
            percentage: "100",
            amount: "0",
        }
    });

    if (isLoading) return <PageSkeleton />;
    if (!invoiceData) return <div className="p-8 text-center text-muted-foreground">Invoice not found.</div>;

    const invoice = invoiceData.invoice || invoiceData;
    const lines = invoiceData.lines || [];
    const status = invoice.status?.toUpperCase() || (invoice.glStatus ? 'ISSUED' : 'DRAFT');

    const creditColumns: SpreadsheetColumn<any>[] = [
        {
            id: "salespersonId",
            header: "Salesperson",
            width: "200px",
            cell: (row, index, updateRow) => (
                <Input className="h-9 w-full" value={row.salespersonId || ''} onChange={(e) => updateRow("salespersonId", e.target.value)} placeholder="Salesperson ID" />
            )
        },
        {
            id: "salesCreditType",
            header: "Type",
            width: "150px",
            cell: (row, index, updateRow) => (
                <Select value={row.salesCreditType || 'Quota'} onValueChange={(val) => updateRow("salesCreditType", val)}>
                    <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Quota">Quota</SelectItem>
                        <SelectItem value="Non-Quota">Non-Quota</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "percentage",
            header: "Percentage (%)",
            width: "120px",
            cell: (row, index, updateRow) => {
                const handlePctChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const pct = Number(e.target.value);
                    const lineAmount = lines.find((l: any) => l.id === selectedLineId)?.amount || 0;
                    updateRow("percentage", pct);
                    updateRow("amount", (pct / 100) * lineAmount);
                };
                return <Input type="number" step="0.01" className="h-9 w-full text-right" value={row.percentage || ''} onChange={handlePctChange} />;
            }
        },
        {
            id: "amount",
            header: "Amount ($)",
            width: "150px",
            cell: (row, index, updateRow) => (
                <Input type="number" step="0.01" className="h-9 w-full text-right" value={row.amount || ''} onChange={(e) => updateRow("amount", Number(e.target.value))} />
            )
        }
    ];

    return (
        <StandardPage
            title={`AR Invoice: ${invoice.invoiceNumber || invoice.id}`}
            description="Manage customer invoice, view lines, and accounting."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Receivable", href: "/finance/accounts-receivable" },
                { label: "Invoices", href: "/finance/ar/invoices" },
                { label: invoice.invoiceNumber || "Details" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setAccountingModalOpen(true)}>
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground hover:text-primary" /> View Accounting
                    </Button>
                    <Button variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-500/10">
                        <Sparkles className="mr-2 h-4 w-4" /> AI Summary
                    </Button>
                    {status === 'DRAFT' && (
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate()}
                            disabled={approveMutation.isPending}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                        </Button>
                    )}
                    {(status === 'ISSUED' || status === 'APPROVED') && (
                        <Button variant="outline" className="text-orange-600 border-orange-200">
                            <AlertTriangle className="mr-2 h-4 w-4" /> Create Credit Memo
                        </Button>
                    )}
                    <Button>
                        <Send className="mr-2 h-4 w-4" /> Send to Customer
                    </Button>
                </div>
            }
        >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Customer ID</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold">{invoice.customerId || invoice.customerName}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">${formatNumber(parseFloat(invoice.totalAmount || invoice.amount || 0))}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle></CardHeader>
                    <CardContent>
                        <Badge variant={status === 'PAID' ? 'outline' : status === 'DRAFT' ? 'secondary' : 'default'} className="text-sm">
                            {status}
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">GL Status</CardTitle></CardHeader>
                    <CardContent>
                        <StatusBadge status={invoice.glStatus || 'Unaccounted'} />
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Invoice Details</CardTitle>
                    <CardDescription>Lines, distributions, and sales credits</CardDescription>
                </CardHeader>
                <CardContent className="min-h-72 p-0">
                    <Tabs defaultValue="lines" className="w-full">
                        <div className="border-b px-4 py-2">
                            <TabsList>
                                <TabsTrigger value="header">Header Fields</TabsTrigger>
                                <TabsTrigger value="lines">Invoice Lines</TabsTrigger>
                                <TabsTrigger value="credits">Sales Credits</TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="header" className="p-4 m-0">
                            <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Salesperson ID</label>
                                    <p className="text-sm text-muted-foreground font-mono">{invoice.salespersonId || <span className="italic">Not assigned</span>}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Territory Code</label>
                                    <p className="text-sm text-muted-foreground font-mono">{invoice.territoryCode || <span className="italic">Not assigned</span>}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Customer</label>
                                    <p className="text-sm font-mono">{invoice.customerId || invoice.customerName || '—'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Invoice Date</label>
                                    <p className="text-sm font-mono">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : '—'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Payment Terms</label>
                                    <p className="text-sm font-mono">{invoice.paymentTerms || 'Net 30'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Currency</label>
                                    <p className="text-sm font-mono">{invoice.currencyCode || 'USD'}</p>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="lines" className="p-4 m-0">
                            {lines && lines.length > 0 ? (
                                <div className="space-y-4">
                                    {lines.map((l: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center p-3 border rounded-md bg-card">
                                            <div className="space-y-1">
                                                <div className="font-medium">Item: {l.itemId || l.description}</div>
                                                <div className="text-sm text-muted-foreground">Qty: {l.quantity || 1} &times; ${formatNumber(parseFloat(l.unitPrice || l.amount || 0))}</div>
                                            </div>
                                            <div className="font-semibold">${formatNumber(parseFloat(l.amount || 0))}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex bg-slate-500/10 border border-dashed rounded-lg p-8 items-center justify-center text-muted-foreground">
                                    Invoice lines have not been fully modeled for this entity yet.
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="credits" className="p-4 m-0">
                            {lines.length === 0 ? (
                                <div className="text-muted-foreground">No lines available to assign credits.</div>
                            ) : (
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="col-span-1 border rounded-md p-4">
                                        <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Select Line</h3>
                                        <div className="space-y-2">
                                            {lines.map((l: any) => (
                                                <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => {
                                                    setSelectedLineId(l.id);
                                                    form.setValue("amount", l.amount);
                                                }}>
                                                    <div
                                                        key={l.id}
                                                        className={cn(`p-2 border rounded cursor-pointer text-sm ${selectedLineId === l.id ? 'bg-primary/10 border-primary' : 'hover:bg-slate-500/10'}`)}
                                                    >
                                                        <div className="font-medium truncate">{l.description}</div>
                                                        <div className="text-muted-foreground">${l.amount}</div>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        {selectedLineId ? (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-semibold">Revenue Splits for Line</h3>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => setLocalCredits([...localCredits, { id: Date.now(), salesCreditType: 'Quota', percentage: 0, amount: 0, salespersonId: '' }])}>
                                                            Add Row
                                                        </Button>
                                                        <Button size="sm" onClick={() => saveCreditsMutation.mutate(localCredits)} disabled={saveCreditsMutation.isPending}>
                                                            Save Credits
                                                        </Button>
                                                    </div>
                                                </div>

                                                {loadingCredits ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : (
                                                    <div className="border rounded-md overflow-hidden">
                                                        <InteractiveSpreadsheet
                                                            data={localCredits}
                                                            columns={creditColumns}
                                                            onChange={setLocalCredits}
                                                        />
                                                    </div>
                                                )}

                                                {/* Quota Balancer Warning */}
                                                {!loadingCredits && localCredits.length > 0 && (
                                                    (() => {
                                                        const quotaSum = localCredits.filter((c: any) => c.salesCreditType === 'Quota').reduce((acc: number, val: any) => acc + Number(val.percentage), 0);
                                                        if (quotaSum !== 100) {
                                                            return (
                                                                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 mt-4">
                                                                    <AlertTriangle className="w-4 h-4" />
                                                                    <span>Warning: Quota sales credits sum up to {quotaSum}%. They must equal exactly 100% for revenue accounting.</span>
                                                                </div>
                                                            )
                                                        }
                                                        return null;
                                                    })()
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-muted-foreground border rounded-md border-dashed bg-slate-500/10">
                                                Select a line to view or manage sales revenue credits.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <ViewAccountingModal
                open={accountingModalOpen}
                onOpenChange={setAccountingModalOpen}
                entityId={invoiceId}
            />
        </StandardPage>
    );
}
