import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus } from "lucide-react";

export default function AutomationRules() {
  const rules = [
    { id: "ar1", name: "Auto-assign high-value leads", module: "CRM", trigger: "Lead created", priority: 90, status: "active", actions: 2 },
    { id: "ar2", name: "Send approval notification", module: "Finance", trigger: "Invoice threshold exceeded", priority: 80, status: "active", actions: 1 },
    { id: "ar3", name: "Create task on ticket", module: "Service", trigger: "Ticket created", priority: 70, status: "active", actions: 1 },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8" />
          Automation Rules
        </h1>
        <p className="text-muted-foreground mt-2">Manage business automation rules</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-create-automation">
            <Plus className="h-4 w-4" />
            Create New Rule
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Rules</p>
            <p className="text-2xl font-bold">{rules.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{rules.filter(r => r.status === "active").length}</p>
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
          {rules.map((rule) => (
            <div key={rule.id} className="p-3 border rounded-lg hover-elevate" data-testid={`rule-${rule.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{rule.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">P{rule.priority}</Badge>
                  <Badge variant="default">{rule.status}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Module: {rule.module} • Trigger: {rule.trigger} • Actions: {rule.actions}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
