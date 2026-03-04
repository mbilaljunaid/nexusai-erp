import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";

export default function NotificationSettings() {
  return (
    <StandardPage
      title="Notificings"
      description="Configure system notifications"
    >
      <div className="grid gap-4">
        {[
          { notif: "Email Notifications", enabled: true },
          { notif: "SMS Alerts", enabled: false },
        ].map((n) => (
          <Card key={n.notif}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{n.notif}</h3>
              <p className="text-sm text-muted-foreground">{n.enabled ? "Enabled" : "Disabled"}</p>
              <Button size="sm" className="mt-3" data-testid={`button-toggle-${n.notif.toLowerCase()}`}>{n.enabled ? "Disable" : "Enable"}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
