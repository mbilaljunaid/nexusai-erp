import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function OperationalAnalytics() {
  return (
    <StandardPage
      title="Operational Analytics"
      description="Operations efficiency and productivity"
    >

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Process Efficiency</p>
            <p className="text-3xl font-bold mt-1">87%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Resource Utilization</p>
            <p className="text-3xl font-bold mt-1">76%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">On-Time Delivery</p>
            <p className="text-3xl font-bold mt-1">94%</p>
          </CardContent>
        </Card>
      </div>
    </StandardPage>
  );
}
