import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle, Lock } from "lucide-react";

export default function SecurityEventLog() {
  const events = [
    { id: "e1", type: "login", user: "alice@company.com", status: "success", device: "Chrome/macOS", ip: "192.168.1.100", time: "2025-11-30 10:15 AM" },
    { id: "e2", type: "mfa", user: "bob@company.com", status: "success", device: "Authenticator App", ip: "192.168.1.101", time: "2025-11-30 09:45 AM" },
    { id: "e3", type: "password_change", user: "carol@company.com", status: "success", device: "Chrome/Windows", ip: "192.168.1.102", time: "2025-11-30 09:30 AM" },
    { id: "e4", type: "failed_login", user: "david@company.com", status: "failed", device: "Safari/iPhone", ip: "192.168.1.103", time: "2025-11-30 08:50 AM" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "login":
        return <Lock className="h-4 w-4" />;
      case "mfa":
        return <CheckCircle className="h-4 w-4" />;
      case "password_change":
        return <Lock className="h-4 w-4" />;
      case "failed_login":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Security Event Log
        </h1>
        <p className="text-muted-foreground mt-2">Monitor security events and access logs</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Events</p>
            <p className="text-2xl font-bold">1,248</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Failed Logins</p>
            <p className="text-2xl font-bold text-red-600">3</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">MFA Events</p>
            <p className="text-2xl font-bold text-green-600">42</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Alerts</p>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Security Events</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`event-${event.id}`}>
              <div className="flex items-center gap-3 flex-1">
                {getIcon(event.type)}
                <div className="flex-1">
                  <p className="font-medium text-sm capitalize">{event.type.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">{event.user} • {event.device}</p>
                  <p className="text-xs text-muted-foreground">IP: {event.ip} • {event.time}</p>
                </div>
              </div>
              <Badge variant={event.status === "success" ? "default" : "destructive"}>{event.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
