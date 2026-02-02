import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, X, CheckCheck, Trash2, AlertCircle, Info, Star, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";

interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: "alert" | "update" | "recommendation" | "info";
  timestamp?: string;
  createdAt?: string;
  read: boolean;
  isRead?: boolean;
  actionUrl?: string;
}

interface APINotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl: string | null;
  metadata: any;
  createdAt: string;
}

const STORAGE_KEY_DISMISSED = "nexusai-notifications-dismissed";

const fallbackNotifications: Notification[] = [
  {
    id: "n1",
    title: "System Maintenance",
    message: "Scheduled maintenance on Dec 20th, 2-4 AM UTC",
    type: "alert",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "n2",
    title: "High Churn Risk Detected",
    message: "3 accounts show signs of potential churn. Review recommended.",
    type: "alert",
    timestamp: "3 hours ago",
    read: false,
    actionUrl: "/analytics/churn-risk",
  },
  {
    id: "n3",
    title: "New Feature: AI Insights",
    message: "Explore AI-powered analytics in your dashboard",
    type: "update",
    timestamp: "1 day ago",
    read: false,
    actionUrl: "/copilot",
  },
  {
    id: "n4",
    title: "Workflow Automation Available",
    message: "Create automated workflows to save time on repetitive tasks",
    type: "update",
    timestamp: "2 days ago",
    read: true,
    actionUrl: "/workflow-builder",
  },
  {
    id: "n5",
    title: "Optimize Your Sales Pipeline",
    message: "Based on your data, consider adding lead scoring to improve conversions",
    type: "recommendation",
    timestamp: "3 days ago",
    read: true,
    actionUrl: "/lead-scoring",
  },
];

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function normalizeNotification(n: APINotification): Notification {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: (n.type as Notification["type"]) || "info",
    timestamp: formatTimestamp(n.createdAt),
    read: n.isRead,
    actionUrl: n.actionUrl || undefined,
  };
}

export function NotificationCenter() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [dismissedIds, setDismissedIds] = useState<(string | number)[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const { data: apiNotifications, isLoading } = useQuery<APINotification[]>({
    queryKey: ['/api/notifications'],
    retry: false,
  });

  const { data: unreadCountData } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
    retry: false,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string | number) => {
      await apiRequest('PATCH', `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== "undefined") {
      const storedDismissed = localStorage.getItem(STORAGE_KEY_DISMISSED);
      if (storedDismissed) {
        setDismissedIds(JSON.parse(storedDismissed));
      }
    }
  }, []);

  const notifications: Notification[] = apiNotifications
    ? apiNotifications.map(normalizeNotification).filter(n => !dismissedIds.includes(n.id))
    : fallbackNotifications.filter(n => !dismissedIds.includes(n.id));

  const unreadCount = unreadCountData?.count ?? notifications.filter(n => !n.read).length;
  const alertNotifications = notifications.filter(n => n.type === "alert");
  const updateNotifications = notifications.filter(n => n.type === "update");
  const recommendationNotifications = notifications.filter(n => n.type === "recommendation" || n.type === "info");

  const saveDismissedState = (dismissedId: string | number) => {
    if (typeof window !== "undefined") {
      const newDismissedIds = [...dismissedIds, dismissedId];
      setDismissedIds(newDismissedIds);
      localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify(newDismissedIds));
    }
  };

  const markAsRead = (id: string | number) => {
    markReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const dismissNotification = (id: string | number) => {
    saveDismissedState(id);
  };

  const clearAll = () => {
    if (typeof window !== "undefined") {
      const currentIds = notifications.map(n => n.id);
      const mergedDismissedIds = [...new Set([...dismissedIds, ...currentIds])];
      setDismissedIds(mergedDismissedIds);
      localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify(mergedDismissedIds));
    }
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "update":
        return <Sparkles className="w-4 h-4 text-blue-500" />;
      case "recommendation":
        return <Star className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeBadge = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return <Badge variant="destructive" className="text-xs" data-testid={`badge-type-alert`}>Alert</Badge>;
      case "update":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 text-xs" data-testid={`badge-type-update`}>Update</Badge>;
      case "recommendation":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200 text-xs" data-testid={`badge-type-tip`}>Tip</Badge>;
      case "info":
        return <Badge variant="secondary" className="text-xs" data-testid={`badge-type-info`}>Info</Badge>;
    }
  };

  const renderNotificationList = (items: Notification[]) => {
    if (items.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground text-sm" data-testid="text-no-notifications">
          No notifications
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
              notif.read ? "bg-muted/50" : "bg-primary/5 border border-primary/10"
            }`}
            data-testid={`notification-item-${notif.id}`}
          >
            <div className="shrink-0 mt-0.5">
              {getTypeIcon(notif.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 
                  className={`font-medium text-sm ${notif.read ? "text-muted-foreground" : ""}`}
                  data-testid={`text-notification-title-${notif.id}`}
                >
                  {notif.title}
                </h4>
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" data-testid={`indicator-unread-${notif.id}`} />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2" data-testid={`text-notification-message-${notif.id}`}>
                {notif.message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid={`text-notification-time-${notif.id}`}>
                  <Clock className="w-3 h-3" />
                  {notif.timestamp}
                </span>
                {getTypeBadge(notif.type)}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!notif.read && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => markAsRead(notif.id)}
                  title="Mark as read"
                  data-testid={`button-mark-read-${notif.id}`}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => dismissNotification(notif.id)}
                title="Dismiss"
                data-testid={`button-dismiss-notification-${notif.id}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={() => setOpen(!open)} 
        data-testid="button-notifications" 
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {isHydrated && unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs" data-testid="badge-notification-count">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
            data-testid="overlay-notifications-backdrop"
          />
          <Card 
            className="absolute right-0 mt-2 w-96 animate-in slide-in-from-top-2 shadow-xl z-50" 
            data-testid="panel-notifications"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2" data-testid="text-notifications-title">
                  <Bell className="w-4 h-4" />
                  Notifications
                  {isHydrated && unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs" data-testid="badge-unread-count">{unreadCount} new</Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={markAllAsRead}
                      data-testid="button-mark-all-read"
                    >
                      <CheckCheck className="w-3 h-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={clearAll}
                      title="Clear all"
                      data-testid="button-clear-all-notifications"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-4">
                <TabsList className="w-full grid grid-cols-4 h-8">
                  <TabsTrigger value="all" className="text-xs" data-testid="tab-notifications-all">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="alerts" className="text-xs" data-testid="tab-notifications-alerts">
                    Alerts
                    {alertNotifications.filter(n => !n.read).length > 0 && (
                      <span className="ml-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="updates" className="text-xs" data-testid="tab-notifications-updates">
                    Updates
                  </TabsTrigger>
                  <TabsTrigger value="tips" className="text-xs" data-testid="tab-notifications-tips">
                    Tips
                  </TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="pt-3">
                <ScrollArea className="h-80">
                  <TabsContent value="all" className="mt-0" data-testid="content-tab-all">
                    {renderNotificationList(notifications)}
                  </TabsContent>
                  <TabsContent value="alerts" className="mt-0" data-testid="content-tab-alerts">
                    {renderNotificationList(alertNotifications)}
                  </TabsContent>
                  <TabsContent value="updates" className="mt-0" data-testid="content-tab-updates">
                    {renderNotificationList(updateNotifications)}
                  </TabsContent>
                  <TabsContent value="tips" className="mt-0" data-testid="content-tab-tips">
                    {renderNotificationList(recommendationNotifications)}
                  </TabsContent>
                </ScrollArea>
              </CardContent>
            </Tabs>
          </Card>
        </>
      )}
    </div>
  );
}
