import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StockTransfer() {
  const { toast } = useToast();
  const [newTransfer, setNewTransfer] = useState({ item: "Item A", quantity: "", fromLocation: "Bin-01", toLocation: "Bin-02", status: "pending" });

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ["/api/stock-transfer"],
    queryFn: () => fetch("/api/stock-transfer").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/stock-transfer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-transfer"] });
      setNewTransfer({ item: "Item A", quantity: "", fromLocation: "Bin-01", toLocation: "Bin-02", status: "pending" });
      toast({ title: "Transfer created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/stock-transfer/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-transfer"] });
      toast({ title: "Transfer deleted" });
    },
  });

  const completedCount = transfers.filter((t: any) => t.status === "completed").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ArrowRight className="h-8 w-8" />
          Stock Transfers
        </h1>
        <p className="text-muted-foreground mt-2">Move inventory between locations</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Transfers</p>
            <p className="text-2xl font-bold">{transfers.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{transfers.length - completedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-transfer">
        <CardHeader><CardTitle className="text-base">Create Transfer</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <Select value={newTransfer.item} onValueChange={(v) => setNewTransfer({ ...newTransfer, item: v })}>
              <SelectTrigger data-testid="select-item"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Item A">Item A</SelectItem>
                <SelectItem value="Item B">Item B</SelectItem>
                <SelectItem value="Item C">Item C</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Quantity" type="number" value={newTransfer.quantity} onChange={(e) => setNewTransfer({ ...newTransfer, quantity: e.target.value })} data-testid="input-qty" />
            <Input placeholder="From Location" value={newTransfer.fromLocation} onChange={(e) => setNewTransfer({ ...newTransfer, fromLocation: e.target.value })} data-testid="input-from" />
            <Input placeholder="To Location" value={newTransfer.toLocation} onChange={(e) => setNewTransfer({ ...newTransfer, toLocation: e.target.value })} data-testid="input-to" />
            <Select value={newTransfer.status} onValueChange={(v) => setNewTransfer({ ...newTransfer, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newTransfer)} disabled={createMutation.isPending || !newTransfer.quantity} className="w-full" data-testid="button-create-transfer">
            <Plus className="w-4 h-4 mr-2" /> Create Transfer
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Transfers</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : transfers.length === 0 ? <p className="text-muted-foreground text-center py-4">No transfers</p> : transfers.map((t: any) => (
            <div key={t.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`transfer-${t.id}`}>
              <div>
                <p className="font-semibold text-sm">{t.item}</p>
                <p className="text-xs text-muted-foreground">{t.quantity} qty: {t.fromLocation} → {t.toLocation}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={t.status === "completed" ? "default" : "secondary"}>{t.status}</Badge>
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
