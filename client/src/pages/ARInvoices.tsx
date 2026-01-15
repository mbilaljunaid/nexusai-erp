import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { ArInvoice } from "@shared/schema";
import { CreditMemoDialog } from "@/components/billing/CreditMemoDialog";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function ARInvoices() {
  const { toast } = useToast();
  const [newInvoice, setNewInvoice] = useState({ invoiceNumber: "", customerId: "", invoiceAmount: "", status: "issued" });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  // State for Credit Memo Dialog
  const [selectedInvoiceForCredit, setSelectedInvoiceForCredit] = useState<ArInvoice | null>(null);

  const { data, isLoading } = useQuery<{ data: ArInvoice[], total: number }>({
    queryKey: ["/api/ar/invoices", page, pageSize],
    queryFn: () => fetch(`/api/ar/invoices?limit=${pageSize}&offset=${(page - 1) * pageSize}`).then(r => r.json()),
  });

  const invoices = data?.data || [];
  const totalCount = data?.total || 0;

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/ar/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
      setNewInvoice({ invoiceNumber: "", customerId: "", invoiceAmount: "", status: "issued" });
      toast({ title: "Invoice created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/ar/invoices/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
      toast({ title: "Invoice deleted" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/billing/invoices/${id}/approve`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
      toast({ title: "Invoice Approved" });
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
      header: "Invoice #",
      accessorKey: "invoiceNumber",
      className: "font-semibold"
    },
    {
      header: "Customer",
      accessorKey: "customerId"
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
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <CreditCard className="w-8 h-8" />
          Accounts Receivable
        </h1>
        <p className="text-muted-foreground">Track customer payments and collections</p>
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
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Invoice #" value={newInvoice.invoiceNumber} onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })} data-testid="input-invoice-number" />
            <Input placeholder="Customer ID" value={newInvoice.customerId} onChange={(e) => setNewInvoice({ ...newInvoice, customerId: e.target.value })} data-testid="input-customer-id" />
            <Input placeholder="Amount" type="number" value={newInvoice.invoiceAmount} onChange={(e) => setNewInvoice({ ...newInvoice, invoiceAmount: e.target.value })} data-testid="input-amount" />
            <Select value={newInvoice.status} onValueChange={(v) => setNewInvoice({ ...newInvoice, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newInvoice)} disabled={createMutation.isPending || !newInvoice.invoiceNumber} className="w-full" data-testid="button-create-invoice">
            <Plus className="w-4 h-4 mr-2" /> Create Invoice
          </Button>
        </CardContent>
      </Card>

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
      )
      }
    </div >
  );
}
