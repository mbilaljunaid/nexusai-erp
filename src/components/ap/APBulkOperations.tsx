import { useState} from"react";
import { useMutation} from"@tanstack/react-query";
import { Button} from"@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter} from"@/components/ui/dialog";
import { Textarea} from"@/components/ui/textarea";
import { Progress} from"@/components/ui/progress";
import { Badge} from"@/components/ui/badge";
import { Alert, AlertDescription} from"@/components/ui/alert";
import { useToast} from"@/hooks/use-toast";
import { CheckCircle, XCircle, FileDown, DollarSign, RefreshCw, AlertCircle} from"lucide-react";

interface APBulkOperationsProps {
    selectedInvoices: any[];
    onSuccess: () => void;
    onClearSelection: () => void;
}

interface BulkOperationResult {
    success: number;
    failed: number;
    errors: { invoiceId: string; error: string}[];
}

export function APBulkOperations({ selectedInvoices, onSuccess, onClearSelection}: APBulkOperationsProps) {
    const { toast} = useToast();
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [operationProgress, setOperationProgress] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [lastResult, setLastResult] = useState<BulkOperationResult | null>(null);

    const totalAmount = selectedInvoices.reduce((sum, inv) => sum + parseFloat(inv.invoiceAmount || 0), 0);
    const selectedCount = selectedInvoices.length;

    // Bulk Approve
    const approveMutation = useMutation({
        mutationFn: async (invoiceIds: string[]) => {
            const res = await fetch("/api/ap/invoices/bulk-approve", {
                method:"POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({ invoiceIds})
           });
            if (!res.ok) throw new Error("Bulk approve failed");
            return res.json();
       },
        onSuccess: (result: BulkOperationResult) => {
            setLastResult(result);
            setShowResults(true);
            if (result.success > 0) {
                toast({
                    title:"Bulk Approve Complete",
                    description:`${result.success} invoices approved${result.failed > 0 ?`, ${result.failed} failed` :""}`
               });
                onSuccess();
                onClearSelection();
           }
       },
        onError: () => {
            toast({ title:"Bulk approve failed", variant:"destructive"});
       }
   });

    // Bulk Reject
    const rejectMutation = useMutation({
        mutationFn: async ({ invoiceIds, reason}: { invoiceIds: string[]; reason: string}) => {
            const res = await fetch("/api/ap/invoices/bulk-reject", {
                method:"POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({ invoiceIds, reason})
           });
            if (!res.ok) throw new Error("Bulk reject failed");
            return res.json();
       },
        onSuccess: (result: BulkOperationResult) => {
            setLastResult(result);
            setShowResults(true);
            setShowRejectDialog(false);
            setRejectReason("");
            if (result.success > 0) {
                toast({
                    title:"Bulk Reject Complete",
                    description:`${result.success} invoices rejected${result.failed > 0 ?`, ${result.failed} failed` :""}`
               });
                onSuccess();
                onClearSelection();
           }
       }
   });

    // Bulk Payment Batch
    const createPaymentBatchMutation = useMutation({
        mutationFn: async (invoiceIds: string[]) => {
            const res = await fetch("/api/ap/payment-batches/create-from-invoices", {
                method:"POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({ invoiceIds})
           });
            if (!res.ok) throw new Error("Payment batch creation failed");
            return res.json();
       },
        onSuccess: (data) => {
            toast({
                title:"Payment Batch Created",
                description:`Batch #${data.batchNumber} created with ${selectedCount} invoices`
           });
            onSuccess();
            onClearSelection();
       }
   });

    // Bulk Export
    const exportMutation = useMutation({
        mutationFn: async (invoiceIds: string[]) => {
            const res = await fetch("/api/ap/invoices/bulk-export", {
                method:"POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({ invoiceIds, format:"excel"})
           });
            if (!res.ok) throw new Error("Export failed");
            return res.blob();
       },
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download =`ap-invoices-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast({ title:"Export complete", description:`${selectedCount} invoices exported`});
       }
   });

    const handleBulkApprove = () => {
        const invoiceIds = selectedInvoices.map(inv => inv.id);
        approveMutation.mutate(invoiceIds);
   };

    const handleBulkReject = () => {
        if (!rejectReason.trim()) {
            toast({ title:"Rejection reason required", variant:"destructive"});
            return;
       }
        const invoiceIds = selectedInvoices.map(inv => inv.id);
        rejectMutation.mutate({ invoiceIds, reason: rejectReason});
   };

    const handleCreatePaymentBatch = () => {
        const invoiceIds = selectedInvoices.map(inv => inv.id);
        createPaymentBatchMutation.mutate(invoiceIds);
   };

    const handleExport = () => {
        const invoiceIds = selectedInvoices.map(inv => inv.id);
        exportMutation.mutate(invoiceIds);
   };

    if (selectedCount === 0) return null;

    const isProcessing = approveMutation.isPending || rejectMutation.isPending ||
        createPaymentBatchMutation.isPending || exportMutation.isPending;

    return (
        <>
            <div className="sticky top-0 bg-background border-b shadow-sm p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="text-base px-3 py-1">
                            {selectedCount} invoices selected
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            Total: ${totalAmount.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleBulkApprove}
                            disabled={isProcessing}
                            className="gap-2"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Bulk Approve
                        </Button>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowRejectDialog(true)}
                            disabled={isProcessing}
                            className="gap-2"
                        >
                            <XCircle className="h-4 w-4" />
                            Bulk Reject
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCreatePaymentBatch}
                            disabled={isProcessing}
                            className="gap-2"
                        >
                            <DollarSign className="h-4 w-4" />
                            Create Payment Batch
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            disabled={isProcessing}
                            className="gap-2"
                        >
                            <FileDown className="h-4 w-4" />
                            Export
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearSelection}
                            disabled={isProcessing}
                        >
                            Clear Selection
                        </Button>
                    </div>
                </div>

                {isProcessing && (
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Processing {selectedCount} invoices...
                        </div>
                        <Progress value={operationProgress} className="h-2" />
                    </div>
                )}
            </div>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Reject Invoices</DialogTitle>
                        <DialogDescription>
                            You are about to reject {selectedCount} invoices. Please provide a reason.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rejection Reason *</label>
                            <Textarea
                                placeholder="Enter reason for rejection..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBulkReject}
                            disabled={!rejectReason.trim() || rejectMutation.isPending}
                        >
                            Reject {selectedCount} Invoices
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Results Dialog */}
            <Dialog open={showResults} onOpenChange={setShowResults}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Bulk Operation Results</DialogTitle>
                    </DialogHeader>
                    {lastResult && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Alert className="border-green-500">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <AlertDescription>
                                        <div className="font-semibold">{lastResult.success} Successful</div>
                                    </AlertDescription>
                                </Alert>
                                {lastResult.failed > 0 && (
                                    <Alert variant="destructive">
                                        <XCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            <div className="font-semibold">{lastResult.failed} Failed</div>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {lastResult.errors.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Errors:</h4>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {lastResult.errors.map((err, idx) => (
                                            <div key={idx} className="text-sm p-2 bg-muted rounded flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <div className="font-medium">Invoice: {err.invoiceId}</div>
                                                    <div className="text-muted-foreground">{err.error}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setShowResults(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
