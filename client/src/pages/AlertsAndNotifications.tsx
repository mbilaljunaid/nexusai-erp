import { Card, CardContent } from "@/components/ui/card";

export default function AlertsAndNotifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
        <p className="text-muted-foreground mt-1">Configure system alerts and notifications</p>
      </div>
      <div className="grid gap-4">
        {[
          { alert: "High CPU Usage", threshold: ">80%", enabled: true },
          { alert: "Low Disk Space", threshold: "<10%", enabled: true },
        ].map((a) => (
          <Card key={a.alert}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{a.alert}</h3>
              <p className="text-sm text-muted-foreground">Threshold: {a.threshold}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
