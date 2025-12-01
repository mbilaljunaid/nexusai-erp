import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function NCRManagement() {
  const { toast } = useToast();
  const [newNCR, setNewNCR] = useState({ product: "Product-A", defectCode: "DEF-001", severity: "medium", status: "open" });

  const { data: ncrs = [], isLoading } = useQuery({
    queryKey: ["/api/ncr"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/ncr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ncr"] });
      setNewNCR({ product: "Product-A", defectCode: "DEF-001", severity: "medium", status: "open" });
      toast({ title: "NCR created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/ncr/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ncr"] });
      toast({ title: "NCR deleted" });
    }
  });

  const criticalCount = ncrs.filter((n: any) => n.severity === "critical").length;
  const closedCount = ncrs.filter((n: any) => n.status === "closed").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8" />
          Non-Conformance Reports (NCR)
        </h1>
        <p className="text-muted-foreground mt-2">Manage quality issues and corrective actions</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total NCRs</p>
            <p className="text-2xl font-bold">{ncrs.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Closed</p>
            <p className="text-2xl font-bold text-green-600">{closedCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-yellow-600">{ncrs.length - closedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-ncr">
        <CardHeader><CardTitle className="text-base">Create NCR</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Product" value={newNCR.product} onChange={(e) => setNewNCR({ ...newNCR, product: e.target.value })} data-testid="input-product" />
            <Input placeholder="Defect Code" value={newNCR.defectCode} onChange={(e) => setNewNCR({ ...newNCR, defectCode: e.target.value })} data-testid="input-defect" />
            <Select value={newNCR.severity} onValueChange={(v) => setNewNCR({ ...newNCR, severity: v })}>
              <SelectTrigger data-testid="select-severity"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newNCR.status} onValueChange={(v) => setNewNCR({ ...newNCR, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newNCR)} disabled={createMutation.isPending} className="w-full" data-testid="button-create-ncr">
            <Plus className="w-4 h-4 mr-2" /> Create NCR
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">NCRs</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : ncrs.length === 0 ? <p className="text-muted-foreground text-center py-4">No NCRs</p> : ncrs.map((n: any) => (
            <div key={n.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`ncr-${n.id}`}>
              <div>
                <p className="font-semibold text-sm">{n.defectCode}</p>
                <p className="text-xs text-muted-foreground">{n.product} • {n.status}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={n.severity === "critical" ? "destructive" : "secondary"}>{n.severity}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(n.id)} data-testid={`button-delete-${n.id}`}>
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
