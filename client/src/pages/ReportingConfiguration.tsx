import { Card, CardContent } from "@/components/ui/card";

export default function ReportingConfiguration() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reporting Configuration</h1>
        <p className="text-muted-foreground mt-1">Configure reporting and BI settings</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium">Default Report Format</p>
          <p className="font-semibold text-lg mt-2">PDF</p>
        </CardContent>
      </Card>
    </div>
  );
}
