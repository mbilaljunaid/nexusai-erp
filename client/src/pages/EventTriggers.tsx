import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus } from "lucide-react";

export default function EventTriggers() {
  const triggers = [
    { id: "et1", event: "User login", module: "Core", type: "System", recipients: "Admin", notifications: 342 },
    { id: "et2", event: "Invoice approved", module: "Finance", type: "User", recipients: "Finance Team", notifications: 156 },
    { id: "et3", event: "Lead converted", module: "CRM", type: "System", recipients: "Sales Manager", notifications: 89 },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Event Triggers & Notifications
        </h1>
        <p className="text-muted-foreground mt-2">Configure events and notification templates</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-create-trigger">
            <Plus className="h-4 w-4" />
            Create Event Trigger
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Triggers</p>
            <p className="text-2xl font-bold">{triggers.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Today Sent</p>
            <p className="text-2xl font-bold">{triggers.reduce((sum, t) => sum + t.notifications, 0)}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold text-red-600">3</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Active Event Triggers</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {triggers.map((trigger) => (
            <div key={trigger.id} className="p-3 border rounded-lg hover-elevate" data-testid={`trigger-${trigger.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{trigger.event}</h3>
                <Badge variant="secondary">{trigger.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Module: {trigger.module} • Recipients: {trigger.recipients} • Notifications sent: {trigger.notifications}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
