import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AccountReconciliation() {
  const { toast } = useToast();
  const [newRecon, setNewRecon] = useState({ accountId: "", glBalance: "", subledgerBalance: "" });

  const { data: reconciliations = [], isLoading } = useQuery({
    queryKey: ["/api/reconciliations"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/reconciliations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reconciliations"] });
      setNewRecon({ accountId: "", glBalance: "", subledgerBalance: "" });
      toast({ title: "Reconciliation created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/reconciliations/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reconciliations"] });
      toast({ title: "Reconciliation deleted" });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/reconciliations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reconciliations"] });
      toast({ title: "Status updated" });
    }
  });

  const calculateVariance = (gl: string, sub: string) => {
    const glNum = parseFloat(gl) || 0;
    const subNum = parseFloat(sub) || 0;
    return Math.abs(glNum - subNum).toFixed(2);
  };

  const metrics = {
    total: reconciliations.length
    reconciled: reconciliations.filter((r: any) => r.status === "reconciled").length
    exceptions: reconciliations.filter((r: any) => r.status === "exception").length
    totalVariance: reconciliations.reduce((sum: number, r: any) => sum + parseFloat(calculateVariance(r.glBalance || "0", r.subledgerBalance || "0")), 0)
  };

  return (
    <div className="space-y-6 p-4" data-testid="account-reconciliation">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Account Reconciliation
        </h1>
        <p className="text-muted-foreground mt-2">GL and subledger reconciliation with variance analysis</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3" data-testid="card-total-accounts">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Accounts</p>
            <p className="text-2xl font-bold">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-reconciled">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Reconciled</p>
            <p className="text-2xl font-bold text-green-600">{metrics.reconciled}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-exceptions">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Exceptions</p>
            <p className="text-2xl font-bold text-red-600">{metrics.exceptions}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-total-variance">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Variance</p>
            <p className="text-2xl font-bold">${(metrics.totalVariance / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-reconciliation">
        <CardHeader>
          <CardTitle className="text-base">Create Reconciliation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Account ID" value={newRecon.accountId} onChange={(e) => setNewRecon({ ...newRecon, accountId: e.target.value })} data-testid="input-account-id" />
            <Input placeholder="GL Balance" type="number" value={newRecon.glBalance} onChange={(e) => setNewRecon({ ...newRecon, glBalance: e.target.value })} data-testid="input-gl-balance" />
            <Input placeholder="Subledger Balance" type="number" value={newRecon.subledgerBalance} onChange={(e) => setNewRecon({ ...newRecon, subledgerBalance: e.target.value })} data-testid="input-subledger-balance" />
          </div>
          <Button onClick={() => createMutation.mutate(newRecon)} disabled={createMutation.isPending || !newRecon.accountId} className="w-full" data-testid="button-create-recon">
            <Plus className="w-4 h-4 mr-2" /> Create Reconciliation
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : reconciliations.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No reconciliations created</div>
          ) : (
            reconciliations.map((r: any) => {
              const variance = calculateVariance(r.glBalance || "0", r.subledgerBalance || "0");
              const status = variance === "0" ? "reconciled" : "exception";
              return (
                <div key={r.id} className="p-3 border rounded-lg hover-elevate" data-testid={`recon-item-${r.id}`}>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">{r.accountId}</h3>
                    <Badge variant={status === "reconciled" ? "default" : "destructive"}>{status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">GL: ${r.glBalance} • Subledger: ${r.subledgerBalance} • Variance: ${variance}</p>
                  <div className="flex gap-2">
                    {status === "exception" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: r.id, status: "reconciled" })} data-testid={`button-reconcile-${r.id}`}>
                        Mark Reconciled
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-${r.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
