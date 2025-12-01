import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FormulationRecipeManagement() {
  const { toast } = useToast();
  const [newFormula, setNewFormula] = useState({ formulaId: "", productName: "", batchSize: "100", yieldPct: "95", status: "draft" });

  const { data: formulas = [], isLoading } = useQuery({
    queryKey: ["/api/formulations"],
    queryFn: () => fetch("/api/formulations").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/formulations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/formulations"] });
      setNewFormula({ formulaId: "", productName: "", batchSize: "100", yieldPct: "95", status: "draft" });
      toast({ title: "Formulation created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/formulations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/formulations"] });
      toast({ title: "Formulation deleted" });
    },
  });

  const approved = formulas.filter((f: any) => f.status === "approved").length;
  const avgYield = formulas.length > 0 ? (formulas.reduce((sum: number, f: any) => sum + (parseFloat(f.yieldPct) || 0), 0) / formulas.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FlaskConical className="h-8 w-8" />
          Formulation & Recipe Management
        </h1>
        <p className="text-muted-foreground mt-2">Recipe editor, ingredient substitutions, batch instructions, and version control</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Formulas</p>
            <p className="text-2xl font-bold">{formulas.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approved}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Yield</p>
            <p className="text-2xl font-bold">{avgYield}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Draft/Review</p>
            <p className="text-2xl font-bold text-yellow-600">{formulas.length - approved}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-formula">
        <CardHeader><CardTitle className="text-base">Create Formulation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Formula ID" value={newFormula.formulaId} onChange={(e) => setNewFormula({ ...newFormula, formulaId: e.target.value })} data-testid="input-formid" className="text-sm" />
            <Input placeholder="Product Name" value={newFormula.productName} onChange={(e) => setNewFormula({ ...newFormula, productName: e.target.value })} data-testid="input-product" className="text-sm" />
            <Input placeholder="Batch Size" type="number" value={newFormula.batchSize} onChange={(e) => setNewFormula({ ...newFormula, batchSize: e.target.value })} data-testid="input-batch" className="text-sm" />
            <Input placeholder="Yield %" type="number" value={newFormula.yieldPct} onChange={(e) => setNewFormula({ ...newFormula, yieldPct: e.target.value })} data-testid="input-yield" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newFormula)} disabled={createMutation.isPending || !newFormula.formulaId} size="sm" data-testid="button-create-formula">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Formulations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : formulas.length === 0 ? <p className="text-muted-foreground text-center py-4">No formulas</p> : formulas.map((f: any) => (
            <div key={f.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`formula-${f.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{f.formulaId} - {f.productName}</p>
                <p className="text-xs text-muted-foreground">Batch: {f.batchSize} • Yield: {f.yieldPct}%</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={f.status === "approved" ? "default" : "secondary"} className="text-xs">{f.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(f.id)} data-testid={`button-delete-${f.id}`} className="h-7 w-7">
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
