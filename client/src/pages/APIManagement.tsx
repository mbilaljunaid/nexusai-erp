import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function APIManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Management</h1>
          <p className="text-muted-foreground mt-1">Manage API keys and endpoints</p>
        </div>
        <Button data-testid="button-new-key"><Plus className="h-4 w-4 mr-2" />New API Key</Button>
      </div>
      <div className="grid gap-4">
        {[
          { name: "Production Key", created: "Jan 15", lastUsed: "Today" },
          { name: "Development Key", created: "Jan 20", lastUsed: "2 days ago" },
        ].map((k) => (
          <Card key={k.name}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{k.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Created {k.created} • Used {k.lastUsed}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
