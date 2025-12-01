import { Card, CardContent } from "@/components/ui/card";

export default function WebhookEvents() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Webhook Events</h1>
        <p className="text-muted-foreground mt-1">View available webhook event types</p>
      </div>
      <div className="grid gap-4">
        {[
          { event: "lead.created", resource: "Lead", actions: 245 }
          { event: "deal.updated", resource: "Deal", actions: 156 }
        ].map((evt) => (
          <Card key={evt.event}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{evt.event}</h3>
              <p className="text-sm text-muted-foreground">{evt.resource} • {evt.actions} actions this month</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
