import { Card, CardContent } from "@/components/ui/card";

export default function AdvancedReporting() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Reporting</h1>
        <p className="text-muted-foreground mt-1">Custom reports and business intelligence</p>
      </div>
      <div className="grid gap-4">
        {[
          { report: "Executive Summary", frequency: "Monthly", status: "Active" }
          { report: "Sales Deep-Dive", frequency: "Weekly", status: "Active" }
        ].map((r) => (
          <Card key={r.report}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{r.report}</h3>
              <p className="text-sm text-muted-foreground">{r.frequency} • {r.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
