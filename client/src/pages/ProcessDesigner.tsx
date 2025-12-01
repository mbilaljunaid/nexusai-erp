import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GitBranch } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProcessDesigner() {
  const { toast } = useToast();
  const [newProcess, setNewProcess] = useState({ name: "", module: "Finance", status: "draft", owner: "" });

  const { data: processes = [], isLoading } = useQuery({
    queryKey: ["/api/processes"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/processes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      setNewProcess({ name: "", module: "Finance", status: "draft", owner: "" });
      toast({ title: "Process created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/processes/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      toast({ title: "Process deleted" });
    }
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GitBranch className="h-8 w-8" />
          Process Designer
        </h1>
        <p className="text-muted-foreground mt-2">Create and design enterprise business processes</p>
      </div>

      <Card data-testid="card-new-process">
        <CardHeader><CardTitle className="text-base">Create Process</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Process name" value={newProcess.name} onChange={(e) => setNewProcess({ ...newProcess, name: e.target.value })} data-testid="input-name" />
            <Select value={newProcess.module} onValueChange={(v) => setNewProcess({ ...newProcess, module: v })}>
              <SelectTrigger data-testid="select-module"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="CRM">CRM</SelectItem>
                <SelectItem value="Inventory">Inventory</SelectItem>
                <SelectItem value="Projects">Projects</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Owner" value={newProcess.owner} onChange={(e) => setNewProcess({ ...newProcess, owner: e.target.value })} data-testid="input-owner" />
            <Select value={newProcess.status} onValueChange={(v) => setNewProcess({ ...newProcess, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newProcess)} disabled={createMutation.isPending || !newProcess.name} className="w-full" data-testid="button-create-process">
            <Plus className="w-4 h-4 mr-2" /> Create Process
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Processes</p>
            <p className="text-2xl font-bold">{processes.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{processes.filter((p: any) => p.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-yellow-600">{processes.filter((p: any) => p.status === "draft").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{processes.filter((p: any) => p.status === "inactive").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Process Library</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : processes.length === 0 ? <p className="text-muted-foreground text-center py-4">No processes</p> : processes.map((p: any) => (
            <div key={p.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`process-${p.id}`}>
              <div className="flex-1">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">Module: {p.module} • Owner: {p.owner}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={p.status === "active" ? "default" : p.status === "draft" ? "secondary" : "outline"}>{p.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-${p.id}`}>
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
