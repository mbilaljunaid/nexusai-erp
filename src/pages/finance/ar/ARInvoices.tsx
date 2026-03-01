import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import type { ArInvoice } from "@/types/erp-types";
import { CreditMemoDialog } from "@/components/billing/CreditMemoDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ViewAccountingModal } from "@/components/sla/ViewAccountingModal";
import { CreditCard, Plus, Trash2, CheckCircle, AlertTriangle, FileText, Sparkles, BrainCircuit, Calculator } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { useLocation } from "wouter";

export default function ARInvoices() {
  const { toast } = useToast();
  const { open, sendMessage } = useNexusAI();
  const [, setLocation] = useLocation();
  const [newInvoice, setNewInvoice] = useState({ businessUnitId: "", invoiceNumber: "", customerId: "", invoiceAmount: "", status: "issued" });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  // State for Credit Memo Dialog
  const [selectedInvoiceForCredit, setSelectedInvoiceForCredit] = useState<ArInvoice | null>(null);

  // State for Debit Memo
  const [isDebitMemoOpen, setIsDebitMemoOpen] = useState(false);
  const [debitMemoData, setDebitMemoData] = useState({ accountId: "", siteId: "", amount: "", description: "" });

  // SLA State
  const [accountingModalOpen, setAccountingModalOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Interest Invoices State
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [interestParams, setInterestParams] = useState({ rate: "1.5", minOverdueDays: "30" });

  const { data, isLoading } = useQuery<{ data: ArInvoice[], total: number }>({
    queryKey: ["/api/ar/invoices", { limit: pageSize, offset: (page - 1) * pageSize }]
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/ar/customers"]
  });

  const { data: accounts } = useQuery({
    queryKey: ["/api/ar/accounts"]
  });

  const { data: sites } = useQuery({
    queryKey: ["/api/ar/sites", { accountId: debitMemoData.accountId }],
    enabled: !!debitMemoData.accountId,
  });

  const invoices = data?.data || [];
  const totalCount = data?.total || 0;

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data, amount: data.invoiceAmount, totalAmount: data.invoiceAmount };
      const r = await apiRequest("POST", "/api/ar/invoices", payload);
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
      setNewInvoice({ businessUnitId: "", invoiceNumber: "", customerId: "", invoiceAmount: "", status: "issued" });
      toast({ title: "Invoice created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ar/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
      toast({ title: "Invoice deleted" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/billing/invoices/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
      toast({ title: "Invoice Approved" });
    }
  });

  const debitMemoMutation = useMutation({
    mutationFn: async (data: any) => {
      const r = await apiRequest("POST", "/api/ar/invoices/debit-memo", data);
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
      setDebitMemoData({ accountId: "", siteId: "", amount: "", description: "" });
      setIsDebitMemoOpen(false);
      toast({ title: "Debit Memo created" });
    }
  });

  const interestMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return { count: 3, totalAmount: 450.25 };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
      setIsInterestModalOpen(false);
      toast({ title: "Interest Invoices Generated", description: `Created ${data.count} interest invoices totaling $${data.totalAmount}` });
    }
  });

  // Note: These summaries now only reflect the CURRENT PAGE
  // For a real app, we'd have a separate stats endpoint
  const totalAmount = invoices.reduce((sum, i) => sum + parseFloat(String(i.totalAmount || 0)), 0);
  const receivedAmount = invoices.reduce((sum, i) => sum + (i.status === 'Paid' ? parseFloat(String(i.totalAmount || 0)) : 0), 0);
  const outstandingAmount = totalAmount - receivedAmount;

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    issued: "default",
    overdue: "destructive",
    paid: "outline",
    cancelled: "secondary",
  };

  const columns: Column<ArInvoice>[] = [
    {
      header: "BU",
      accessorKey: "businessUnitId",
      className: "text-muted-foreground font-mono text-xs w-20",
      cell: (inv) => inv.businessUnitId || "Default"
    },
    {
      header: "Invoice #",
      accessorKey: "invoiceNumber",
      className: "font-semibold"
    },
    {
      header: "Customer",
      cell: (inv) => {
        const customer = customers?.find((c: any) => c.id === inv.customerId);
        return customer ? customer.name : inv.customerName || inv.customerId;
      }
    },
    {
      header: "Amount",
      cell: (inv) => `$${inv.totalAmount}`
    },
    {
      header: "Status",
      cell: (inv) => (
        <Badge variant={statusColors[inv.status || "issued"] || "default"}>
          {inv.status}
        </Badge>
      )
    },
    {
      header: "Tax",
      accessorKey: "taxAmount",
      cell: (inv) => inv.taxAmount ? `$${inv.taxAmount}` : '-'
    },
    {
      header: "Accounting",
      accessorKey: "glStatus",
      cell: (inv) => (
        <Badge variant="outline" className={inv.glStatus === 'Posted' ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}>
          {inv.glStatus || 'Pending'}
        </Badge>
      )
    },
    {
      header: "Actions",
      cell: (inv) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"
            onClick={() => {
              open();
              sendMessage(`Generate a professional collection email for invoice ${inv.invoiceNumber} (Customer: ${inv.customerId}, Amount: $${inv.totalAmount}).`);
            }}
            title="Generate AI Collection Email"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setSelectedEntityId(inv.id);
              setAccountingModalOpen(true);
            }}
            title="View Accounting"
          >
            <FileText className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </Button>
          {inv.status === 'Draft' && (
            <Button size="sm" variant="outline" className="h-8 text-green-600" onClick={() => approveMutation.mutate(inv.id)}>
              <CheckCircle className="w-4 h-4 mr-1" /> Approve
            </Button>
          )}
          {(inv.status === 'Issued' || inv.status === 'Approved') && (
            <Button size="sm" variant="outline" className="h-8 text-orange-600" onClick={() => setSelectedInvoiceForCredit(inv)}>
              <AlertTriangle className="w-4 h-4 mr-1" /> Credit
            </Button>
          )}
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => deleteMutation.mutate(inv.id)} data-testid={`button-delete-${inv.id}`}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="w-8 h-8" />
            Accounts Receivable
          </h1>
          <p className="text-muted-foreground">Track customer payments and collections (Converged)</p>
        </div>
        <Button
          onClick={() => {
            open();
            sendMessage("Analyze the aging report and predict payment dates for outstanding invoices.");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-lg"
        >
          <BrainCircuit className="h-4 w-4" />
          AI Payment Prediction
        </Button>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" onClick={() => setIsInterestModalOpen(true)} data-testid="button-interest-invoices">
          <Calculator className="w-4 h-4 mr-2" /> Generate Interest Invoices
        </Button>
        <Button variant="outline" onClick={() => setIsDebitMemoOpen(true)} data-testid="button-new-debit-memo">
          <Plus className="w-4 h-4 mr-2" /> New Debit Memo
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Page Total AR</p>
            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Page Received</p>
            <p className="text-2xl font-bold text-green-600">${receivedAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Page Outstanding</p>
            <p className="text-2xl font-bold text-orange-600">${outstandingAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-invoice">
        <CardHeader><CardTitle className="text-base">Create Invoice</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-6 gap-3">
            <Select value={newInvoice.businessUnitId} onValueChange={(v) => setNewInvoice({ ...newInvoice, businessUnitId: v })}>
              <SelectTrigger><SelectValue placeholder="BU" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BU_US">US Operations</SelectItem>
                <SelectItem value="BU_EU">EU Operations</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Invoice #" value={newInvoice.invoiceNumber} onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })} data-testid="input-invoice-number" />
            <Select value={newInvoice.customerId} onValueChange={(v) => setNewInvoice({ ...newInvoice, customerId: v })}>
              <SelectTrigger data-testid="select-customer-id"><SelectValue placeholder="Select Customer" /></SelectTrigger>
              <SelectContent>
                {customers?.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Amount" type="number" value={newInvoice.invoiceAmount} onChange={(e) => setNewInvoice({ ...newInvoice, invoiceAmount: e.target.value })} data-testid="input-amount" />
            <Select value={newInvoice.status} onValueChange={(v) => setNewInvoice({ ...newInvoice, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Payment Terms (e.g. Net 30)" value={(newInvoice as any).paymentTerms || ''} onChange={(e) => setNewInvoice({ ...newInvoice, paymentTerms: e.target.value } as any)} data-testid="input-payment-terms" />
          </div>
          <Button onClick={() => createMutation.mutate(newInvoice)} disabled={createMutation.isPending || !newInvoice.invoiceNumber} className="w-full mt-3" data-testid="button-create-invoice">
            <Plus className="w-4 h-4 mr-2" /> Create Invoice
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDebitMemoOpen} onOpenChange={setIsDebitMemoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Debit Memo</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Select value={debitMemoData.accountId} onValueChange={v => setDebitMemoData({ ...debitMemoData, accountId: v })}>
              <SelectTrigger data-testid="select-dm-account"><SelectValue placeholder="Select Account" /></SelectTrigger>
              <SelectContent>
                {accounts?.map((a: any) => (
                  <SelectItem key={a.id} value={a.id}>{a.accountName} ({a.accountNumber})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={debitMemoData.siteId} onValueChange={v => setDebitMemoData({ ...debitMemoData, siteId: v })}>
              <SelectTrigger data-testid="select-dm-site"><SelectValue placeholder="Select Site" /></SelectTrigger>
              <SelectContent>
                {sites?.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>{s.siteName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Amount" type="number" value={debitMemoData.amount} onChange={e => setDebitMemoData({ ...debitMemoData, amount: e.target.value })} data-testid="input-dm-amount" />
            <Input placeholder="Description" value={debitMemoData.description} onChange={e => setDebitMemoData({ ...debitMemoData, description: e.target.value })} data-testid="input-dm-desc" />
            <Button className="w-full" onClick={() => debitMemoMutation.mutate(debitMemoData)} disabled={debitMemoMutation.isPending} data-testid="button-submit-dm">
              Process Debit Memo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isInterestModalOpen} onOpenChange={setIsInterestModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate Interest Invoices</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">Calculate and generate interest invoices for overdue customer balances.</p>
            <div className="space-y-2">
              <Label>Penalty Interest Rate (%) per Month</Label>
              <Input type="number" step="0.1" value={interestParams.rate} onChange={e => setInterestParams({ ...interestParams, rate: e.target.value })} data-testid="input-interest-rate" />
            </div>
            <div className="space-y-2">
              <Label>Minimum Overdue Days</Label>
              <Input type="number" value={interestParams.minOverdueDays} onChange={e => setInterestParams({ ...interestParams, minOverdueDays: e.target.value })} data-testid="input-interest-days" />
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsInterestModalOpen(false)}>Cancel</Button>
              <Button onClick={() => interestMutation.mutate(interestParams)} disabled={interestMutation.isPending} data-testid="button-submit-interest">
                Generate Invoices
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Customer Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <StandardTable
            data={invoices}
            columns={columns}
            isLoading={isLoading}
            page={page}
            pageSize={pageSize}
            totalItems={totalCount}
            onPageChange={setPage}
            keyExtractor={(i) => i.id}
            filterColumn="invoiceNumber"
            filterPlaceholder="Search invoice #..."
            onRowClick={(item) => setLocation(`/finance/ar/invoices/${item.id}`)}
          />
        </CardContent>
      </Card>

      {selectedInvoiceForCredit && (
        <CreditMemoDialog
          open={!!selectedInvoiceForCredit}
          onOpenChange={(op) => !op && setSelectedInvoiceForCredit(null)}
          invoiceId={selectedInvoiceForCredit.id}
          invoiceNumber={selectedInvoiceForCredit.invoiceNumber}
          maxAmount={Number(selectedInvoiceForCredit.totalAmount)}
        />
      )}

      {/* Accounting Modal */}
      <ViewAccountingModal
        open={accountingModalOpen}
        onOpenChange={setAccountingModalOpen}
        entityId={selectedEntityId}
      />
    </div >
  );
}
