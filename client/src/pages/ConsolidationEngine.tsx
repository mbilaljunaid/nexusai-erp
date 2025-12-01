import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GitMerge, Database, LinkIcon, AlertCircle, Plus, Trash2, Link2 as MappingIcon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { IconNavigation } from "@/components/IconNavigation";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Consolidation {
  id: string;
  name: string;
  status: string;
  entityCount: number;
  period: string;
}

export default function ConsolidationEngine() {
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState("consolidations");
  const [newRun, setNewRun] = useState({ runName: "", period: "Q1", entityCount: "5" });

  const { data: consolidations = [], isLoading } = useQuery<Consolidation[]>({
    queryKey: ["/api/consolidation-runs"],
    queryFn: () => fetch("/api/consolidation-runs").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/consolidation-runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consolidation-runs"] });
      setNewRun({ runName: "", period: "Q1", entityCount: "5" });
      toast({ title: "Consolidation run created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/consolidation-runs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consolidation-runs"] });
      toast({ title: "Run deleted" });
    },
  });

  const stats = {
    total: consolidations.length,
    inProgress: consolidations.filter((c: any) => c.status === "in_progress").length,
    completed: consolidations.filter((c: any) => c.status === "completed").length,
    entities: consolidations.reduce((sum: number, c: any) => sum + (c.entityCount || 0), 0),
  };

  const navItems = [
    { id: "consolidations", label: "Consolidations", icon: GitMerge, color: "text-blue-500" },
    { id: "eliminations", label: "Eliminations", icon: Trash2, color: "text-red-500" },
    { id: "mappings", label: "Mappings", icon: MappingIcon, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-semibold flex items-center gap-2"><GitMerge className="w-8 h-8" />Consolidation Engine</h1>
        <p className="text-muted-foreground text-sm">Multi-entity consolidation and eliminations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><GitMerge className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-semibold">{stats.total}</p><p className="text-xs text-muted-foreground">Runs</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><AlertCircle className="h-5 w-5 text-yellow-500" /><div><p className="text-2xl font-semibold">{stats.inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Database className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-semibold">{stats.completed}</p><p className="text-xs text-muted-foreground">Completed</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><LinkIcon className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-semibold">{stats.entities}</p><p className="text-xs text-muted-foreground">Entities</p></div></div></CardContent></Card>
      </div>

      <Card data-testid="card-new-run">
        <CardHeader><CardTitle className="text-base">Create Consolidation Run</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Run name" value={newRun.runName} onChange={(e) => setNewRun({ ...newRun, runName: e.target.value })} data-testid="input-run-name" />
            <Select value={newRun.period} onValueChange={(v) => setNewRun({ ...newRun, period: v })}>
              <SelectTrigger data-testid="select-period"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Entity count" type="number" value={newRun.entityCount} onChange={(e) => setNewRun({ ...newRun, entityCount: e.target.value })} data-testid="input-entity-count" />
          </div>
          <Button onClick={() => createMutation.mutate(newRun)} disabled={createMutation.isPending || !newRun.runName} className="w-full" data-testid="button-create-run">
            <Plus className="w-4 h-4 mr-2" /> Create Run
          </Button>
        </CardContent>
      </Card>

      {activeNav === "consolidations" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Consolidation Runs</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? <p>Loading...</p> : consolidations.length === 0 ? <p className="text-muted-foreground text-center py-4">No runs</p> : consolidations.map((con: any) => (
              <div key={con.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`run-${con.id}`}>
                <div>
                  <p className="font-semibold">{con.name}</p>
                  <p className="text-sm text-muted-foreground">{con.entityCount} entities • Period: {con.period}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={con.status === "completed" ? "default" : "secondary"}>{con.status}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(con.id)} data-testid={`button-delete-${con.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {activeNav === "eliminations" && <Card><CardContent className="p-6"><p className="text-muted-foreground">Inter-company eliminations and adjustments</p></CardContent></Card>}
      {activeNav === "mappings" && <Card><CardContent className="p-6"><p className="text-muted-foreground">Entity and account mappings</p></CardContent></Card>}
    </div>
  );
}
