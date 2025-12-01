import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TelecomBillingRevenue() {
  const { toast } = useToast();
  const [newInvoice, setNewInvoice] = useState({ invoiceId: "", subscriberId: "", amount: "50.00", usageType: "data", status: "pending" });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["/api/telecom-invoices"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/telecom-invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telecom-invoices"] });
      setNewInvoice({ invoiceId: "", subscriberId: "", amount: "50.00", usageType: "data", status: "pending" });
      toast({ title: "Invoice created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/telecom-invoices/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telecom-invoices"] });
      toast({ title: "Invoice deleted" });
    }
  });

  const paid = invoices.filter((i: any) => i.status === "paid").length;
  const totalRevenue = invoices.reduce((sum: number, i: any) => sum + (parseFloat(i.amount) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Billing & Revenue Management
        </h1>
        <p className="text-muted-foreground mt-2">Rate plans, usage capture, invoicing, and payment processing</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Invoices</p>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold text-green-600">{paid}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{invoices.length - paid}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-invoice">
        <CardHeader><CardTitle className="text-base">Create Invoice</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Invoice ID" value={newInvoice.invoiceId} onChange={(e) => setNewInvoice({ ...newInvoice, invoiceId: e.target.value })} data-testid="input-invid" className="text-sm" />
            <Input placeholder="Subscriber ID" value={newInvoice.subscriberId} onChange={(e) => setNewInvoice({ ...newInvoice, subscriberId: e.target.value })} data-testid="input-subid" className="text-sm" />
            <Input placeholder="Amount" type="number" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })} data-testid="input-amt" className="text-sm" />
            <Select value={newInvoice.usageType} onValueChange={(v) => setNewInvoice({ ...newInvoice, usageType: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="voice">Voice</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newInvoice)} disabled={createMutation.isPending || !newInvoice.invoiceId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Invoices</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : invoices.length === 0 ? <p className="text-muted-foreground text-center py-4">No invoices</p> : invoices.map((i: any) => (
            <div key={i.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`invoice-${i.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{i.invoiceId}</p>
                <p className="text-xs text-muted-foreground">{i.subscriberId} • {i.usageType} • ${i.amount}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={i.status === "paid" ? "default" : "secondary"} className="text-xs">{i.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(i.id)} data-testid={`button-delete-${i.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
