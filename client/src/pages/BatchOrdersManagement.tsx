import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Beaker, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BatchOrdersManagement() {
  const { toast } = useToast();
  const [newBatch, setNewBatch] = useState({ batchId: "", formulaId: "", quantity: "100", status: "planned" });

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["/api/batch-orders"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/batch-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-orders"] });
      setNewBatch({ batchId: "", formulaId: "", quantity: "100", status: "planned" });
      toast({ title: "Batch order created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/batch-orders/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-orders"] });
      toast({ title: "Batch deleted" });
    }
  });

  const completed = batches.filter((b: any) => b.status === "completed").length;
  const inProgress = batches.filter((b: any) => b.status === "in-progress").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Beaker className="h-8 w-8" />
          Batch Manufacturing Execution
        </h1>
        <p className="text-muted-foreground mt-2">Batch orders, material issue, operation recording, and yield tracking</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Batches</p>
            <p className="text-2xl font-bold">{batches.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completion %</p>
            <p className="text-2xl font-bold">{batches.length > 0 ? ((completed / batches.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-batch">
        <CardHeader><CardTitle className="text-base">Create Batch Order</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Batch ID" value={newBatch.batchId} onChange={(e) => setNewBatch({ ...newBatch, batchId: e.target.value })} data-testid="input-batchid" className="text-sm" />
            <Input placeholder="Formula ID" value={newBatch.formulaId} onChange={(e) => setNewBatch({ ...newBatch, formulaId: e.target.value })} data-testid="input-formid" className="text-sm" />
            <Input placeholder="Quantity" type="number" value={newBatch.quantity} onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Select value={newBatch.status} onValueChange={(v) => setNewBatch({ ...newBatch, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newBatch)} disabled={createMutation.isPending || !newBatch.batchId} size="sm" data-testid="button-create-batch">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Batch Orders</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : batches.length === 0 ? <p className="text-muted-foreground text-center py-4">No batches</p> : batches.map((b: any) => (
            <div key={b.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`batch-${b.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{b.batchId}</p>
                <p className="text-xs text-muted-foreground">Formula: {b.formulaId} • Qty: {b.quantity}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={b.status === "completed" ? "default" : "secondary"} className="text-xs">{b.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(b.id)} data-testid={`button-delete-${b.id}`} className="h-7 w-7">
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
