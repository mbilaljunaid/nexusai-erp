import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Zap } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WorkflowBuilder() {
  const { toast } = useToast();
  const [newWorkflow, setNewWorkflow] = useState({ name: "", trigger: "manual", status: "active" });

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["/api/workflows"],
    queryFn: () => fetch("/api/workflows").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/workflows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      setNewWorkflow({ name: "", trigger: "manual", status: "active" });
      toast({ title: "Workflow created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/workflows/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({ title: "Workflow deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Zap className="w-8 h-8" />Workflow Builder</h1>
          <p className="text-muted-foreground mt-1">Create and manage automation workflows</p>
        </div>
      </div>

      <Card data-testid="card-new-workflow">
        <CardHeader><CardTitle className="text-base">Create Workflow</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Workflow name" value={newWorkflow.name} onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })} data-testid="input-name" />
            <Select value={newWorkflow.trigger} onValueChange={(v) => setNewWorkflow({ ...newWorkflow, trigger: v })}>
              <SelectTrigger data-testid="select-trigger"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newWorkflow.status} onValueChange={(v) => setNewWorkflow({ ...newWorkflow, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newWorkflow)} disabled={createMutation.isPending || !newWorkflow.name} className="w-full" data-testid="button-new-workflow">
            <Plus className="w-4 h-4 mr-2" /> Create Workflow
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? <p>Loading...</p> : workflows.length === 0 ? <p className="text-muted-foreground text-center py-4">No workflows</p> : workflows.map((w: any) => (
          <Card key={w.id} data-testid={`workflow-${w.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{w.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Trigger: {w.trigger} • Status: {w.status}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(w.id)} data-testid={`button-delete-${w.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
