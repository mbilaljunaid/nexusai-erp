import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";

export default function IntegrationManagement() {
  return (
    <StandardPage
      title="Integraement"
      description="Manage third-party integrations"
    >
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
