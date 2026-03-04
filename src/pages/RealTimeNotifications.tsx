import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function RealTimeNotifications() {
  return (
    <StandardPage
      title="Real-Tiations"
      description="Live alerts and push notifications"
    >
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Active Subscriptions</p>
          <p className="text-3xl font-bold mt-1">245</p>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
