import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2, Receipt, BadgeDollarSign, Wallet, Activity, ShoppingCart } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

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
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">POS Terminal & Checkout</h1>
          <p className="text-muted-foreground mt-1">In-store sales orchestration, payment processing, and real-time inventory decrementation</p>
        </div>
      }
    >
      <DashboardWidget title="Total Transactions" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <Receipt className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Processed today</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Gross Sales" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100/50">
            <BadgeDollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">${totalSales.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Daily terminal revenue</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Card Volume" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-indigo-100/50">
            <CreditCard className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-indigo-600">{cardPayments}</div>
            <p className="text-xs text-muted-foreground">Digital payments</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="AOV" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-amber-100/50">
            <Wallet className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">${transactions.length > 0 ? (totalSales / transactions.length).toFixed(2) : 0}</div>
            <p className="text-xs text-muted-foreground">Average basket value</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Process Register Sale" colSpan={4} icon={Plus}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Terminal</label>
            <Input placeholder="TerminalID" value={newSale.terminalId} disabled data-testid="input-terminal" className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product SKU</label>
            <Input placeholder="SKU / Barcode" value={newSale.productId} onChange={(e) => setNewSale({ ...newSale, productId: e.target.value })} data-testid="input-prodid" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantity</label>
            <Input placeholder="Qty" type="number" value={newSale.quantity} onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })} data-testid="input-qty" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Method</label>
            <Select value={newSale.paymentType} onValueChange={(v) => setNewSale({ ...newSale, paymentType: v })}>
              <SelectTrigger data-testid="select-payment"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="wallet">Digital Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newSale)} disabled={createMutation.isPending || !newSale.productId} className="w-full" data-testid="button-process">
            {createMutation.isPending ? <Activity className="h-4 w-4 animate-spin" /> : "Complete Transaction"}
          </Button>
        </div>
      </DashboardWidget>

      <DashboardWidget colSpan={4} title="Register Tape & Journal" icon={ShoppingCart}>
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-medium">No transactions recorded on this terminal today</p>
          ) : (
            transactions.map((t: any) => (
              <div key={t.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4" data-testid={`txn-${t.id}`}>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{t.productId}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-tighter">
                      {t.paymentType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.quantity} unit(s) × ${(t.amount / t.quantity).toFixed(2)} = ${t.amount.toFixed(2)}</p>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <div className="text-right mr-4">
                    <p className="text-xs font-bold font-mono tracking-tighter">#{t.id.substring(0, 8)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Terminal {t.terminalId}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(t.id)} data-testid={`button-void-${t.id}`}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DashboardWidget>
    </StandardDashboard>
  );
}
