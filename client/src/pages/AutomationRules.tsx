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

export default function AutomationRules() {
  const { toast } = useToast();
  const [newRule, setNewRule] = useState({ name: "", module: "CRM", trigger: "created", priority: "80" });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["/api/automation-rules"],
    queryFn: () => fetch("/api/automation-rules").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/automation-rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation-rules"] });
      setNewRule({ name: "", module: "CRM", trigger: "created", priority: "80" });
      toast({ title: "Rule created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/automation-rules/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation-rules"] });
      toast({ title: "Rule deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8" />
          Automation Rules
        </h1>
        <p className="text-muted-foreground mt-2">Manage business automation rules</p>
      </div>

      <Card data-testid="card-new-rule">
        <CardHeader><CardTitle className="text-base">Create Rule</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Rule name" value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} data-testid="input-name" />
            <Select value={newRule.module} onValueChange={(v) => setNewRule({ ...newRule, module: v })}>
              <SelectTrigger data-testid="select-module"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CRM">CRM</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newRule.trigger} onValueChange={(v) => setNewRule({ ...newRule, trigger: v })}>
              <SelectTrigger data-testid="select-trigger"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="threshold">Threshold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newRule.priority} onValueChange={(v) => setNewRule({ ...newRule, priority: v })}>
              <SelectTrigger data-testid="select-priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="70">70</SelectItem>
                <SelectItem value="80">80</SelectItem>
                <SelectItem value="90">90</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newRule)} disabled={createMutation.isPending || !newRule.name} className="w-full gap-2" data-testid="button-create-automation">
            <Plus className="h-4 w-4" />
            Create Rule
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Rules</p>
            <p className="text-2xl font-bold">{rules.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{rules.filter((r: any) => r.status === "active").length || 0}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Executions Today</p>
            <p className="text-2xl font-bold">1,247</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Active Rules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : rules.length === 0 ? <p className="text-muted-foreground text-center py-4">No rules</p> : rules.map((rule: any) => (
            <div key={rule.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`rule-${rule.id}`}>
              <div>
                <h3 className="font-semibold">{rule.name}</h3>
                <p className="text-sm text-muted-foreground">Module: {rule.module} • Trigger: {rule.trigger}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">P{rule.priority}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(rule.id)} data-testid={`button-delete-${rule.id}`}>
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
