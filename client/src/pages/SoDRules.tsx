import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus } from "lucide-react";

export default function SoDRules() {
  const [rules] = useState([
    { id: "sod1", role1: "Approver", role2: "Requestor", description: "Cannot approve own requests", mitigation: "Manager approval required", status: "active" }
    { id: "sod2", role1: "Operator", role2: "Auditor", description: "Cannot audit own operations", mitigation: "Independent audit team", status: "active" }
    { id: "sod3", role1: "Preparer", role2: "Authorizer", description: "Different persons for different stages", mitigation: "Workflow routing", status: "active" }
  ]);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8" />
          Segregation of Duties
        </h1>
        <p className="text-muted-foreground mt-2">Define conflicting roles and mitigation controls</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Total Rules</p>
            <p className="text-2xl font-bold">{rules.length}</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{rules.filter(r => r.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Violations Detected</p>
            <p className="text-2xl font-bold text-red-600">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>SoD Rules</CardTitle>
            <Button size="sm" className="gap-1" data-testid="button-add-sod">
              <Plus className="h-3 w-3" />
              New Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="border rounded-lg p-3 hover-elevate" data-testid={`sod-${rule.id}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium">{rule.description}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Roles: {rule.role1} ↔ {rule.role2}</p>
                </div>
                <Badge variant="default">{rule.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Mitigation: {rule.mitigation}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
