import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function APIDocumentation() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground mt-1">View and manage API documentation</p>
      </div>
      <div className="flex gap-2 mb-4">
        <Input placeholder="Search endpoints..." data-testid="input-search-api" className="flex-1" />
      </div>
      <div className="grid gap-4">
        {[
          { endpoint: "GET /api/leads", version: "v1" },
          { endpoint: "POST /api/deals", version: "v1" },
        ].map((ep) => (
          <Card key={ep.endpoint}>
            <CardContent className="pt-6">
              <p className="font-mono text-sm">{ep.endpoint}</p>
              <p className="text-xs text-muted-foreground mt-1">Version: {ep.version}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
