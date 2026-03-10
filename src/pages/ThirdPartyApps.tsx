import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function ThirdPartyApps() {
  return (
    <StandardPage
      title="Third-P/h"
      description="Manage third-party integrations and apps"
    >
      <div className="grid gap-4">
        {[
          { app: "Slack", connected: true, users: 125 },
          { app: "Salesforce", connected: true, users: 50 },
        ].map((app) => (
          <Card key={app.app}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{app.app}</h3>
              <p className="text-sm text-muted-foreground">{app.users} users using</p>
              <StatusBadge className="mt-2" status={app.connected ? "connected" : "inactive"} label={app.connected ? "Connected" : "Not Connected"} />
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
