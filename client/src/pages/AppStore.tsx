import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function AppStore() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">App Store</h1>
        <p className="text-muted-foreground mt-1">Browse and install enterprise applications</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Slack Integration", category: "Integration", rating: "4.8" }
          { name: "Salesforce Sync", category: "Sync", rating: "4.9" }
        ].map((app) => (
          <Card key={app.name}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{app.name}</h3>
              <p className="text-sm text-muted-foreground">{app.category} • ⭐ {app.rating}</p>
              <Button size="sm" className="mt-3" data-testid={`button-install-${app.name.toLowerCase()}`}>Install</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
