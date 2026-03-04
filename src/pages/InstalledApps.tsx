import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function InstalledApps() {
  return (
    <StandardPage
      title="Installtions"
      description="Manage installed apps and extensions"
    >
      <div className="grid gap-4">
        {[
          { name: "Slack Integration", version: "2.1.0", status: "Active" },
          { name: "Salesforce Sync", version: "1.5.2", status: "Active" },
        ].map((app) => (
          <Card key={app.name}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{app.name}</h3>
              <p className="text-sm text-muted-foreground">v{app.version}</p>
              <Badge className="mt-2 bg-green-100 text-green-800">{app.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
