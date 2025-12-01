import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link2, Plus, Trash2, CheckCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function IntercompanyReconciliation() {
  const { toast } = useToast();
  const [newMatch, setNewMatch] = useState({ entity: "Entity A", partner: "Entity B", amount: "", status: "unmatched" });

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["/api/intercompany-reconciliation"],
    queryFn: () => fetch("/api/intercompany-reconciliation").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/intercompany-reconciliation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intercompany-reconciliation"] });
      setNewMatch({ entity: "Entity A", partner: "Entity B", amount: "", status: "unmatched" });
      toast({ title: "Reconciliation entry created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/intercompany-reconciliation/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intercompany-reconciliation"] });
      toast({ title: "Entry deleted" });
    },
  });

  const matchedCount = matches.filter((m: any) => m.status === "matched").length;
  const unmatchedCount = matches.filter((m: any) => m.status === "unmatched").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Link2 className="h-8 w-8" />
          Intercompany Reconciliation
        </h1>
        <p className="text-muted-foreground mt-2">Reconcile intercompany transactions and verify matching</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold">{matches.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Matched</p>
            <p className="text-2xl font-bold text-green-600">{matchedCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Unmatched</p>
            <p className="text-2xl font-bold text-yellow-600">{unmatchedCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Match Rate</p>
            <p className="text-2xl font-bold text-blue-600">{matches.length > 0 ? ((matchedCount / matches.length) * 100).toFixed(0) : "0"}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-match">
        <CardHeader><CardTitle className="text-base">Add Reconciliation Entry</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Select value={newMatch.entity} onValueChange={(v) => setNewMatch({ ...newMatch, entity: v })}>
              <SelectTrigger data-testid="select-entity"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Entity A">Entity A</SelectItem>
                <SelectItem value="Entity B">Entity B</SelectItem>
                <SelectItem value="Entity C">Entity C</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newMatch.partner} onValueChange={(v) => setNewMatch({ ...newMatch, partner: v })}>
              <SelectTrigger data-testid="select-partner"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Entity A">Entity A</SelectItem>
                <SelectItem value="Entity B">Entity B</SelectItem>
                <SelectItem value="Entity C">Entity C</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Amount" type="number" value={newMatch.amount} onChange={(e) => setNewMatch({ ...newMatch, amount: e.target.value })} data-testid="input-amount" />
            <Select value={newMatch.status} onValueChange={(v) => setNewMatch({ ...newMatch, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="matched">Matched</SelectItem>
                <SelectItem value="unmatched">Unmatched</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newMatch)} disabled={createMutation.isPending || !newMatch.amount} className="w-full" data-testid="button-create-entry">
            <Plus className="w-4 h-4 mr-2" /> Create Entry
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Reconciliation Items</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : matches.length === 0 ? <p className="text-muted-foreground text-center py-4">No items</p> : matches.map((m: any) => (
            <div key={m.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`match-${m.id}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {m.status === "matched" && <CheckCircle className="w-4 h-4 text-green-600" />}
                  <p className="font-semibold text-sm">{m.entity} ↔ {m.partner}</p>
                </div>
                <p className="text-xs text-muted-foreground">${m.amount}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={m.status === "matched" ? "default" : m.status === "pending" ? "secondary" : "outline"}>{m.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(m.id)} data-testid={`button-delete-${m.id}`}>
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
