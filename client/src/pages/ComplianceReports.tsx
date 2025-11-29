import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ComplianceReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance Reports</h1>
        <p className="text-muted-foreground mt-1">Generate compliance and regulatory reports</p>
      </div>
      <div className="grid gap-4">
        {[
          { name: "GDPR Compliance", date: "Last generated: Today" },
          { name: "SOC 2 Report", date: "Last generated: Jan 2025" },
        ].map((report) => (
          <Card key={report.name}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{report.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{report.date}</p>
              <Button size="sm" className="mt-3" data-testid={`button-generate-${report.name.toLowerCase()}`}>Generate</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
