import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp } from "lucide-react";

export default function UserActivityDashboard() {
  const activities = [
    { id: "a1", user: "alice@company.com", action: "Update", module: "CRM", record: "Lead #12345", timestamp: "2025-11-30 10:15 AM", status: "success" }
    { id: "a2", user: "bob@company.com", action: "Create", module: "Finance", record: "Invoice #INV-001", timestamp: "2025-11-30 09:45 AM", status: "success" }
    { id: "a3", user: "carol@company.com", action: "Delete", module: "HR", record: "Leave Request #LR-123", timestamp: "2025-11-30 09:30 AM", status: "success" }
    { id: "a4", user: "david@company.com", action: "Export", module: "Analytics", record: "Report Export", timestamp: "2025-11-30 08:50 AM", status: "failed" }
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8" />
          User Activity Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Monitor all user actions across modules</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Actions</p>
            <p className="text-2xl font-bold">12,547</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-2xl font-bold">423</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Failed Actions</p>
            <p className="text-2xl font-bold text-red-600">8</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold text-green-600">156</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`activity-${activity.id}`}>
              <div className="flex-1">
                <p className="font-medium text-sm">{activity.user}</p>
                <p className="text-xs text-muted-foreground">{activity.action} in {activity.module} • {activity.record}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
              </div>
              <Badge variant={activity.status === "success" ? "default" : "destructive"}>{activity.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
