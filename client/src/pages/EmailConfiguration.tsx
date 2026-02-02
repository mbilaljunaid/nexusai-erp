import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EmailConfiguration() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Configuration</h1>
        <p className="text-muted-foreground mt-1">Configure SMTP and email settings</p>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">SMTP Host</label>
            <Input placeholder="smtp.gmail.com" data-testid="input-smtp-host" />
          </div>
          <div>
            <label className="text-sm font-medium">From Address</label>
            <Input placeholder="noreply@company.com" data-testid="input-from-address" />
          </div>
          <Button data-testid="button-save-email">Save Configuration</Button>
        </CardContent>
      </Card>
    </div>
  );
}
