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

export default function POSTerminalCheckout() {
  const { toast } = useToast();
  const [newSale, setNewSale] = useState({ terminalId: "T001", productId: "", quantity: "1", paymentType: "card" });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/pos-transactions"],
    queryFn: () => fetch("/api/pos-transactions").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/pos-transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos-transactions"] });
      setNewSale({ terminalId: "T001", productId: "", quantity: "1", paymentType: "card" });
      toast({ title: "Transaction processed" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/pos-transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos-transactions"] });
      toast({ title: "Transaction voided" });
    },
  });

  const totalSales = transactions.reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);
  const cardPayments = transactions.filter((t: any) => t.paymentType === "card").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          POS Terminal & Checkout
        </h1>
        <p className="text-muted-foreground mt-2">In-store sales, payments, loyalty accrual, and cash handling</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Card Transactions</p>
            <p className="text-2xl font-bold text-blue-600">{cardPayments}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Transaction</p>
            <p className="text-2xl font-bold">${transactions.length > 0 ? (totalSales / transactions.length).toFixed(2) : 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-sale">
        <CardHeader><CardTitle className="text-base">Process Sale</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Terminal" value={newSale.terminalId} disabled data-testid="input-terminal" className="text-sm" />
            <Input placeholder="Product ID" value={newSale.productId} onChange={(e) => setNewSale({ ...newSale, productId: e.target.value })} data-testid="input-prodid" className="text-sm" />
            <Input placeholder="Quantity" type="number" value={newSale.quantity} onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Select value={newSale.paymentType} onValueChange={(v) => setNewSale({ ...newSale, paymentType: v })}>
              <SelectTrigger data-testid="select-payment" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled={createMutation.isPending || !newSale.productId} size="sm" data-testid="button-process">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Today's Transactions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : transactions.length === 0 ? <p className="text-muted-foreground text-center py-4">No transactions</p> : transactions.map((t: any) => (
            <div key={t.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`txn-${t.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{t.productId}</p>
                <p className="text-xs text-muted-foreground">{t.quantity} × ${(t.amount / t.quantity).toFixed(2)} = ${t.amount.toFixed(2)} ({t.paymentType})</p>
              </div>
              <Button size="icon" variant="ghost" data-testid={`button-void-${t.id}`} className="h-7 w-7">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
