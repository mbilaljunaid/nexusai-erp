import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, CheckCircle, AlertCircle } from "lucide-react";

export default function LoginHistory() {
  const loginHistory = [
    { id: "l1", date: "Nov 30, 10:15 AM", ip: "192.168.1.100", device: "Chrome/MacOS", location: "New York, USA", status: "success", mfaUsed: true },
    { id: "l2", date: "Nov 30, 9:30 AM", ip: "192.168.1.101", device: "Safari/iPhone", location: "New York, USA", status: "success", mfaUsed: true },
    { id: "l3", date: "Nov 29, 3:45 PM", ip: "192.168.2.50", device: "Firefox/Windows", location: "New York, USA", status: "success", mfaUsed: false },
    { id: "l4", date: "Nov 29, 2:20 PM", ip: "192.168.3.75", device: "Unknown", location: "Unknown", status: "failed", mfaUsed: false },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8" />
          Login History
        </h1>
        <p className="text-muted-foreground mt-2">Track all login attempts and activities</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Total Logins</p>
            <p className="text-2xl font-bold">{loginHistory.length}</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Successful</p>
            <p className="text-2xl font-bold text-green-600">{loginHistory.filter(l => l.status === "success").length}</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Failed Attempts</p>
            <p className="text-2xl font-bold text-red-600">{loginHistory.filter(l => l.status === "failed").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Login Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loginHistory.map((log) => (
              <div key={log.id} className="p-3 border rounded-lg hover-elevate" data-testid={`login-${log.id}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{log.date}</span>
                    {log.status === "success" ? (
                      <Badge className="gap-1"><CheckCircle className="h-3 w-3" />Success</Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Failed</Badge>
                    )}
                  </div>
                  {log.mfaUsed && <Badge variant="outline" className="text-xs">MFA Used</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>IP: {log.ip}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {log.location}
                  </div>
                  <div>Device: {log.device}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
