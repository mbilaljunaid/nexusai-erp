import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function POSCashReconciliation() {
  const { toast } = useToast();
  const [newRecon, setNewRecon] = useState({ terminalId: "", dateOfDay: new Date().toISOString().split('T')[0], expectedCash: "0", actualCash: "0" });

  const { data: reconciliations = [], isLoading } = useQuery({
    queryKey: ["/api/cash-reconciliation"],
    queryFn: () => fetch("/api/cash-reconciliation").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/cash-reconciliation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-reconciliation"] });
      setNewRecon({ terminalId: "", dateOfDay: new Date().toISOString().split('T')[0], expectedCash: "0", actualCash: "0" });
      toast({ title: "Reconciliation recorded" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/cash-reconciliation/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-reconciliation"] });
      toast({ title: "Reconciliation deleted" });
    },
  });

  const balanced = reconciliations.filter((r: any) => Math.abs((parseFloat(r.expectedCash) || 0) - (parseFloat(r.actualCash) || 0)) < 0.01).length;
  const totalExpected = reconciliations.reduce((sum: number, r: any) => sum + (parseFloat(r.expectedCash) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          POS Cash Reconciliation
        </h1>
        <p className="text-muted-foreground mt-2">End-of-day cash counts, discrepancies, and reconciliation</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Reconciliations</p>
            <p className="text-2xl font-bold">{reconciliations.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Balanced</p>
            <p className="text-2xl font-bold text-green-600">{balanced}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Discrepancies</p>
            <p className="text-2xl font-bold text-red-600">{reconciliations.length - balanced}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Expected</p>
            <p className="text-2xl font-bold">${totalExpected.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-recon">
        <CardHeader><CardTitle className="text-base">Record Reconciliation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Terminal ID" value={newRecon.terminalId} onChange={(e) => setNewRecon({ ...newRecon, terminalId: e.target.value })} data-testid="input-terminal" className="text-sm" />
            <Input placeholder="Date" type="date" value={newRecon.dateOfDay} onChange={(e) => setNewRecon({ ...newRecon, dateOfDay: e.target.value })} data-testid="input-date" className="text-sm" />
            <Input placeholder="Expected" type="number" value={newRecon.expectedCash} onChange={(e) => setNewRecon({ ...newRecon, expectedCash: e.target.value })} data-testid="input-expected" className="text-sm" />
            <Input placeholder="Actual" type="number" value={newRecon.actualCash} onChange={(e) => setNewRecon({ ...newRecon, actualCash: e.target.value })} data-testid="input-actual" className="text-sm" />
            <Button disabled={createMutation.isPending || !newRecon.terminalId} size="sm" data-testid="button-record">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Reconciliations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : reconciliations.length === 0 ? <p className="text-muted-foreground text-center py-4">No records</p> : reconciliations.map((r: any) => {
            const variance = (parseFloat(r.actualCash) || 0) - (parseFloat(r.expectedCash) || 0);
            return (
              <div key={r.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`recon-${r.id}`}>
                <div className="flex-1">
                  <p className="font-semibold">{r.terminalId} - {r.dateOfDay}</p>
                  <p className="text-xs text-muted-foreground">Expected: ${r.expectedCash} • Actual: ${r.actualCash} • Variance: ${variance.toFixed(2)}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={Math.abs(variance) < 0.01 ? "default" : "destructive"} className="text-xs">{Math.abs(variance) < 0.01 ? "Balanced" : "Discrepancy"}</Badge>
                  <Button size="icon" variant="ghost" data-testid={`button-delete-${r.id}`} className="h-7 w-7">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
