import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Copy } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WorkflowTemplates() {
  const { toast } = useToast();
  const [newTemplate, setNewTemplate] = useState({ name: "", category: "Sales" });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/workflow-templates"],
    queryFn: () => fetch("/api/workflow-templates").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/workflow-templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-templates"] });
      setNewTemplate({ name: "", category: "Sales" });
      toast({ title: "Template created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/workflow-templates/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow-templates"] });
      toast({ title: "Template deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Copy className="w-8 h-8" />Workflow Templates</h1>
        <p className="text-muted-foreground mt-1">Pre-built workflow templates</p>
      </div>

      <Card data-testid="card-new-template">
        <CardHeader><CardTitle className="text-base">Create Template</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Template name" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} data-testid="input-name" />
            <Select value={newTemplate.category} onValueChange={(v) => setNewTemplate({ ...newTemplate, category: v })}>
              <SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newTemplate)} disabled={createMutation.isPending || !newTemplate.name} className="w-full" data-testid="button-create-template">
            <Plus className="w-4 h-4 mr-2" /> Create Template
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? <p>Loading...</p> : templates.length === 0 ? <p className="text-muted-foreground text-center py-4">No templates</p> : templates.map((t: any) => (
          <Card key={t.id} data-testid={`template-${t.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t.category}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(t.id)} data-testid={`button-delete-${t.id}`}>
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
