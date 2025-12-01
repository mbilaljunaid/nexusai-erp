import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function APInvoices() {
  const { toast } = useToast();
  const [newInvoice, setNewInvoice] = useState({ invoiceNumber: "", vendorId: "", invoiceAmount: "", status: "draft" });

  const { data: invoices = [], isLoading } = useQuery<any[]>({ 
    queryKey: ["/api/finance/ap-invoices"],
    queryFn: () => fetch("/api/finance/ap-invoices").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/finance/ap-invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/ap-invoices"] });
      setNewInvoice({ invoiceNumber: "", vendorId: "", invoiceAmount: "", status: "draft" });
      toast({ title: "Invoice created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/finance/ap-invoices/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/ap-invoices"] });
      toast({ title: "Invoice deleted" });
    },
  });

  const total = invoices.reduce((sum, i: any) => sum + parseFloat(i.invoiceAmount || 0), 0);
  const paid = invoices.reduce((sum, i: any) => sum + parseFloat(i.paidAmount || 0), 0);
  const pending = total - paid;

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    submitted: "default",
    approved: "default",
    paid: "outline",
    rejected: "destructive",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Accounts Payable
        </h1>
        <p className="text-muted-foreground">Manage vendor invoices and payments</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total AP</p>
            <p className="text-2xl font-bold">${total.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Paid</p>
            <p className="text-2xl font-bold text-green-600">${paid.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Pending</p>
            <p className="text-2xl font-bold text-orange-600">${pending.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-invoice">
        <CardHeader><CardTitle className="text-base">Create Invoice</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Invoice #" value={newInvoice.invoiceNumber} onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })} data-testid="input-invoice-number" />
            <Input placeholder="Vendor ID" value={newInvoice.vendorId} onChange={(e) => setNewInvoice({ ...newInvoice, vendorId: e.target.value })} data-testid="input-vendor-id" />
            <Input placeholder="Amount" type="number" value={newInvoice.invoiceAmount} onChange={(e) => setNewInvoice({ ...newInvoice, invoiceAmount: e.target.value })} data-testid="input-amount" />
            <Select value={newInvoice.status} onValueChange={(v) => setNewInvoice({ ...newInvoice, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
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
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-center py-4">Loading...</p>
            ) : invoices.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No invoices</p>
            ) : (
              invoices.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between p-3 border rounded hover-elevate" data-testid={`invoice-${inv.id}`}>
                  <div className="flex-1">
                    <p className="font-semibold">{inv.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{inv.vendorId}</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <p className="font-semibold">${inv.invoiceAmount}</p>
                    <Badge variant={statusColors[inv.status] || "default"}>{inv.status}</Badge>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(inv.id)} data-testid={`button-delete-${inv.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
