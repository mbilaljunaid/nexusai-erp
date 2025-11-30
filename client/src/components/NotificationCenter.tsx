import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState([
    { id: "n1", title: "System Update", message: "New features available", type: "info" },
    { id: "n2", title: "Alert", message: "High churn risk detected", type: "warning" },
  ]);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button size="icon" variant="ghost" onClick={() => setOpen(!open)} data-testid="button-notifications" className="relative">
        <Bell className="h-4 w-4" />
        {notifications.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">{notifications.length}</Badge>
        )}
      </Button>

      {open && (
        <Card className="absolute right-0 mt-2 w-80 animate-in slide-in-from-top-2 shadow-lg z-50" data-testid="notifications-panel">
          <div className="p-4 space-y-2">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-start justify-between p-3 bg-muted rounded-lg" data-testid={`notification-${notif.id}`}>
                <div>
                  <h4 className="font-medium text-sm">{notif.title}</h4>
                  <p className="text-xs text-muted-foreground">{notif.message}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setNotifications(notifications.filter((n) => n.id !== notif.id))}
                  data-testid={`button-close-notif-${notif.id}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
