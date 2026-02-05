import { Card, CardContent } from "@/components/ui/card";

export default function RealTimeNotifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Real-Time Notifications</h1>
        <p className="text-muted-foreground mt-1">Live alerts and push notifications</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Active Subscriptions</p>
          <p className="text-3xl font-bold mt-1">245</p>
        </CardContent>
      </Card>
    </div>
  );
}
