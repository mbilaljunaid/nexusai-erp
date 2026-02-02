import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BrandingCustomization() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Branding Customization</h1>
        <p className="text-muted-foreground mt-1">Customize platform branding and appearance</p>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Company Logo</label>
            <Input type="file" data-testid="input-logo" />
          </div>
          <div>
            <label className="text-sm font-medium">Primary Color</label>
            <Input type="color" data-testid="input-color" />
          </div>
          <Button data-testid="button-save-branding">Save Branding</Button>
        </CardContent>
      </Card>
    </div>
  );
}
