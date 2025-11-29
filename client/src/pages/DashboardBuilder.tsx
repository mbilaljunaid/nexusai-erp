import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardBuilder() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Builder</h1>
          <p className="text-muted-foreground mt-1">Create custom dashboards</p>
        </div>
        <Button data-testid="button-new-dash"><Plus className="h-4 w-4 mr-2" />New Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Sales Overview", widgets: 5, owner: "You", updated: "Today" },
          { name: "Financial Dashboard", widgets: 8, owner: "Finance Team", updated: "Yesterday" },
          { name: "Operations", widgets: 6, owner: "Manager", updated: "2 days ago" },
        ].map((dash) => (
          <Card key={dash.name} className="hover:shadow-lg transition cursor-pointer">
            <CardContent className="pt-6">
              <h3 className="font-semibold">{dash.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{dash.widgets} widgets • {dash.owner}</p>
              <p className="text-xs text-muted-foreground mt-1">Updated {dash.updated}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
