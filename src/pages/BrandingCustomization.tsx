import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function BrandingCustomization() {
  return (
    <StandardPage
      title="Brandination"
      description="Customize platform branding and appearance"
    >
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-sm font-medium">Company Logo</Label>
            <Input type="file" data-testid="input-logo" />
          </div>
          <div>
            <Label className="text-sm font-medium">Primary Color</Label>
            <Input type="color" data-testid="input-color" />
          </div>
          <Button data-testid="button-save-branding">Save Branding</Button>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
