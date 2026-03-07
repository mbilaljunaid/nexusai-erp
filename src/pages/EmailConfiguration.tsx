import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function EmailConfiguration() {
  return (
    <StandardPage
      title="Email Con"
      description="Configure SMTP and email settings"
    >
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-sm font-medium">SMTP Host</Label>
            <Input placeholder="smtp.gmail.com" data-testid="input-smtp-host" />
          </div>
          <div>
            <Label className="text-sm font-medium">From Address</Label>
            <Input placeholder="noreply@company.com" data-testid="input-from-address" />
          </div>
          <Button data-testid="button-save-email">Save Configuration</Button>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
