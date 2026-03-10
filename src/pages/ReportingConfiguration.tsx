import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function ReportingConfiguration() {
  return (
    <StandardPage
      title="Reportiration"
      description="Configure reporting and BI settings"
    >
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium">Default Report Format</p>
          <p className="font-semibold text-lg mt-2">PDF</p>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
