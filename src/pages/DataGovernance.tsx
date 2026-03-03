import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function DataGovernance() {
  return (
    <StandardPage
      title="Data Goh1>
        <p className="text-muted-foreground mt-1">Manage data policies and retention</p>
      </div>
      <div className="grid gap-4">
        {[
          { policy: "Data Retention", days: 365, status: "Active" },
          { policy: "PII Protection", status: "Active" },
        ].map((p) => (
          <Card key={p.policy}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{p.policy}</h3>
              <p className="text-sm text-muted-foreground">{p.days ? `${p.days} days` : p.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
