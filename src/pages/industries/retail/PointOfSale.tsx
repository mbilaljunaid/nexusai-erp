import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Trash2, CreditCard } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PointOfSale() {
  const { toast } = useToast();
  const [newSale, setNewSale] = useState({ saleId: "", items: "1", amount: "0", tender: "card", status: "completed" });

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["/api/pos-sales"],
    queryFn: () => fetch("/api/pos-sales").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/pos-sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos-sales"] });
      setNewSale({ saleId: "", items: "1", amount: "0", tender: "card", status: "completed" });
      toast({ title: "Sale recorded" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/pos-sales/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos-sales"] });
      toast({ title: "Sale deleted" });
    },
  });

  const totalSales = sales.reduce((sum: number, s: any) => sum + (parseFloat(s.amount) || 0), 0);
  const cardSales = sales.filter((s: any) => s.tender === "card").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Point of Sale (POS) Terminal
        </h1>
        <p className="text-muted-foreground mt-2">In-store sales, tenders, receipts, and shift closure</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">{sales.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Sales Revenue</p>
            <p className="text-2xl font-bold">${(totalSales / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Card Payments</p>
            <p className="text-2xl font-bold text-blue-600">{cardSales}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Transaction</p>
            <p className="text-2xl font-bold">${sales.length > 0 ? (totalSales / sales.length).toFixed(0) : 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-sale">
        <CardHeader><CardTitle className="text-base">Record Sale</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Sale ID" value={newSale.saleId} onChange={(e) => setNewSale({ ...newSale, saleId: e.target.value })} data-testid="input-saleid" className="text-sm" />
            <Input placeholder="Items" type="number" value={newSale.items} onChange={(e) => setNewSale({ ...newSale, items: e.target.value })} data-testid="input-items" className="text-sm" />
            <Input placeholder="Amount" type="number" value={newSale.amount} onChange={(e) => setNewSale({ ...newSale, amount: e.target.value })} data-testid="input-amount" className="text-sm" />
            <Select value={newSale.tender} onValueChange={(v) => setNewSale({ ...newSale, tender: v })}>
              <SelectTrigger data-testid="select-tender" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="mobile">Mobile Wallet</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled={createMutation.isPending || !newSale.saleId} size="sm" data-testid="button-record-sale">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Sales</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : sales.length === 0 ? <p className="text-muted-foreground text-center py-4">No sales</p> : sales.map((s: any) => (
            <div key={s.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`sale-${s.id}`}>
              <div>
                <p className="font-semibold">{s.saleId}</p>
                <p className="text-xs text-muted-foreground">{s.items} items • ${s.amount} • {s.tender}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="default" className="text-xs">{s.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${s.id}`} className="h-7 w-7">
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
