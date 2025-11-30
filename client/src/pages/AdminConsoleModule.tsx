import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function AdminConsoleModule() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Console</h1>
        <p className="text-muted-foreground">System health, configuration, and audit logs</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="text-2xl font-bold mt-1">Healthy</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">API Uptime</p>
              <p className="text-2xl font-bold mt-1">99.98%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
              <p className="text-2xl font-bold mt-1">542</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">DB Size</p>
              <p className="text-2xl font-bold mt-1">2.4GB</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Audit Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { action: "User Created", user: "admin@company.com", time: "2 mins ago" },
              { action: "Role Updated", user: "admin@company.com", time: "1 hour ago" },
              { action: "Permission Granted", user: "manager@company.com", time: "3 hours ago" },
            ].map((log, i) => (
              <div key={i} className="p-3 border rounded text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { key: "API Rate Limit", value: "10K/min" },
              { key: "Session Timeout", value: "30 mins" },
              { key: "Max Upload Size", value: "100MB" },
              { key: "Data Retention", value: "90 days" },
            ].map((setting) => (
              <div key={setting.key} className="flex justify-between p-2 rounded hover:bg-muted text-sm">
                <span>{setting.key}</span>
                <span className="font-mono text-xs">{setting.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
