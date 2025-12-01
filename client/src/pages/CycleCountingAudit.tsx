import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CycleCountingAudit() {
  const { toast } = useToast();
  const [newCount, setNewCount] = useState({ productId: "", binId: "", systemQty: "100", countedQty: "100", variance: "0" });

  const { data: counts = [], isLoading } = useQuery({
    queryKey: ["/api/cycle-count"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/cycle-count", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cycle-count"] });
      setNewCount({ productId: "", binId: "", systemQty: "100", countedQty: "100", variance: "0" });
      toast({ title: "Count recorded" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/cycle-count/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cycle-count"] });
      toast({ title: "Count deleted" });
    }
  });

  const accurate = counts.filter((c: any) => Math.abs((parseFloat(c.variance) || 0)) === 0).length;
  const avgVariance = counts.length > 0 ? Math.abs(counts.reduce((sum: number, c: any) => sum + (parseFloat(c.variance) || 0), 0) / counts.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Cycle Counting & Inventory Audit
        </h1>
        <p className="text-muted-foreground mt-2">Physical inventory counts, variance analysis, and audit trails</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Counts</p>
            <p className="text-2xl font-bold">{counts.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Accurate</p>
            <p className="text-2xl font-bold text-green-600">{accurate}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Variance %</p>
            <p className="text-2xl font-bold">{avgVariance}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Accuracy Rate</p>
            <p className="text-2xl font-bold">{counts.length > 0 ? ((accurate / counts.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-count">
        <CardHeader><CardTitle className="text-base">Record Count</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Product ID" value={newCount.productId} onChange={(e) => setNewCount({ ...newCount, productId: e.target.value })} data-testid="input-prodid" className="text-sm" />
            <Input placeholder="Bin ID" value={newCount.binId} onChange={(e) => setNewCount({ ...newCount, binId: e.target.value })} data-testid="input-binid" className="text-sm" />
            <Input placeholder="System Qty" type="number" value={newCount.systemQty} onChange={(e) => setNewCount({ ...newCount, systemQty: e.target.value })} data-testid="input-sys" className="text-sm" />
            <Input placeholder="Counted Qty" type="number" value={newCount.countedQty} onChange={(e) => {
              const counted = parseFloat(e.target.value) || 0;
              const sys = parseFloat(newCount.systemQty) || 0;
              setNewCount({ ...newCount, countedQty: e.target.value, variance: ((counted - sys) / sys * 100).toFixed(1) });
            }} data-testid="input-counted" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newCount)} disabled={createMutation.isPending || !newCount.productId} size="sm" data-testid="button-record">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Counts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : counts.length === 0 ? <p className="text-muted-foreground text-center py-4">No counts</p> : counts.map((c: any) => (
            <div key={c.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`count-${c.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{c.productId} - {c.binId}</p>
                <p className="text-xs text-muted-foreground">System: {c.systemQty} • Counted: {c.countedQty}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={Math.abs(parseFloat(c.variance) || 0) === 0 ? "default" : "destructive"} className="text-xs">{c.variance}%</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-${c.id}`} className="h-7 w-7">
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
