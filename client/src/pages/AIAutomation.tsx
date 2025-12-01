import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AIAutomation() {
  const { toast } = useToast();
  const [newWorkflow, setNewWorkflow] = useState({ name: "", trigger: "created", status: "active" });

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["/api/ai-automations"],
    queryFn: () => fetch("/api/ai-automations").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/ai-automations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-automations"] });
      setNewWorkflow({ name: "", trigger: "created", status: "active" });
      toast({ title: "Automation workflow created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/ai-automations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-automations"] });
      toast({ title: "Workflow deleted" });
    },
  });

  const active = workflows.filter((w: any) => w.status === "active").length;
  const metrics = { total: workflows.length, active, executions: "1.2K", timeSaved: "48h" };

  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><Zap className="h-8 w-8" />AI & Automation</h1><p className="text-muted-foreground mt-2">Manage intelligent workflows and automations</p></div>

      <Card data-testid="card-new-workflow">
        <CardHeader><CardTitle className="text-base">Create AI Workflow</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Workflow name" value={newWorkflow.name} onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })} data-testid="input-name" />
            <Select value={newWorkflow.trigger} onValueChange={(v) => setNewWorkflow({ ...newWorkflow, trigger: v })}>
              <SelectTrigger data-testid="select-trigger"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="threshold">Threshold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newWorkflow.status} onValueChange={(v) => setNewWorkflow({ ...newWorkflow, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newWorkflow)} disabled={createMutation.isPending || !newWorkflow.name} className="w-full" data-testid="button-create-workflow">
            <Plus className="w-4 h-4 mr-2" /> Create Workflow
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Workflows</p><p className="text-2xl font-bold">{metrics.total}</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{metrics.active}</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Executions/Day</p><p className="text-2xl font-bold">{metrics.executions}</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Time Saved</p><p className="text-2xl font-bold">{metrics.timeSaved}</p></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle className="text-base">Active Workflows</CardTitle></CardHeader><CardContent className="space-y-3">{isLoading ? <p>Loading...</p> : workflows.length === 0 ? <p className="text-muted-foreground text-center py-4">No workflows</p> : workflows.map((w: any) => (<div key={w.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`workflow-${w.id}`}><div><h3 className="font-semibold">{w.name}</h3><p className="text-sm text-muted-foreground">Trigger: {w.trigger}</p></div><div className="flex gap-2 items-center"><Badge variant={w.status === "active" ? "default" : "secondary"}>{w.status}</Badge><Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(w.id)} data-testid={`button-delete-${w.id}`}><Trash2 className="w-4 h-4" /></Button></div></div>))}</CardContent></Card>
    </div>
  );
}
