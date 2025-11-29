import { Card, CardContent } from "@/components/ui/card";

export default function MobileAppSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mobile App Settings</h1>
        <p className="text-muted-foreground mt-1">Configure mobile app and offline functionality</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium">Offline Mode</p>
          <p className="font-semibold text-lg mt-2">Enabled</p>
        </CardContent>
      </Card>
    </div>
  );
}
