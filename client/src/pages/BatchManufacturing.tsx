import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Factory, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BatchManufacturing() {
  const { toast } = useToast();
  const [newBatch, setNewBatch] = useState({ batchId: "", recipeId: "", quantity: "100", status: "planned" });

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["/api/fb-batches"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/fb-batches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-batches"] });
      setNewBatch({ batchId: "", recipeId: "", quantity: "100", status: "planned" });
      toast({ title: "Batch created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/fb-batches/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-batches"] });
      toast({ title: "Batch deleted" });
    }
  });

  const completed = batches.filter((b: any) => b.status === "completed").length;
  const inProgress = batches.filter((b: any) => b.status === "in-progress").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Factory className="h-8 w-8" />
          Batch Manufacturing & Kitchen Execution
        </h1>
        <p className="text-muted-foreground mt-2">Production orders, scaled sheets, in-process QC, yield tracking, and genealogy</p>
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
        <CardHeader><CardTitle className="text-base">Create Batch</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Batch ID" value={newBatch.batchId} onChange={(e) => setNewBatch({ ...newBatch, batchId: e.target.value })} data-testid="input-bid" className="text-sm" />
            <Input placeholder="Recipe ID" value={newBatch.recipeId} onChange={(e) => setNewBatch({ ...newBatch, recipeId: e.target.value })} data-testid="input-rid" className="text-sm" />
            <Input placeholder="Qty" type="number" value={newBatch.quantity} onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Input placeholder="Status" disabled value="planned" data-testid="input-status" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newBatch)} disabled={createMutation.isPending || !newBatch.batchId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Batches</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : batches.length === 0 ? <p className="text-muted-foreground text-center py-4">No batches</p> : batches.map((b: any) => (
            <div key={b.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`batch-${b.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{b.batchId}</p>
                <p className="text-xs text-muted-foreground">Recipe: {b.recipeId} • Qty: {b.quantity}</p>
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
