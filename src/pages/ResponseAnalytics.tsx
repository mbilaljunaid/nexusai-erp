import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function ResponseAnalytics() {
  return (
    <StandardPage
      title="Responslytics"
      description="Support response and resolution metrics"
    >

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
            <p className="text-3xl font-bold mt-1">18 min</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
            <p className="text-3xl font-bold mt-1">2.4 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">First Contact Resolution</p>
            <p className="text-3xl font-bold mt-1">68%</p>
          </CardContent>
        </Card>
      </div>
    </StandardPage>
  );
}
