import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ThirdPartyApps() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Third-Party Apps</h1>
        <p className="text-muted-foreground mt-1">Manage third-party integrations and apps</p>
      </div>
      <div className="grid gap-4">
        {[
          { app: "Slack", connected: true, users: 125 }
          { app: "Salesforce", connected: true, users: 50 }
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
    </div>
  );
}
