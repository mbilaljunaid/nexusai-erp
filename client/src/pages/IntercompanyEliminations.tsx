import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GitMerge, Plus, Trash2, Link2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function IntercompanyEliminations() {
  const { toast } = useToast();
  const [newTx, setNewTx] = useState({ entity: "Entity A", partner: "Entity B", amount: "", currency: "USD", status: "pending" });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/intercompany-transactions"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/intercompany-transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intercompany-transactions"] });
      setNewTx({ entity: "Entity A", partner: "Entity B", amount: "", currency: "USD", status: "pending" });
      toast({ title: "Intercompany transaction created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/intercompany-transactions/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intercompany-transactions"] });
      toast({ title: "Transaction deleted" });
    }
  });

  const processedTx = transactions.filter((t: any) => t.status === "processed");
  const totalAmount = transactions.reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GitMerge className="h-8 w-8" />
          Intercompany Eliminations
        </h1>
        <p className="text-muted-foreground mt-2">Manage intercompany transactions and eliminations</p>
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
            <p className="text-xs text-muted-foreground">Processed</p>
            <p className="text-2xl font-bold text-green-600">{processedTx.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold font-mono">${(totalAmount / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{transactions.filter((t: any) => t.status === "pending").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-tx">
        <CardHeader><CardTitle className="text-base">Create Transaction</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Select value={newTx.entity} onValueChange={(v) => setNewTx({ ...newTx, entity: v })}>
              <SelectTrigger data-testid="select-entity"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Entity A">Entity A</SelectItem>
                <SelectItem value="Entity B">Entity B</SelectItem>
                <SelectItem value="Entity C">Entity C</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newTx.partner} onValueChange={(v) => setNewTx({ ...newTx, partner: v })}>
              <SelectTrigger data-testid="select-partner"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Entity A">Entity A</SelectItem>
                <SelectItem value="Entity B">Entity B</SelectItem>
                <SelectItem value="Entity C">Entity C</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Amount" type="number" value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })} data-testid="input-amount" />
            <Select value={newTx.currency} onValueChange={(v) => setNewTx({ ...newTx, currency: v })}>
              <SelectTrigger data-testid="select-currency"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newTx)} disabled={createMutation.isPending || !newTx.amount} className="w-full" data-testid="button-create-tx">
            <Plus className="w-4 h-4 mr-2" /> Create Transaction
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Transactions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : transactions.length === 0 ? <p className="text-muted-foreground text-center py-4">No transactions</p> : transactions.map((t: any) => (
            <div key={t.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`tx-${t.id}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{t.entity}</p>
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  <p className="font-semibold">{t.partner}</p>
                </div>
                <p className="text-sm text-muted-foreground">${t.amount} {t.currency}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={t.status === "processed" ? "default" : "secondary"}>{t.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(t.id)} data-testid={`button-delete-${t.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
