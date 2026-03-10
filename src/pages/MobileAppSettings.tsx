import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function MobileAppSettings() {
  return (
    <StandardPage
      title="Mobile gs"
      description="Configure mobile app and offline functionality"
    >
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium">Offline Mode</p>
          <p className="font-semibold text-lg mt-2">Enabled</p>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
