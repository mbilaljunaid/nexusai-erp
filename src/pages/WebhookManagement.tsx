import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Badge } from "@/components/ui/badge";

export default function WebhookManagement() {
  return (
    <StandardPage
      title="Webhookt"
      description="Manage webhook endpoints and events"
    >
      <div className="grid gap-4">
        {[
          { url: "https://example.com/webhook", events: "lead.created", status: "Active" },
          { url: "https://app.company.com/api", events: "deal.updated", status: "Active" },
        ].map((w, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <p className="font-mono text-sm">{w.url}</p>
              <p className="text-sm text-muted-foreground mt-1">{w.events}</p>
              <Badge className="mt-2 bg-green-100 text-green-800">{w.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
