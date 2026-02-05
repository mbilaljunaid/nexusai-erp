import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResponseAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Response Time Analytics</h1>
        <p className="text-muted-foreground mt-1">Support response and resolution metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
            <p className="text-3xl font-bold mt-1">18 min</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
            <p className="text-3xl font-bold mt-1">2.4 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">First Contact Resolution</p>
            <p className="text-3xl font-bold mt-1">68%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
