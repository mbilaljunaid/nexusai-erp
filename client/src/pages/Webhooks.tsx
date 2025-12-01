import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Webhooks() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground mt-1">Configure event webhooks</p>
        </div>
        <Button data-testid="button-new-webhook"><Plus className="h-4 w-4 mr-2" />New Webhook</Button>
      </div>
      <div className="grid gap-4">
        {[
          { url: "https://example.com/api", events: "lead.*", status: "Active" }
          { url: "https://app.company.com", events: "deal.*", status: "Active" }
        ].map((w, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <p className="font-mono text-sm">{w.url}</p>
              <p className="text-sm text-muted-foreground mt-1">{w.events}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
