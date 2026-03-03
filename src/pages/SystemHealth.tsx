import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getFormMetadata } from "@/lib/formMetadata";

export default function SystemHealth() {
  const formMetadata = getFormMetadata("system-health");

  return (
    <StandardPage
      title="System Health"
      description="Monitor system status and performance"
      classN>
        <p className="text-muted-foreground mt-1">Monitor system status and performance</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">CPU Usage</p>
            <p className="text-3xl font-bold mt-1">42%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Memory Usage</p>
            <p className="text-3xl font-bold mt-1">68%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Disk Usage</p>
            <p className="text-3xl font-bold mt-1">54%</p>
          </CardContent>
        </Card>
      </div>
    </StandardPage>
  );
}
