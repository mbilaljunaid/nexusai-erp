import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WorkflowTemplates() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workflow Templates</h1>
        <p className="text-muted-foreground mt-1">Pre-built workflow templates</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Lead Auto-Assign", category: "Sales" },
          { name: "Ticket Auto-Response", category: "Service" },
        ].map((t) => (
          <Card key={t.name}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.category}</p>
              <Button size="sm" className="mt-3" data-testid={`button-use-${t.name.toLowerCase()}`}>Use Template</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
