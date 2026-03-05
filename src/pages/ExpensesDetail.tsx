import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Upload,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Receipt,
  Clock,
  User,
  AlertTriangle,
  Scan,
  Image,
  FileImage,
  Eye
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { DatePicker } from '@/components/ui/DatePicker';

export default function ExpensesDetail() {
  const [, params] = useRoute("/finance/expenses/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const reportId = (params as any)?.id || "";

  const [isAddLineOpen, setIsAddLineOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isUploadReceiptOpen, setIsUploadReceiptOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [lineCategory, setLineCategory] = useState("TRAVEL");
  const [receiptLineId, setReceiptLineId] = useState("");

  // Fetch expense report
  const { data: report, isLoading: reportLoading } = useQuery<any>({
    queryKey: ["/api/expenses", reportId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/expenses/${reportId}`);
      return res.json();
    },
    enabled: !!reportId
  });

  // Fetch expense lines
  const { data: lines = [], isLoading: linesLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses", reportId, "lines"],
    queryFn: async () => {
      // Lines are included in the report response, but we'll fetch separately for clarity
      return report?.lines || [];
    },
    enabled: !!report
  });

  // Fetch approval history
  const { data: history = [] } = useQuery<any[]>({
    queryKey: ["/api/expenses", reportId, "history"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/expenses/${reportId}/history`);
      return res.json();
    },
    enabled: !!reportId
  });

  // Fetch receipts
  const { data: receipts = [], isLoading: receiptsLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses", reportId, "receipts"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/expenses/${reportId}/receipts`);
      return res.json();
    },
    enabled: !!reportId
  });

  // Fetch reimbursement status
  const { data: reimbursementStatus } = useQuery<any>({
    queryKey: ["/api/expenses", reportId, "reimbursement-status"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/expenses/${reportId}/reimbursement-status`);
      return res.json();
    },
    enabled: !!reportId && report?.status === "APPROVED"
  });

  // Add expense line mutation
  const addLineMutation = useMutation({
    mutationFn: async (lineData: any) => {
      const res = await apiRequest("POST", `/api/expenses/${reportId}/lines`, lineData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", reportId] });
      toast({
        title: "Line Added",
        description: "Expense line has been added successfully.",
      });
      setIsAddLineOpen(false);
    }
  });

  // Delete expense line mutation
  const deleteLineMutation = useMutation({
    mutationFn: async (lineId: string) => {
      const res = await apiRequest("DELETE", `/api/expenses/${reportId}/lines/${lineId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", reportId] });
      toast({
        title: "Line Deleted",
        description: "Expense line has been removed.",
      });
    }
  });

  // Submit report mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/expenses/${reportId}/submit`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", reportId] });
      toast({
        title: "Report Submitted",
        description: "Expense report submitted for approval.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    }
  });

  // Approve report mutation
  const approveMutation = useMutation({
    mutationFn: async (comments?: string) => {
      const res = await apiRequest("POST", `/api/expenses/${reportId}/approve`, { comments });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", reportId] });
      toast({
        title: "Report Approved",
        description: "Expense report has been approved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Cannot approve own expense (SoD violation)",
        variant: "destructive",
      });
    }
  });

  // Reject report mutation
  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await apiRequest("POST", `/api/expenses/${reportId}/reject`, { reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", reportId] });
      toast({
        title: "Report Rejected",
        description: "Expense report has been rejected.",
      });
      setIsRejectOpen(false);
    }
  });

  // Recall report mutation
  const recallMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/expenses/${reportId}/recall`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", reportId] });
      toast({
        title: "Report Recalled",
        description: "Expense report has been recalled to draft.",
      });
    }
  });

  // Upload receipt mutation
  const uploadReceiptMutation = useMutation({
    mutationFn: async (receiptData: any) => {
      const res = await apiRequest("POST", `/api/expenses/${reportId}/receipts`, receiptData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", reportId, "receipts"] });
      toast({
        title: "Receipt Uploaded",
        description: "Receipt has been uploaded successfully.",
      });
      setIsUploadReceiptOpen(false);
    }
  });

  // Delete receipt mutation
  const deleteReceiptMutation = useMutation({
    mutationFn: async (receiptId: string) => {
      const res = await apiRequest("DELETE", `/api/expenses/${reportId}/receipts/${receiptId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", reportId, "receipts"] });
      toast({
        title: "Receipt Deleted",
        description: "Receipt has been removed.",
      });
    }
  });

  // Run OCR mutation
  const runOCRMutation = useMutation({
    mutationFn: async (receiptId: string) => {
      const res = await apiRequest("POST", `/api/expenses/${reportId}/receipts/${receiptId}/ocr`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", reportId, "receipts"] });
      toast({
        title: "OCR Complete",
        description: `Extracted: ${data.merchant} - $${data.amount} (${Math.round(data.confidence * 100)}% confidence)`,
      });
      setSelectedReceipt(data);
    }
  });

  // Trigger reimbursement mutation
  const triggerReimbursementMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/expenses/${reportId}/reimburse`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", reportId] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses", reportId, "reimbursement-status"] });
      toast({
        title: "Reimbursement Initiated",
        description: `AP Invoice ${data.apInvoice.invoiceNumber} created`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reimbursement Failed",
        description: error.message || "Failed to trigger reimbursement",
        variant: "destructive",
      });
    }
  });

  const handleReceiptUpload = () => {
    const fileName = (document.getElementById('receiptFileName') as HTMLInputElement)?.value;
    const fileUrl = (document.getElementById('receiptFileUrl') as HTMLInputElement)?.value;
    const lineId = receiptLineId;

    uploadReceiptMutation.mutate({
      fileName,
      fileUrl: fileUrl || `/uploads/receipts/${Date.now()}.jpg`,
      lineId: lineId || undefined,
      fileSize: 125000,
      mimeType: 'image/jpeg'
    });
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    // In a real implementation, this would handle the actual file
    setIsUploadReceiptOpen(true);
    toast({
      title: "File Ready",
      description: "Receipt file ready for upload",
    });
  };

  const lineColumns: SpreadsheetColumn<any>[] = [
    {
      header: "Date",
      id: "date", width: "150px",
      cell: (line) => new Date(line.date).toLocaleDateString()
    },
    {
      header: "Category",
      id: "category", width: "150px",
      cell: (line) => <Badge variant="outline">{line.category}</Badge>
    },
    {
      header: "Merchant",
      id: "merchant", width: "150px",
      cell: (line) => line.merchant || ""
    },
    {
      header: "Description",
      id: "description", width: "150px",
      cell: (line) => line.description || ""
    },
    {
      header: "Amount",
      id: "amount", width: "150px",
      cell: (line) => <span className="font-mono font-bold">${Number(line.amount).toFixed(2)}</span>
    },
    ...(report?.status === 'DRAFT' ? [{
      header: "Actions",
      id: "actions", width: "80px",
      cell: (line: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteLineMutation.mutate(line.id)}
          disabled={deleteLineMutation.isPending}
        >
          <Trash2 className="h-3 w-3 text-red-500" />
        </Button>
      )
    }] : [])
  ];

  if (reportLoading) {
    return (
      <StandardPage
        title="Loading Expense Report..."
        description="Please wait while we load the expense report."
        className="flex items-center justify-center h-64"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </StandardPage>
    );
  }

  if (!report) {
    return (
      <StandardPage title="Expense Report Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Expense report not found</p>
        </div>
      </StandardPage>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {report.title || `Expense Report ${report.reportNumber || report.id.slice(0, 8)}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {report.description || "No description provided"}
            </p>
          </div>
        </div>
        <Badge className="text-sm">
          {report.status}
        </Badge>
      </div>

      {/* Report Summary */}
      < div className="grid grid-cols-1 md:grid-cols-4 gap-4" >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">${Number(report.totalAmount || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{lines.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{new Date(report.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-sm">{report.status}</Badge>
          </CardContent>
        </Card>
      </div >

      {/* Workflow Actions */}
      {
        report.status === 'DRAFT' && (
          <div className="flex gap-2">
            <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || lines.length === 0}>
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit for Approval
            </Button>
            {lines.length === 0 && (
              <p className="text-sm text-muted-foreground flex items-center gap-2 ml-2">
                <AlertTriangle className="h-4 w-4" />
                Add at least one expense line to submit
              </p>
            )}
          </div>
        )
      }

      {
        report.status === 'SUBMITTED' && (
          <div className="flex gap-2">
            <Button onClick={() => approveMutation.mutate("")} disabled={approveMutation.isPending}>
              {approveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsRejectOpen(true)}
              disabled={rejectMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              variant="outline"
              onClick={() => recallMutation.mutate()}
              disabled={recallMutation.isPending}
            >
              Recall to Draft
            </Button>
          </div>
        )
      }

      {/* Expense Lines */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expense Lines</CardTitle>
            {report.status === 'DRAFT' && (
              <Button onClick={() => setIsAddLineOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <InteractiveSpreadsheet
            data={lines}
            columns={lineColumns}
            onChange={() => { }} containerHeight="600px"
          />
        </CardContent>
      </Card>

      {/* Approval History */}
      <Card>
        <CardHeader>
          <CardTitle>Approval History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.map((event: any, idx: number) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="mt-1">
                  {event.action === 'CREATED' && <Clock className="h-4 w-4 text-muted-foreground" />}
                  {event.action === 'SUBMITTED' && <Send className="h-4 w-4 text-blue-500" />}
                  {event.action === 'APPROVED' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {event.action === 'REJECTED' && <XCircle className="h-4 w-4 text-red-500" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{event.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()} by {event.actor}
                  </p>
                  {event.comments && (
                    <p className="text-sm mt-1 text-muted-foreground italic">&ldquo;{event.comments}&rdquo;</p>
                  )}
                  {event.reason && (
                    <p className="text-sm mt-1 text-red-600">Reason: {event.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Line Dialog */}
      <Dialog open={isAddLineOpen} onOpenChange={setIsAddLineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense Line</DialogTitle>
            <DialogDescription>Add a new expense item to this report</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <DatePicker onChange={() => { }} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={lineCategory} onValueChange={setLineCategory}>
                <SelectTrigger id="lineCategory" aria-label="Expense Category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRAVEL">Travel</SelectItem>
                  <SelectItem value="MEALS">Meals & Entertainment</SelectItem>
                  <SelectItem value="ACCOMMODATION">Accommodation</SelectItem>
                  <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
                  <SelectItem value="OFFICE">Office Supplies</SelectItem>
                  <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Merchant</label>
              <Input type="text" id="lineMerchant" placeholder="e.g., Hotel Grand" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Amount</label>
              <Input type="number" id="lineAmount" placeholder="0.00" step="0.01" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea id="lineDescription" placeholder="Purpose of expense..." />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                const date = (document.getElementById('lineDate') as HTMLInputElement)?.value;
                const category = lineCategory;
                const merchant = (document.getElementById('lineMerchant') as HTMLInputElement)?.value;
                const amount = (document.getElementById('lineAmount') as HTMLInputElement)?.value;
                const description = (document.getElementById('lineDescription') as HTMLTextAreaElement)?.value;

                addLineMutation.mutate({ date, category, merchant, amount, description });
              }}
              disabled={addLineMutation.isPending}
            >
              {addLineMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Line"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Expense Report</DialogTitle>
            <DialogDescription>Please provide a reason for rejection</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              id="rejectReason"
              placeholder="Reason for rejection (required)..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                const reason = (document.getElementById('rejectReason') as HTMLTextAreaElement)?.value;
                if (reason) {
                  rejectMutation.mutate(reason);
                } else {
                  toast({
                    title: "Reason Required",
                    description: "Please provide a reason for rejection",
                    variant: "destructive"
                  });
                }
              }}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Report"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Receipt Dialog */}
      <Dialog open={isUploadReceiptOpen} onOpenChange={setIsUploadReceiptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Receipt</DialogTitle>
            <DialogDescription>Attach a receipt image to this expense report</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">File Name</label>
              <Input
                type="text"
                id="receiptFileName"
                placeholder="e.g., dinner_receipt.jpg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">File URL (Optional)</label>
              <Input
                type="text"
                id="receiptFileUrl"
                placeholder="Will be auto-generated if not provided"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Link to Expense Line (Optional)</label>
              <Select value={receiptLineId} onValueChange={setReceiptLineId}>
                <SelectTrigger id="receiptLineId" aria-label="Link to Expense Line">
                  <SelectValue placeholder="No line selected" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No line selected</SelectItem>
                  {lines.map((line: any) => (
                    <SelectItem key={line.id} value={line.id}>
                      {line.merchant} - ${line.amount} ({line.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
              <p className="font-medium mb-1">After Upload:</p>
              <p className="text-muted-foreground text-xs">
                1. Receipt will appear in the gallery below<br />
                2. Click <strong>OCR</strong> to extract merchant, amount, and date<br />
                3. Use OCR data to auto-create expense lines
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadReceiptOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReceiptUpload}
              disabled={uploadReceiptMutation.isPending}
            >
              {uploadReceiptMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Receipt
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
