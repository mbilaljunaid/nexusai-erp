import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function MobileAppSettings() {
  return (
    <StandardPage
      title="Mobile gs</h1>
        <p className="text-muted-foreground mt-1">Configure mobile app and offline functionality</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium">Offline Mode</p>
          <p className="font-semibold text-lg mt-2">Enabled</p>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
