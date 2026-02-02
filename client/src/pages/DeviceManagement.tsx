import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, X, Plus } from "lucide-react";

export default function DeviceManagement() {
  const devices = [
    { id: "d1", name: "MacBook Pro", type: "Desktop", os: "macOS 14", browser: "Chrome 120", ip: "192.168.1.100", status: "approved", lastUsed: "2 mins ago" },
    { id: "d2", name: "iPhone 14", type: "Mobile", os: "iOS 17", browser: "Safari", ip: "192.168.1.101", status: "approved", lastUsed: "1 hour ago" },
    { id: "d3", name: "iPad Air", type: "Tablet", os: "iPadOS 17", browser: "Safari", ip: "192.168.1.102", status: "pending", lastUsed: "3 days ago" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Monitor className="h-8 w-8" />
          Device Management
        </h1>
        <p className="text-muted-foreground mt-2">Manage enrolled devices and access permissions</p>
      </div>

      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Trusted Devices: {devices.filter(d => d.status === "approved").length}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full gap-2" data-testid="button-enroll-device">
            <Plus className="h-4 w-4" />
            Enroll New Device
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {devices.map((device) => (
          <Card key={device.id} className="hover-elevate" data-testid={`device-${device.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {device.type === "Mobile" ? (
                    <Smartphone className="h-5 w-5 text-muted-foreground mt-1" />
                  ) : (
                    <Monitor className="h-5 w-5 text-muted-foreground mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{device.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {device.type} • {device.os} • {device.browser}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">IP: {device.ip} • Last used: {device.lastUsed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={device.status === "approved" ? "default" : "secondary"}>{device.status}</Badge>
                  {device.status === "pending" && (
                    <Button size="sm" variant="outline" data-testid={`button-approve-${device.id}`}>Approve</Button>
                  )}
                  <Button size="icon" variant="ghost" data-testid={`button-remove-${device.id}`}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">IP Whitelisting</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Restrict access to approved IP addresses</p>
          <Button variant="outline" className="w-full" data-testid="button-manage-ips">Manage IP Whitelist</Button>
        </CardContent>
      </Card>
    </div>
  );
}
