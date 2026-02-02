import { Card, CardContent } from "@/components/ui/card";

export default function CustomWorkflows() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Custom Workflows</h1>
        <p className="text-muted-foreground mt-1">Low-code workflow automation</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Active Workflows</p>
          <p className="text-3xl font-bold mt-1">38</p>
        </CardContent>
      </Card>
    </div>
  );
}
