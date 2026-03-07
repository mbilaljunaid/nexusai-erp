import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, CheckCircle2, Send, AlertCircle, Edit, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface ProjectInvoice {
    id: string;
    invoiceNumber: string;
    projectId: string;
    customerId: string;
    invoiceDate: string;
    status: "DRAFT" | "APPROVED" | "SUBMITTED" | "RELEASED";
    amount: number;
    currency: string;
    arInvoiceId?: string;
    transferStatus: "PENDING" | "TRANSFERRED" | "REJECTED";
    transferError?: string;
}

interface InvoiceLine {
    id: string;
    invoiceId: string;
    lineNumber: number;
    eventId: string;
    amount: number;
    description: string;
    taxAmount?: number;
}

export default function DraftInvoiceWorkbench() {
    const { projectId } = useParams<{ projectId: string }>();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

    // Fetch project invoices
    const { data: invoices = [] } = useQuery<ProjectInvoice[]>({
        queryKey: ["project-invoices", projectId],
        queryFn: async () => {
            const res = await fetch(`/api/ppm/projects/${projectId}/invoices`);
            return res.json();
        },
        enabled: !!projectId
    });

    // Fetch invoice lines for selected invoice
    const { data: invoiceLines = [] } = useQuery<InvoiceLine[]>({
        queryKey: ["invoice-lines", selectedInvoiceId],
        queryFn: async () => {
            // Mock implementation - replace with actual API
            return [];
        },
        enabled: !!selectedInvoiceId
    });

    // Approve invoice mutation
    const approveMutation = useMutation({
        mutationFn: async (invoiceId: string) => {
            const res = await fetch(`/api/ppm/invoices/${invoiceId}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) throw new Error("Failed to approve invoice");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-invoices"] });
            toast({
                title: "Invoice Approved",
                description: "Invoice has been approved and is ready for AR submission."
            });
        }
    });

    // Submit to AR mutation
    const submitToArMutation = useMutation({
        mutationFn: async (invoiceId: string) => {
            const res = await fetch(`/api/ppm/invoices/${invoiceId}/submit-ar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to submit to AR");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-invoices"] });
            toast({
                title: "Submitted to AR",
                description: "Invoice has been successfully interfaced to Accounts Receivable."
            });
        },
        onError: (error: Error) => {
            toast({
                title: "AR Submission Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);



    return (
        <StandardPage
            title="Draft Invoice Workbench"
            description="Review, approve, and submit project invoices to Accounts Receivable."
            breadcrumbs={[
                { label: "Projects", href: "/projects" },
                { label: "Draft Invoices" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Draft</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                                {invoices.filter(i => i.status === "DRAFT").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Approved</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                                {invoices.filter(i => i.status === "APPROVED").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Submitted</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                                {invoices.filter(i => i.status === "SUBMITTED" || i.status === "RELEASED").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Total Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                                ${invoices.reduce((sum, i) => sum + i.amount, 0).toFixed(0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Invoice List */}
                    <Card className="lg:col-span-2 border-t-4 border-t-blue-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Project Invoices
                            </CardTitle>
                            <CardDescription>Draft and approved invoices for this project.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {invoices.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No invoices created yet. Generate invoices from billing events.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>AR Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoices.map((invoice) => (
                                            <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelectedInvoiceId(invoice.id)}>
                                            <TableRow
                                                                                            key={invoice.id}
                                                                                            className={selectedInvoiceId === invoice.id ? "bg-blue-500/10 cursor-pointer" : "cursor-pointer hover:bg-muted/50"}
                                                                                        >
                                                                                            <TableCell className="font-mono font-medium">{invoice.invoiceNumber}</TableCell>
                                                                                            <TableCell className="text-xs text-muted-foreground">
                                                                                                {format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}
                                                                                            </TableCell>
                                                                                            <TableCell className="text-right font-mono font-bold">
                                                                                                ${invoice.amount.toFixed(2)}
                                                                                            </TableCell>
                                                                                            <TableCell><StatusBadge status={invoice.status} /></TableCell>
                                                                                            <TableCell><StatusBadge status={invoice.transferStatus} /></TableCell>
                                                                                        </TableRow>
                                            </Button>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Invoice Actions */}
                    <Card className="lg:col-span-1 border-t-4 border-t-purple-500">
                        <CardHeader>
                            <CardTitle className="text-sm">Invoice Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedInvoice ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Select an invoice to view details and actions
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-3 bg-muted rounded-lg space-y-2">
                                        <h4 className="font-bold text-sm">{selectedInvoice.invoiceNumber}</h4>
                                        <div className="flex justify-between text-xs pt-2 border-t">
                                            <span className="text-muted-foreground">Status:</span>
                                            <StatusBadge status={selectedInvoice.status} />
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Amount:</span>
                                            <span className="font-mono font-bold">${selectedInvoice.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Date:</span>
                                            <span>{format(new Date(selectedInvoice.invoiceDate), "MMM dd, yyyy")}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Workflow</Label>

                                        <Button
                                            className="w-full justify-start"
                                            variant={selectedInvoice.status === "DRAFT" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => approveMutation.mutate(selectedInvoice.id)}
                                            disabled={selectedInvoice.status !== "DRAFT" || approveMutation.isPending}
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            {approveMutation.isPending ? "Approving..." : "Approve Invoice"}
                                        </Button>

                                        <Button
                                            className="w-full justify-start"
                                            variant={selectedInvoice.status === "APPROVED" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => submitToArMutation.mutate(selectedInvoice.id)}
                                            disabled={selectedInvoice.status !== "APPROVED" || submitToArMutation.isPending}
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            {submitToArMutation.isPending ? "Submitting..." : "Submit to AR"}
                                        </Button>
                                    </div>

                                    {selectedInvoice.transferStatus === "REJECTED" && selectedInvoice.transferError && (
                                        <div className="p-3 bg-red-500/10 border border-red-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                                <span className="text-xs font-bold text-red-900 dark:text-red-200">Transfer Error</span>
                                            </div>
                                            <p className="text-xs text-red-700">{selectedInvoice.transferError}</p>
                                        </div>
                                    )}

                                    {selectedInvoice.arInvoiceId && (
                                        <div className="p-3 bg-green-500/10 border border-green-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span className="text-xs font-bold text-green-900 dark:text-green-200">AR Invoice Created</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Invoice ID: <span className="font-mono">{selectedInvoice.arInvoiceId}</span></p>
                                        </div>
                                    )}

                                    {invoiceLines.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Invoice Lines</Label>
                                            <div className="max-h-48 overflow-y-auto space-y-1">
                                                {invoiceLines.map((line) => (
                                                    <div key={line.id} className="p-2 bg-card rounded border text-xs">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="text-muted-foreground">Line {line.lineNumber}</span>
                                                            <span className="font-mono font-bold">${line.amount.toFixed(2)}</span>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground truncate">{line.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
