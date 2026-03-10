import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function LicenseManagement() {
  return (
    <StandardPage
      title="Licenset"
      description="Manage product licenses and activations"
    >
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
          <StatusBadge status="active" />
        </CardContent>
      </Card>
    </StandardPage>
  );
}
