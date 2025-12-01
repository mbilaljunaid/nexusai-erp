import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus } from "lucide-react";

export default function RoleHierarchy() {
  const [hierarchy] = useState([
    { id: "h1", parent: "System Admin", children: ["Tenant Admin", "Security Officer"], status: "active" }
    { id: "h2", parent: "Tenant Admin", children: ["Manager", "Supervisor"], status: "active" }
    { id: "h3", parent: "Manager", children: ["Employee", "Operator"], status: "active" }
  ]);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GitBranch className="h-8 w-8" />
          Role Hierarchy
        </h1>
        <p className="text-muted-foreground mt-2">Manage role inheritance and hierarchies</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Role Inheritance Tree</CardTitle>
            <Button size="sm" className="gap-1" data-testid="button-add-hierarchy">
              <Plus className="h-3 w-3" />
              New Hierarchy
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {hierarchy.map((h) => (
            <div key={h.id} className="border rounded-lg p-4 hover-elevate" data-testid={`hierarchy-${h.id}`}>
              <div className="flex items-center gap-4 mb-3">
                <div className="font-semibold text-lg min-w-32">{h.parent}</div>
                <Badge variant="default">Parent</Badge>
              </div>
              <div className="ml-8 space-y-2">
                {h.children.map((child, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-0.5 h-4 bg-border" />
                    <span className="text-muted-foreground">{child}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
