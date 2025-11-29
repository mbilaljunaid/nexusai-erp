import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DeploymentSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deployment Settings</h1>
        <p className="text-muted-foreground mt-1">Manage deployment configurations</p>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <p className="text-sm font-medium">Current Environment</p>
            <p className="font-semibold text-lg mt-1">Production</p>
          </div>
          <div>
            <p className="text-sm font-medium">Last Deployment</p>
            <p className="font-semibold text-lg mt-1">2025-02-28 14:30 UTC</p>
          </div>
          <Button data-testid="button-view-logs">View Deployment Logs</Button>
        </CardContent>
      </Card>
    </div>
  );
}
