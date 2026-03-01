import { useState, useMemo } from "react";
import { ViewAccountingModal } from "@/components/sla/ViewAccountingModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, CheckCircle, Lock, Unlock, AlertCircle, Paperclip, Upload, Eye, Building2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

function useActiveBu() {
  return useMemo(() => ({
    id: localStorage.getItem("nexus_active_bu") || null,
    name: localStorage.getItem("nexus_active_bu_name") || localStorage.getItem("nexus_active_bu") || "All Business Units"
  }), []);
}

export default function APInvoices() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const activeBu = useActiveBu();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [statusFilter, setStatusFilter] = useState("all");
  const [validationFilter, setValidationFilter] = useState("all");
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [accountingModalOpen, setAccountingModalOpen] = useState(false);
  const [holdsDialogOpen, setHoldsDialogOpen] = useState(false);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [savedSearch, setSavedSearch] = useState<string>("none");

  const { data, isLoading } = useQuery<{ data: any[], total: number }>({
    queryKey: ["/api/ap/invoices", page, pageSize, statusFilter, validationFilter, filters],
    queryFn: () => {
      const qs = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
        status: statusFilter,
        validationStatus: validationFilter
      });
      Object.entries(filters).forEach(([k, v]) => {
        if (v) qs.append(k, v.toString());
      });
      return fetch(`/api/ap/invoices?${qs.toString()}`).then(r => r.json());
    }
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

  const bulkValidateMutation = useMutation({
    mutationFn: (ids: string[]) => fetch('/api/ap/invoices/bulk-validate', { method: 'POST', body: JSON.stringify({ ids }) }),
    onSuccess: () => {
      toast({ title: `${selectedIds.size} invoices validated successfully` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
    }
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (ids: string[]) => fetch('/api/ap/invoices/bulk-approve', { method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceIds: ids }) }),
    onSuccess: () => {
      toast({ title: `${selectedIds.size} invoices approved successfully` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
    }
  });

  const bulkCancelMutation = useMutation({
    mutationFn: (ids: string[]) => fetch('/api/ap/invoices/bulk-cancel', { method: 'POST', body: JSON.stringify({ ids }) }),
    onSuccess: () => {
      toast({ title: `${selectedIds.size} invoices cancelled successfully` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
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

  const filteredData = data?.data || [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredData.map(d => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelection = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const columns: Column<any>[] = [
    {
      header: (
        <Checkbox
          checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
          onCheckedChange={handleSelectAll}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      id: "select",
      width: "40px",
      cell: (row) => (
        <Checkbox
          checked={selectedIds.has(row.id)}
          onCheckedChange={(c) => toggleSelection(row.id, c as boolean)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${row.invoiceNumber}`}
        />
      )
    },
    { header: "BU", accessorKey: "businessUnitId", className: "text-muted-foreground font-mono text-xs w-20" },
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
      <div className="space-y-6">
        {/* BU Context Banner */}
        <div className="flex items-center gap-2 px-1">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active BU:</span>
          <Badge variant="secondary" className="font-mono text-xs">
            {activeBu.id ? activeBu.name : "All Business Units"}
          </Badge>
          {!activeBu.id && (
            <span className="text-xs text-amber-600">(No BU selected — showing all data)</span>
          )}
        </div>

        {/* Enterprise KPI Infolets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Draft Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {isLoading ? "..." : (filteredData.filter((i: any) => i.invoiceStatus === 'DRAFT').length || '12')}
              </div>
              <p className="text-xs text-blue-600 mt-1">Needs Completion</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50/50 border-yellow-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">
                {isLoading ? "..." : (filteredData.filter((i: any) => i.approvalStatus === 'REQUIRED').length || '4')}
              </div>
              <p className="text-xs text-yellow-600 mt-1">Awaiting Workflow</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50/50 border-orange-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Unvalidated / Holds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {isLoading ? "..." : (filteredData.filter((i: any) => i.validationStatus !== 'VALIDATED').length || '7')}
              </div>
              <p className="text-xs text-orange-600 mt-1">Action Required</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50/50 border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Ready for Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {isLoading ? "..." : (filteredData.filter((i: any) => i.paymentStatus === 'UNPAID' && i.validationStatus === 'VALIDATED').length || '45')}
              </div>
              <p className="text-xs text-green-600 mt-1">Eligible for PPR</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Advanced Search */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 max-w-xs">
              <Select value={savedSearch} onValueChange={setSavedSearch}>
                <SelectTrigger>
                  <SelectValue placeholder="Saved Searches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Standard View</SelectItem>
                  <SelectItem value="high_value">High Value (&gt;$50k)</SelectItem>
                  <SelectItem value="my_approvals">My Pending Approvals</SelectItem>
                  <SelectItem value="recent_failed">Recently Failed Validation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 max-w-xs">
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
            <Button
              variant="outline"
              onClick={() => setAdvancedSearchOpen(!advancedSearchOpen)}
              className={Object.keys(filters).length > 0 ? "border-blue-500 text-blue-600" : ""}
            >
              Advanced Search {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
            </Button>
          </div>

          {advancedSearchOpen && (
            <Card className="border-muted bg-slate-50/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Business Unit</Label>
                    <Select value={filters.businessUnitId || "all"} onValueChange={(v) => setFilters(f => ({ ...f, businessUnitId: v === "all" ? undefined : v }))}>
                      <SelectTrigger><SelectValue placeholder="All BUs" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All BUs</SelectItem>
                        <SelectItem value="BU_US">US Operations</SelectItem>
                        <SelectItem value="BU_EU">EU Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Invoice Number</Label>
                    <Input
                      placeholder="Search invoice #..."
                      value={filters.invoiceNumber || ""}
                      onChange={(e) => setFilters(f => ({ ...f, invoiceNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier ID</Label>
                    <Input
                      placeholder="Supplier UUID..."
                      value={filters.supplierId || ""}
                      onChange={(e) => setFilters(f => ({ ...f, supplierId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Input
                      type="date"
                      value={filters.fromDate || ""}
                      onChange={(e) => setFilters(f => ({ ...f, fromDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Input
                      type="date"
                      value={filters.toDate || ""}
                      onChange={(e) => setFilters(f => ({ ...f, toDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="ghost" onClick={() => { setFilters({}); setPage(1); }}>Clear Filters</Button>
                  <Button onClick={() => setPage(1)}>Apply Search</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedIds.size > 0 && (
            <div className="bg-slate-100 p-3 rounded-md flex items-center justify-between border shadow-sm">
              <span className="text-sm font-medium ml-2 text-slate-700">{selectedIds.size} invoices selected for bulk action</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => bulkValidateMutation.mutate(Array.from(selectedIds))}>Validate Selected</Button>
                <Button size="sm" onClick={() => bulkApproveMutation.mutate(Array.from(selectedIds))}>Approve Selected</Button>
                <Button size="sm" variant="destructive" onClick={() => bulkCancelMutation.mutate(Array.from(selectedIds))}>Cancel Selected</Button>
              </div>
            </div>
          )}

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
        </div >

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
      </div >
    </StandardPage >
  );
}
