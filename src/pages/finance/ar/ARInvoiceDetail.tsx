import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
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

    const createCreditMutation = useMutation({
        mutationFn: async (data: z.infer<typeof salesCreditSchema>) => {
            const res = await apiRequest("POST", "/api/ar/sales-credits", { ...data, invoiceLineId: selectedLineId });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/sales-credits", selectedLineId] });
            toast({ title: "Sales Credit Added" });
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

    if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!invoiceData) return <div className="p-8 text-center text-muted-foreground">Invoice not found.</div>;

    const invoice = invoiceData.invoice || invoiceData;
    const lines = invoiceData.lines || [];
    const status = invoice.status?.toUpperCase() || (invoice.glStatus ? 'ISSUED' : 'DRAFT');

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
                    <Button variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
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
                        <div className="text-xl font-bold">${parseFloat(invoice.totalAmount || invoice.amount || 0).toLocaleString()}</div>
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
                        <Badge variant="outline" className={invoice.glStatus === 'Posted' || invoice.glStatus === 'Accounted' ? "bg-green-50 text-green-700 text-sm" : "bg-yellow-50 text-yellow-700 text-sm"}>
                            {invoice.glStatus || 'Unaccounted'}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Invoice Details</CardTitle>
                    <CardDescription>Lines, distributions, and sales credits</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[300px] p-0">
                    <Tabs defaultValue="lines" className="w-full">
                        <div className="border-b px-4 py-2">
                            <TabsList>
                                <TabsTrigger value="lines">Invoice Lines</TabsTrigger>
                                <TabsTrigger value="credits">Sales Credits</TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="lines" className="p-4 m-0">
                            {lines && lines.length > 0 ? (
                                <div className="space-y-4">
                                    {lines.map((l: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center p-3 border rounded-md bg-card">
                                            <div className="space-y-1">
                                                <div className="font-medium">Item: {l.itemId || l.description}</div>
                                                <div className="text-sm text-muted-foreground">Qty: {l.quantity || 1} &times; ${parseFloat(l.unitPrice || l.amount || 0).toLocaleString()}</div>
                                            </div>
                                            <div className="font-semibold">${parseFloat(l.amount || 0).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex bg-slate-50 border border-dashed rounded-lg p-8 items-center justify-center text-muted-foreground">
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
                                                <div
                                                    key={l.id}
                                                    className={`p-2 border rounded cursor-pointer text-sm ${selectedLineId === l.id ? 'bg-primary/10 border-primary' : 'hover:bg-slate-50'}`}
                                                    onClick={() => {
                                                        setSelectedLineId(l.id);
                                                        form.setValue("amount", l.amount);
                                                    }}
                                                >
                                                    <div className="font-medium truncate">{l.description}</div>
                                                    <div className="text-muted-foreground">${l.amount}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        {selectedLineId ? (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-semibold">Revenue Splits for Line</h3>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm">Add Credit</Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader><DialogTitle>Add Sales Credit</DialogTitle></DialogHeader>
                                                            <Form {...form}>
                                                                <form onSubmit={form.handleSubmit((d) => createCreditMutation.mutate(d))} className="space-y-4">
                                                                    <FormField control={form.control} name="salespersonId" render={({ field }) => (
                                                                        <FormItem><FormLabel>Salesperson ID</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                                                    )} />
                                                                    <FormField control={form.control} name="salesCreditType" render={({ field }) => (
                                                                        <FormItem><FormLabel>Type</FormLabel>
                                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                                                <SelectContent>
                                                                                    <SelectItem value="Quota">Quota</SelectItem>
                                                                                    <SelectItem value="Non-Quota">Non-Quota</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </FormItem>
                                                                    )} />
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <FormField control={form.control} name="percentage" render={({ field }) => (
                                                                            <FormItem><FormLabel>Percentage (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                                                        )} />
                                                                        <FormField control={form.control} name="amount" render={({ field }) => (
                                                                            <FormItem><FormLabel>Amount ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                                                        )} />
                                                                    </div>
                                                                    <Button type="submit" className="w-full" disabled={createCreditMutation.isPending}>Save</Button>
                                                                </form>
                                                            </Form>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>

                                                {loadingCredits ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : (
                                                    <div className="border rounded-md overflow-hidden">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-slate-50 border-b">
                                                                <tr>
                                                                    <th className="p-2 text-left font-medium">Salesperson</th>
                                                                    <th className="p-2 text-left font-medium">Type</th>
                                                                    <th className="p-2 text-right font-medium">%</th>
                                                                    <th className="p-2 text-right font-medium">Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {salesCredits.map((c: any) => (
                                                                    <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                                                                        <td className="p-2">{c.salespersonId}</td>
                                                                        <td className="p-2">
                                                                            <Badge variant={c.salesCreditType === 'Quota' ? 'default' : 'secondary'}>{c.salesCreditType}</Badge>
                                                                        </td>
                                                                        <td className="p-2 text-right">{c.percentage}%</td>
                                                                        <td className="p-2 text-right">${c.amount}</td>
                                                                    </tr>
                                                                ))}
                                                                {salesCredits.length === 0 && (
                                                                    <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No credits assigned</td></tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}

                                                {/* Quota Balancer Warning */}
                                                {!loadingCredits && salesCredits.length > 0 && (
                                                    (() => {
                                                        const quotaSum = salesCredits.filter((c: any) => c.salesCreditType === 'Quota').reduce((acc: number, val: any) => acc + Number(val.percentage), 0);
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
                                            <div className="h-full flex items-center justify-center text-muted-foreground border rounded-md border-dashed bg-slate-50">
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
