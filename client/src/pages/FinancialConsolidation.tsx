import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FinancialConsolidation() {
  const { toast } = useToast();
  const [newEntity, setNewEntity] = useState({ entityName: "", parentEntity: "Group", consolidationMethod: "full", currency: "USD" });

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ["/api/consolidations"],
    queryFn: () => fetch("/api/consolidations").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data) => fetch("/api/consolidations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consolidations"] });
      setNewEntity({ entityName: "", parentEntity: "Group", consolidationMethod: "full", currency: "USD" });
      toast({ title: "Entity created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/consolidations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consolidations"] });
      toast({ title: "Entity deleted" });
    },
  });

  const metrics = {
    total: entities.length,
    consolidated: entities.filter((e: any) => e.status === "consolidated").length,
    pending: entities.filter((e: any) => e.status === "pending").length,
    percentage: entities.length > 0 ? Math.round((entities.filter((e: any) => e.status === "consolidated").length / entities.length) * 100) : 0,
  };

  return (
    <div className="space-y-6 p-4" data-testid="financial-consolidation">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Financial Consolidation
        </h1>
        <p className="text-muted-foreground mt-2">Manage multi-entity consolidation and intercompany eliminations</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3" data-testid="card-total-entities">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Entities</p>
            <p className="text-2xl font-bold">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-consolidated">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Consolidated</p>
            <p className="text-2xl font-bold text-green-600">{metrics.consolidated}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-pending">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{metrics.pending}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-consolidation-pct">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Consolidation %</p>
            <p className="text-2xl font-bold">{metrics.percentage}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-entity">
        <CardHeader>
          <CardTitle className="text-base">Add Entity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Entity name" value={newEntity.entityName} onChange={(e) => setNewEntity({ ...newEntity, entityName: e.target.value })} data-testid="input-entity-name" />
            <Input placeholder="Parent entity" value={newEntity.parentEntity} onChange={(e) => setNewEntity({ ...newEntity, parentEntity: e.target.value })} data-testid="input-parent-entity" />
            <Select value={newEntity.consolidationMethod} onValueChange={(v) => setNewEntity({ ...newEntity, consolidationMethod: v })}>
              <SelectTrigger data-testid="select-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="proportionate">Proportionate</SelectItem>
                <SelectItem value="equity">Equity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newEntity.currency} onValueChange={(v) => setNewEntity({ ...newEntity, currency: v })}>
              <SelectTrigger data-testid="select-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="SGD">SGD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newEntity)} disabled={createMutation.isPending || !newEntity.entityName} className="w-full" data-testid="button-create-entity">
            <Plus className="w-4 h-4 mr-2" /> Add Entity
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entity Hierarchy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : entities.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No entities defined</div>
          ) : (
            entities.map((e: any) => (
              <div key={e.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`entity-item-${e.id}`}>
                <div className="flex-1">
                  <h3 className="font-semibold">{e.entityName}</h3>
                  <p className="text-sm text-muted-foreground">Parent: {e.parentEntity} • Method: {e.consolidationMethod} • Currency: {e.currency}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={e.status === "consolidated" ? "default" : "secondary"}>{e.status}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(e.id)} data-testid={`button-delete-${e.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
