import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function NCRCAMAManagement() {
  const { toast } = useToast();
  const [newNCR, setNewNCR] = useState({ ncrId: "", description: "", severity: "major", status: "open" });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["/api/ncr-cama"],
    queryFn: () => fetch("/api/ncr-cama").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/ncr-cama", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ncr-cama"] });
      setNewNCR({ ncrId: "", description: "", severity: "major", status: "open" });
      toast({ title: "NCR created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/ncr-cama/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ncr-cama"] });
      toast({ title: "NCR deleted" });
    },
  });

  const closed = records.filter((r: any) => r.status === "closed").length;
  const open = records.filter((r: any) => r.status === "open").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertCircle className="h-8 w-8" />
          NCR & CAMA Management
        </h1>
        <p className="text-muted-foreground mt-2">Nonconformance reports, root cause analysis, and corrective actions</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total NCRs</p>
            <p className="text-2xl font-bold">{records.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-red-600">{open}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Closed</p>
            <p className="text-2xl font-bold text-green-600">{closed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Resolution Rate</p>
            <p className="text-2xl font-bold">{records.length > 0 ? ((closed / records.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-ncr">
        <CardHeader><CardTitle className="text-base">Create NCR</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="NCR ID" value={newNCR.ncrId} onChange={(e) => setNewNCR({ ...newNCR, ncrId: e.target.value })} data-testid="input-ncrid" className="text-sm" />
            <Input placeholder="Description" value={newNCR.description} onChange={(e) => setNewNCR({ ...newNCR, description: e.target.value })} data-testid="input-desc" className="text-sm" />
            <Select value={newNCR.severity} onValueChange={(v) => setNewNCR({ ...newNCR, severity: v })}>
              <SelectTrigger data-testid="select-severity" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newNCR.status} onValueChange={(v) => setNewNCR({ ...newNCR, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newNCR)} disabled={createMutation.isPending || !newNCR.ncrId} size="sm" data-testid="button-create-ncr">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">NCR Records</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : records.length === 0 ? <p className="text-muted-foreground text-center py-4">No NCRs</p> : records.map((r: any) => (
            <div key={r.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`ncr-${r.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{r.ncrId}</p>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={r.severity === "critical" ? "destructive" : r.severity === "major" ? "secondary" : "default"} className="text-xs">{r.severity}</Badge>
                <Badge variant={r.status === "closed" ? "default" : "secondary"} className="text-xs">{r.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-${r.id}`} className="h-7 w-7">
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
