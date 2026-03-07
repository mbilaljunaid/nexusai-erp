import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SystemSettings() {
  return (
    <StandardPage
      title="System h"
      description="Configure core system parameters"
    >
      <Card>
        <CardHeader><CardTitle className="text-base">General Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Organization Name</Label>
            <Input placeholder="Your Company" data-testid="input-org-name" />
          </div>
          <div>
            <Label className="text-sm font-medium">Default Timezone</Label>
            <Input placeholder="UTC" data-testid="input-timezone" />
          </div>
          <Button data-testid="button-save">Save Settings</Button>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
