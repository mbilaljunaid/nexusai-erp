import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function WorkflowBuilder() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Builder</h1>
          <p className="text-muted-foreground mt-1">Create and manage automation workflows</p>
        </div>
        <Button data-testid="button-new-workflow"><Plus className="h-4 w-4 mr-2" />New Workflow</Button>
      </div>
      <div className="grid gap-4">
        {[
          { name: "Lead Assignment", status: "Active", triggers: 5 },
          { name: "Auto Response", status: "Active", triggers: 3 },
        ].map((w) => (
          <Card key={w.name}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{w.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{w.triggers} triggers • {w.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
