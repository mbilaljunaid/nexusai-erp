import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DeveloperTools() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Developer Tools</h1>
        <p className="text-muted-foreground mt-1">Access developer utilities and testing tools</p>
      </div>
      <div className="grid gap-4">
        {[
          { tool: "API Explorer", desc: "Test API endpoints" },
          { tool: "GraphQL Playground", desc: "Query GraphQL API" },
        ].map((t) => (
          <Card key={t.tool}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{t.tool}</h3>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
              <Button size="sm" className="mt-3" data-testid={`button-open-${t.tool.toLowerCase()}`}>Open</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
