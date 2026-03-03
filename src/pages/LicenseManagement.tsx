import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Badge } from "@/components/ui/badge";

export default function LicenseManagement() {
  return (
    <StandardPage
      title="Licenset</h1>
        <p className="text-muted-foreground mt-1">Manage product licenses and activations</p>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">License Type</p>
            <p className="font-semibold text-lg mt-1">Enterprise Edition</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valid Until</p>
            <p className="font-semibold text-lg mt-1">Dec 31, 2025</p>
          </div>
          <Badge className="bg-green-100 text-green-800">Active</Badge>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
