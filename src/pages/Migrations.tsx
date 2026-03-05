import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getStatusVariant } from "@/lib/statusUtils";

export default function Migrations() {
  return (
    <StandardPage
      title="Data Mih"
      description="Manage data migration jobs"
    >
      <div className="grid gap-4">
        {[
          { source: "Legacy System", target: "NexusAIFirst", status: "Completed", pct: "100%" },
          { source: "Salesforce", target: "NexusAIFirst", status: "In Progress", pct: "67%" },
        ].map((m) => (
          <Card key={m.source}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{m.source} → {m.target}</h3>
              <p className="text-sm text-muted-foreground">{m.pct} complete</p>
              <StatusBadge status={getStatusVariant(m.status)} label={m.status} />
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
