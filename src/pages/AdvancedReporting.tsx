import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function AdvancedReporting() {
  return (
    <StandardPage
      title="Advanceg"
      description="Custom reports and business intelligence"
    >
      <div className="grid gap-4">
        {[
          { report: "Executive Summary", frequency: "Monthly", status: "Active" },
          { report: "Sales Deep-Dive", frequency: "Weekly", status: "Active" },
        ].map((r) => (
          <Card key={r.report}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{r.report}</h3>
              <p className="text-sm text-muted-foreground">{r.frequency} • {r.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
