import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure core system parameters</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">General Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Organization Name</label>
            <Input placeholder="Your Company" data-testid="input-org-name" />
          </div>
          <div>
            <label className="text-sm font-medium">Default Timezone</label>
            <Input placeholder="UTC" data-testid="input-timezone" />
          </div>
          <Button data-testid="button-save">Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
