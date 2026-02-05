import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SubcontractorManagement() {
  const { toast } = useToast();
  const [newSub, setNewSub] = useState({ name: "", scope: "Concrete", contractValue: "100000", retentionPct: "10", status: "active" });

  const { data: subs = [], isLoading } = useQuery({
    queryKey: ["/api/subcontractors"],
    queryFn: () => fetch("/api/subcontractors").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/subcontractors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subcontractors"] });
      setNewSub({ name: "", scope: "Concrete", contractValue: "100000", retentionPct: "10", status: "active" });
      toast({ title: "Subcontractor added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/subcontractors/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subcontractors"] });
      toast({ title: "Subcontractor deleted" });
    },
  });

  const active = subs.filter((s: any) => s.status === "active").length;
  const totalValue = subs.reduce((sum: number, s: any) => sum + (parseFloat(s.contractValue) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Subcontractor Management
        </h1>
        <p className="text-muted-foreground mt-2">Contracts, payments, retention, and performance</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Subs</p>
            <p className="text-2xl font-bold">{subs.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{active}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">${(totalValue / 1000000).toFixed(2)}M</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Retention</p>
            <p className="text-2xl font-bold">{subs.length > 0 ? (subs.reduce((sum: number, s: any) => sum + (parseFloat(s.retentionPct) || 0), 0) / subs.length).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-sub">
        <CardHeader><CardTitle className="text-base">Add Subcontractor</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Name" value={newSub.name} onChange={(e) => setNewSub({ ...newSub, name: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Scope" value={newSub.scope} onChange={(e) => setNewSub({ ...newSub, scope: e.target.value })} data-testid="input-scope" className="text-sm" />
            <Input placeholder="Contract Value" type="number" value={newSub.contractValue} onChange={(e) => setNewSub({ ...newSub, contractValue: e.target.value })} data-testid="input-value" className="text-sm" />
            <Input placeholder="Retention %" type="number" value={newSub.retentionPct} onChange={(e) => setNewSub({ ...newSub, retentionPct: e.target.value })} data-testid="input-retention" className="text-sm" />
            <Button disabled={createMutation.isPending || !newSub.name} size="sm" data-testid="button-add-sub">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Subcontractors</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : subs.length === 0 ? <p className="text-muted-foreground text-center py-4">No subcontractors</p> : subs.map((s: any) => (
            <div key={s.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`sub-${s.id}`}>
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.scope} • ${s.contractValue} • {s.retentionPct}% retention</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="default" className="text-xs">{s.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${s.id}`} className="h-7 w-7">
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
