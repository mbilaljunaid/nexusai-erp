import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";

export default function IntegrationManagement() {
  return (
    <StandardPage
      title="Integraement</h1>
        <p className="text-muted-foreground mt-1">Manage third-party integrations</p>
      </div>
      <div className="grid gap-4">
        {[
          { name: "Slack", status: "Connected" },
          { name: "Salesforce", status: "Connected" },
        ].map((int) => (
          <Card key={int.name}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{int.name}</h3>
              <p className="text-sm text-muted-foreground">{int.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
