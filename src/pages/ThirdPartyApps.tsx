import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Badge } from "@/components/ui/badge";

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
              <Badge className="mt-2 bg-green-100 text-green-800">{app.connected ? "Connected" : "Not Connected"}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
