import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Wifi, Cloud } from "lucide-react";

export default function MobileSync() {
  const { data: devices = [] } = useQuery({ queryKey: ["/api/mobile/devices"] }) as { data: any[] };
  const { data: syncQueue = [] } = useQuery({ queryKey: ["/api/mobile/sync"] }) as { data: any[] };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Smartphone className="h-8 w-8" />
          Mobile Synchronization
        </h1>
        <p className="text-muted-foreground mt-2">Offline-first mobile app sync with iOS & Android</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Connected Devices
              <Smartphone className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">iOS & Android apps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Pending Syncs
              <Wifi className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncQueue.filter((s: any) => !s.synced).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting sync</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Sync Status
              <Cloud className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default">Real-time</Badge>
            <p className="text-xs text-muted-foreground mt-2">Bidirectional sync</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 1 Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">iOS App</span>
            <Badge>App Store</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Android App</span>
            <Badge variant="secondary">Google Play</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Offline-First Architecture</span>
            <Badge variant="secondary">Local-first sync</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Push Notifications</span>
            <Badge variant="secondary">Real-time alerts</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Biometric Auth</span>
            <Badge variant="secondary">Face/Touch ID</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
