import { useState } from "react";
import { ViewAccountingModal } from "@/components/sla/ViewAccountingModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, CheckCircle, Lock, Unlock, AlertCircle, Paperclip, Upload, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function APInvoices() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [statusFilter, setStatusFilter] = useState("all");
  const [validationFilter, setValidationFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [accountingModalOpen, setAccountingModalOpen] = useState(false);
  const [holdsDialogOpen, setHoldsDialogOpen] = useState(false);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery<{ data: any[], total: number }>({
    queryKey: ["/api/ap/invoices", page, pageSize, statusFilter, validationFilter],
    queryFn: () => fetch(`/api/ap/invoices?limit=${pageSize}&offset=${(page - 1) * pageSize}`).then(r => r.json()),
  });

  const { data: holds } = useQuery({
    queryKey: ["/api/ap/invoices", selectedInvoice?.id, "holds"],
    queryFn: () => fetch(`/api/ap/invoices/${selectedInvoice?.id}/holds`).then(r => r.json()),
    enabled: !!selectedInvoice?.id && holdsDialogOpen
  });

  const validateMutation = useMutation({
    mutationFn: (invoiceId: string) =>
      fetch(`/api/ap/invoices/${invoiceId}/validate`, {
        method: "POST"
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
      toast({ title: "Invoice validated successfully" });
    },
    onError: () => {
      toast({ title: "Validation failed", variant: "destructive" });
    }
  });

  const approveMutation = useMutation({
    mutationFn: (invoiceId: string) =>
      fetch(`/api/ap/invoices/bulk-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceIds: [invoiceId] })
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
      toast({ title: "Invoice approved successfully" });
    },
    onError: () => {
      toast({ title: "Approval failed", variant: "destructive" });
    }
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async ({ invoiceId, file }: { invoiceId: string, file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/ap/invoices/${invoiceId}/attachment`, { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (res: { documentUrl: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
      setSelectedInvoice((prev: any) => ({ ...prev, documentUrl: res.documentUrl }));
      setUploadFile(null);
      toast({ title: "Attachment uploaded successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  const submitUpload = () => {
    if (selectedInvoice && uploadFile) {
      uploadAttachmentMutation.mutate({ invoiceId: selectedInvoice.id, file: uploadFile });
    }
  };

  const releaseHoldMutation = useMutation({
    mutationFn: ({ holdId, releaseCode }: { holdId: number, releaseCode: string }) =>
      fetch(`/api/ap/holds/${holdId}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ releaseCode })
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
      toast({ title: "Hold released successfully" });
      setHoldsDialogOpen(false);
    }
  });

  const filteredData = data?.data?.filter((inv: any) => {
    if (statusFilter !== "all" && inv.invoiceStatus !== statusFilter) return false;
    if (validationFilter !== "all" && inv.validationStatus !== validationFilter) return false;
    return true;
  }) || [];

  const columns: Column<any>[] = [
    { header: "Invoice #", accessorKey: "invoiceNumber", className: "font-mono font-medium" },
    { header: "Supplier", accessorKey: "supplierId", cell: (row) => row.supplier?.name || "Unknown" },
    { header: "Amount", accessorKey: "invoiceAmount", cell: (row) => `$${parseFloat(row.invoiceAmount).toFixed(2)}` },
    {
      header: "Status",
      accessorKey: "invoiceStatus",
      cell: (row) => {
        const variant = row.invoiceStatus === "Paid" ? "default" :
          row.invoiceStatus === "Approved" ? "secondary" : "outline";
        return <Badge variant={variant}>{row.invoiceStatus}</Badge>;
      }
    },
    {
      header: "Validation",
      accessorKey: "validationStatus",
      cell: (row) => {
        const variant = row.validationStatus === "Validated" ? "default" :
          row.validationStatus === "Pending" ? "outline" : "destructive";
        return <Badge variant={variant}>{row.validationStatus}</Badge>;
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEntityId(row.id);
              setAccountingModalOpen(true);
            }}
            title="View Accounting"
          >
            <FileText className="h-4 w-4" />
          </Button>
          {row.validationStatus !== "VALIDATED" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                validateMutation.mutate(row.id);
              }}
              title="Validate Invoice"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
          )}
          {row.approvalStatus === "REQUIRED" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                approveMutation.mutate(row.id);
              }}
              title="Approve Invoice"
            >
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInvoice(row);
              setHoldsDialogOpen(true);
            }}
            title="View Holds"
          >
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInvoice(row);
              setUploadFile(null);
              setAttachmentDialogOpen(true);
            }}
            title="Manage Attachment"
          >
            <Paperclip className={`h-4 w-4 ${row.documentUrl ? 'text-blue-600' : 'text-gray-400'}`} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <StandardPage
      title="Invoice Workbench"
      description="Manage vendor invoices, validation, and holds"
      breadcrumbs={[
        { label: "Finance", href: "/finance" },
        { label: "AP", href: "/finance/ap" },
        { label: "Invoices" }
      ]}
      actions={
        <Button onClick={() => setLocation("/finance/ap/invoices/new")}>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={validationFilter} onValueChange={setValidationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Validation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Validation Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Validated">Validated</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <StandardTable
          data={filteredData}
          columns={columns}
          totalItems={filteredData.length}
          page={page}
          onPageChange={setPage}
          pageSize={pageSize}
          isLoading={isLoading}
          filterColumn="invoiceNumber"
          filterPlaceholder="Search invoice #..."
          onRowClick={(item) => setLocation(`/finance/ap/invoices/${item.id}`)}
        />
      </div>

      <ViewAccountingModal
        open={accountingModalOpen}
        onOpenChange={setAccountingModalOpen}
        entityId={selectedEntityId}
      />

      {/* Holds Dialog */}
      <Dialog open={holdsDialogOpen} onOpenChange={setHoldsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Holds</DialogTitle>
            <DialogDescription>
              Invoice: {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {holds && holds.length > 0 ? (
              <div className="space-y-3">
                {holds.map((hold: any) => (
                  <div key={hold.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-orange-500" />
                          <span className="font-semibold">{hold.hold_lookup_code}</span>
                          <Badge variant={!hold.release_lookup_code ? "destructive" : "secondary"}>
                            {!hold.release_lookup_code ? "Active" : "Released"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{hold.hold_reason}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(hold.hold_date).toLocaleString()}
                        </p>
                      </div>
                      {!hold.release_lookup_code && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => releaseHoldMutation.mutate({
                            holdId: hold.id,
                            releaseCode: "MANUAL_RELEASE"
                          })}
                        >
                          <Unlock className="h-4 w-4 mr-1" />
                          Release
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No holds on this invoice</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHoldsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attachment Dialog */}
      <Dialog open={attachmentDialogOpen} onOpenChange={setAttachmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice Attachment</DialogTitle>
            <DialogDescription>
              Invoice: {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedInvoice?.documentUrl ? (
              <div className="flex flex-col items-center justify-center p-6 border rounded-md bg-slate-50">
                <FileText className="h-12 w-12 text-blue-500 mb-2" />
                <p className="text-sm font-medium mb-4">Document Attachment Available</p>
                <Button variant="outline" onClick={() => window.open(selectedInvoice.documentUrl, '_blank')}>
                  <Eye className="h-4 w-4 mr-2" /> View Document
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-md">
                <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No attachment uploaded yet.</p>
              </div>
            )}

            <div className="space-y-2 mt-4">
              <Label htmlFor="file-upload">Upload New Attachment</Label>
              <div className="flex gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Button
                  onClick={submitUpload}
                  disabled={!uploadFile || uploadAttachmentMutation.isPending}
                >
                  {uploadAttachmentMutation.isPending ? "Uploading..." : <><Upload className="h-4 w-4 mr-2" /> Upload</>}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-center">Supported formats: PDF, JPG, PNG, DOC/DOCX (Max 10MB)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttachmentDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StandardPage>
  );
}
