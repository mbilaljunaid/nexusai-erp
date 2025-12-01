import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Clock, Smartphone } from "lucide-react";

export default function SessionManagement() {
  const sessions = [
    { id: "s1", device: "Chrome on MacOS", ip: "192.168.1.100", lastActive: "2 mins ago", loginTime: "Nov 30, 10:15 AM", status: "active" }
    { id: "s2", device: "Safari on iPhone", ip: "192.168.1.101", lastActive: "1 hour ago", loginTime: "Nov 30, 9:30 AM", status: "active" }
    { id: "s3", device: "Firefox on Windows", ip: "192.168.1.102", lastActive: "3 days ago", loginTime: "Nov 27, 2:45 PM", status: "inactive" }
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Smartphone className="h-8 w-8" />
          Session Management
        </h1>
        <p className="text-muted-foreground mt-2">Manage your active sessions and device access</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Total Sessions</p>
            <p className="text-2xl font-bold">{sessions.length}</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Active Sessions</p>
            <p className="text-2xl font-bold text-green-600">{sessions.filter(s => s.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Session Timeout</p>
            <p className="text-2xl font-bold">30 minutes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Devices & Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="p-3 border rounded-lg hover-elevate" data-testid={`session-${session.id}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium">{session.device}</h3>
                  <p className="text-sm text-muted-foreground">IP: {session.ip}</p>
                </div>
                <Badge variant={session.status === "active" ? "default" : "secondary"}>{session.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Login: {session.loginTime}</span>
                  <span>Last active: {session.lastActive}</span>
                </div>
                {session.status === "active" && (
                  <Button size="icon" variant="ghost" data-testid={`button-logout-${session.id}`}>
                    <LogOut className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
