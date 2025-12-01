import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Migrations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Migrations</h1>
        <p className="text-muted-foreground mt-1">Manage data migration jobs</p>
      </div>
      <div className="grid gap-4">
        {[
          { source: "Legacy System", target: "NexusAI", status: "Completed", pct: "100%" }
          { source: "Salesforce", target: "NexusAI", status: "In Progress", pct: "67%" }
        ].map((m) => (
          <Card key={m.source}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{m.source} → {m.target}</h3>
              <p className="text-sm text-muted-foreground">{m.pct} complete</p>
              <Badge className={m.status === "Completed" ? "mt-2 bg-green-100 text-green-800" : "mt-2 bg-blue-100 text-blue-800"}>{m.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
