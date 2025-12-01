import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CashManagementPage() {
  const { toast } = useToast();
  const [newTransaction, setNewTransaction] = useState({ type: "Receipt", amount: "", account: "" });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/finance/cash-transactions"],
    queryFn: () => fetch("/api/finance/cash-transactions").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/finance/cash-transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/cash-transactions"] });
      setNewTransaction({ type: "Receipt", amount: "", account: "" });
      toast({ title: "Transaction created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/finance/cash-transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/cash-transactions"] });
      toast({ title: "Transaction deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Cash Management
        </h1>
        <p className="text-muted-foreground mt-2">Monitor cash position and reconciliation</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Cash Balance</p>
            <p className="text-2xl font-bold">$1.5M</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Today Receipts</p>
            <p className="text-2xl font-bold text-green-600">$50,000</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Today Payments</p>
            <p className="text-2xl font-bold text-red-600">$25,000</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">$15,000</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-transaction">
        <CardHeader><CardTitle className="text-base">Record Transaction</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Select value={newTransaction.type} onValueChange={(v) => setNewTransaction({ ...newTransaction, type: v })}>
              <SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Receipt">Receipt</SelectItem>
                <SelectItem value="Payment">Payment</SelectItem>
                <SelectItem value="Transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Amount" type="number" value={newTransaction.amount} onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })} data-testid="input-amount" />
            <Input placeholder="Account" value={newTransaction.account} onChange={(e) => setNewTransaction({ ...newTransaction, account: e.target.value })} data-testid="input-account" />
            <Button onClick={() => createMutation.mutate(newTransaction)} disabled={createMutation.isPending || !newTransaction.amount} className="w-full" data-testid="button-record-transaction">
              <Plus className="w-4 h-4 mr-2" /> Record
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : transactions.length === 0 ? <p className="text-muted-foreground text-center py-4">No transactions</p> : transactions.map((trans: any) => (
            <div key={trans.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`transaction-${trans.id}`}>
              <div className="flex-1">
                <p className="font-medium text-sm">{trans.type}</p>
                <p className="text-xs text-muted-foreground">Account: {trans.account}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">${trans.amount}</p>
                <Badge variant="default">recorded</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(trans.id)} data-testid={`button-delete-${trans.id}`}>
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
