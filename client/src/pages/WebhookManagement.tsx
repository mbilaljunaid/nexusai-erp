import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WebhookManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Webhook Management</h1>
        <p className="text-muted-foreground mt-1">Manage webhook endpoints and events</p>
      </div>
      <div className="grid gap-4">
        {[
          { url: "https://example.com/webhook", events: "lead.created", status: "Active" }
          { url: "https://app.company.com/api", events: "deal.updated", status: "Active" }
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
    </div>
  );
}
