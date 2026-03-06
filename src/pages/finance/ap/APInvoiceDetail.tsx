import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, AlertCircle, FileText, Paperclip, Loader2 } from "lucide-react";
import { ViewAccountingModal } from "@/components/sla/ViewAccountingModal";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function APInvoiceDetail() {
    const [, params] = useRoute("/finance/ap/invoices/:id");
    const invoiceId = (params as any)?.id;
    const { toast } = useToast();

    const [accountingModalOpen, setAccountingModalOpen] = useState(false);
    const [holdsDialogOpen, setHoldsDialogOpen] = useState(false);
    const [distributionsModalOpen, setDistributionsModalOpen] = useState(false);
    const [selectedLine, setSelectedLine] = useState<any>(null);

    const { data: invoiceData, isLoading } = useQuery<any>({
        queryKey: [`/api/ap/invoices/${invoiceId}`],
        enabled: !!invoiceId,
        queryFn: async () => {
            const res = await fetch(`/api/ap/invoices/${invoiceId}`);
            if (!res.ok) throw new Error("Failed to fetch invoice");
            return res.json();
        }
    });

    const { data: holds = [] } = useQuery<any[]>({
        queryKey: [`/api/ap/invoices/${invoiceId}/holds`],
        enabled: !!invoiceId,
        queryFn: async () => {
            const res = await fetch(`/api/ap/invoices/${invoiceId}/holds`);
            if (!res.ok) return [];
            return res.json();
        }
    });

    const validateMutation = useMutation({
        mutationFn: async () => await apiRequest("POST", `/api/ap/invoices/${invoiceId}/validate`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/ap/invoices/${invoiceId}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
            toast({ title: "Invoice Validated" });
        }
    });

    if (isLoading) return <PageSkeleton />;
    if (!invoiceData) return <div className="p-8 text-center text-muted-foreground">Invoice not found or failed to load.</div>;

    // ERP invoices API usually returns `{ ...header, lines: [...] }` or just the invoice. We'll handle both.
    const invoice = invoiceData.invoice || invoiceData;
    const lines = invoiceData.lines || [];

    const displayInvoiceId = invoice.invoiceNumber || invoice.id.substring(0, 8).toUpperCase();

    // Mock distributions for demonstration
    const mockDistributions = (lineValue: number) => [
        { account: "01-100-5100-0000", amount: (lineValue * 0.8).toFixed(2), description: "Primary Expense" },
        { account: "01-100-2400-0000", amount: (lineValue * 0.2).toFixed(2), description: "Tax / Freight Allocation" },
    ];

    const distributionColumns: SpreadsheetColumn<any>[] = [
        { id: "account", header: "GL Account", width: "150px", cell: (row) => <span className="font-mono text-xs">{row.account}</span> },
        { id: "description", header: "Description", width: "250px", cell: (row) => <span className="text-muted-foreground">{row.description}</span> },
        { id: "amount", header: "Amount", width: "150px", cell: (row) => <span className="font-medium flex justify-end">${parseFloat(row.amount).toLocaleString()}</span> }
    ];

    return (
        <StandardPage
            title={`Invoice: ${displayInvoiceId}`}
            description={invoice.description || "View invoice details, lines, and accounting distributions."}
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Payable", href: "/finance/ap" },
                { label: "Invoices", href: "/finance/ap/invoices" },
                { label: displayInvoiceId }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setAccountingModalOpen(true)}>
                        <FileText className="mr-2 h-4 w-4" /> View Accounting
                    </Button>
                    <Button variant="outline" onClick={() => setHoldsDialogOpen(true)}>
                        <AlertCircle className="mr-2 h-4 w-4" /> Holds ({holds.filter((h: any) => !h.released).length})
                    </Button>
                    {invoice.status === 'Draft' || invoice.status === 'Needs Revalidation' ? (
                        <Button onClick={() => validateMutation.mutate()} disabled={validateMutation.isPending}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {validateMutation.isPending ? "Validating..." : "Validate"}
                        </Button>
                    ) : null}
                </div>
            }
        >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Supplier</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold">{invoice.supplierId}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">${parseFloat(invoice.invoiceAmount || invoice.amount || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle></CardHeader>
                    <CardContent>
                        <Badge variant={invoice.status === 'Validated' || invoice.status === 'Paid' ? 'default' : 'secondary'} className="text-sm">
                            {invoice.status || 'Draft'}
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
                    <CardTitle>Invoice Lines & Distributions</CardTitle>
                </CardHeader>
                <CardContent>
                    {lines && lines.length > 0 ? (
                        <InteractiveSpreadsheet<any>
                            data={lines}
                            columns={[
                                { header: "Line #", id: "lineNumber", width: "10%" },
                                { header: "Type", id: "lineType", width: "15%" },
                                { header: "Description", id: "description", width: "35%" },
                                { header: "Amount", cell: (r) => `$${parseFloat(r.amount || 0).toLocaleString()}`, width: "10%" },
                                { header: "PO Header ID", id: "poHeaderId", width: "15%" },
                                {
                                    header: "Actions",
                                    width: "15%",
                                    cell: (r) => (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-indigo-600"
                                            onClick={() => {
                                                setSelectedLine(r);
                                                setDistributionsModalOpen(true);
                                            }}
                                        >
                                            View Distributions
                                        </Button>
                                    )
                                }
                            ]}
                            onChange={() => { }} containerHeight="600px" />
                    ) : (
                        <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                            No lines found for this invoice.
                        </div>
                    )}
                </CardContent>
            </Card>

            <ViewAccountingModal
                open={accountingModalOpen}
                onOpenChange={setAccountingModalOpen}
                entityId={invoiceId}
            />

            <Dialog open={holdsDialogOpen} onOpenChange={setHoldsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invoice Holds</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        {holds.length === 0 ? (
                            <div className="text-center text-muted-foreground">No holds apply to this invoice.</div>
                        ) : (
                            holds.map((h: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3 border rounded-md">
                                    <div>
                                        <div className="font-medium text-destructive">{h.holdReason}</div>
                                        <div className="text-xs text-muted-foreground">Placed: {formatDate(h.holdDate)}</div>
                                    </div>
                                    {h.released ? (
                                        <StatusBadge status="Released" />
                                    ) : (
                                        <Badge variant="destructive">Active</Badge>
                                    )}
                                </div>
                            ))
                        )}
                        <div className="flex justify-end pt-4">
                            <Button variant="outline" onClick={() => setHoldsDialogOpen(false)}>Close</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={distributionsModalOpen} onOpenChange={setDistributionsModalOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Line Distributions</DialogTitle>
                        <DialogDescription>
                            Accounting distribution splits for Line {selectedLine?.lineNumber}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        {selectedLine && (
                            <div className="border rounded-md">
                                <InteractiveSpreadsheet
                                    columns={distributionColumns}
                                    data={[
                                        ...mockDistributions(parseFloat(selectedLine.amount || 0)),
                                        {
                                            account: "Total Line Amount:",
                                            description: "",
                                            amount: selectedLine.amount || 0
                                        }
                                    ]}
                                    onChange={() => { }}
                                    containerHeight="200px"
                                />
                            </div>
                        )}
                        <div className="flex justify-end pt-4">
                            <Button variant="outline" onClick={() => setDistributionsModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
