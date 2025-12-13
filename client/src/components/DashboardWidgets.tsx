import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GripVertical,
  Plus,
  Settings,
  X,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Calendar,
  FileText,
  Target,
  Zap,
  RotateCcw,
} from "lucide-react";

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: "small" | "medium" | "large";
  enabled: boolean;
}

type WidgetType = 
  | "revenue"
  | "users"
  | "orders"
  | "tasks"
  | "performance"
  | "calendar"
  | "alerts"
  | "activity"
  | "goals"
  | "reports";

const STORAGE_KEY = "nexusai-dashboard-widgets";

const widgetDefinitions: Record<WidgetType, { title: string; icon: typeof BarChart3; description: string }> = {
  revenue: { title: "Revenue Overview", icon: DollarSign, description: "Track revenue metrics and trends" },
  users: { title: "Active Users", icon: Users, description: "Monitor user engagement" },
  orders: { title: "Recent Orders", icon: ShoppingCart, description: "View latest order activity" },
  tasks: { title: "My Tasks", icon: CheckCircle, description: "Track your pending tasks" },
  performance: { title: "Performance", icon: TrendingUp, description: "Key performance indicators" },
  calendar: { title: "Upcoming Events", icon: Calendar, description: "Calendar and schedules" },
  alerts: { title: "System Alerts", icon: AlertTriangle, description: "Important notifications" },
  activity: { title: "Recent Activity", icon: Activity, description: "Latest system activity" },
  goals: { title: "Goals Progress", icon: Target, description: "Track goal completion" },
  reports: { title: "Quick Reports", icon: FileText, description: "Access frequent reports" },
};

const defaultWidgets: Widget[] = [
  { id: "w1", type: "revenue", title: "Revenue Overview", size: "medium", enabled: true },
  { id: "w2", type: "users", title: "Active Users", size: "small", enabled: true },
  { id: "w3", type: "tasks", title: "My Tasks", size: "medium", enabled: true },
  { id: "w4", type: "performance", title: "Performance", size: "small", enabled: true },
  { id: "w5", type: "alerts", title: "System Alerts", size: "small", enabled: true },
  { id: "w6", type: "activity", title: "Recent Activity", size: "medium", enabled: true },
];

function WidgetContent({ type }: { type: WidgetType }) {
  switch (type) {
    case "revenue":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">$48,290</span>
            <Badge className="bg-green-500/10 text-green-600 border-green-200">+12.5%</Badge>
          </div>
          <div className="h-16 flex items-end gap-1">
            {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 70, 95].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/20 rounded-t"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">vs. $42,890 last month</p>
        </div>
      );
    case "users":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">1,245</span>
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">+8.2%</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Online now</span>
              <span className="font-medium">342</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">New today</span>
              <span className="font-medium">28</span>
            </div>
          </div>
        </div>
      );
    case "orders":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">156</span>
            <Badge variant="secondary">Today</Badge>
          </div>
          <div className="space-y-2">
            {[
              { id: "#ORD-1234", amount: "$299", status: "Processing" },
              { id: "#ORD-1233", amount: "$549", status: "Shipped" },
              { id: "#ORD-1232", amount: "$129", status: "Delivered" },
            ].map((order) => (
              <div key={order.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{order.id}</span>
                <span className="font-medium">{order.amount}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "tasks":
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">8</span>
            <span className="text-muted-foreground text-sm">pending tasks</span>
          </div>
          <div className="space-y-2">
            {[
              { task: "Review Q4 Report", due: "Today", priority: "high" },
              { task: "Team standup", due: "2:00 PM", priority: "medium" },
              { task: "Update documentation", due: "Tomorrow", priority: "low" },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  t.priority === "high" ? "bg-red-500" : 
                  t.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                }`} />
                <span className="flex-1 truncate">{t.task}</span>
                <span className="text-muted-foreground text-xs">{t.due}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "performance":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            {[
              { label: "Conversion Rate", value: "3.2%", change: "+0.4%" },
              { label: "Avg. Response Time", value: "1.2s", change: "-0.3s" },
              { label: "Customer Satisfaction", value: "4.8/5", change: "+0.2" },
            ].map((kpi, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{kpi.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{kpi.value}</span>
                  <span className="text-xs text-green-600">{kpi.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "calendar":
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4" />
            Today's Schedule
          </div>
          <div className="space-y-2">
            {[
              { time: "9:00 AM", event: "Daily Standup" },
              { time: "11:00 AM", event: "Client Call" },
              { time: "2:00 PM", event: "Design Review" },
            ].map((e, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-muted-foreground w-16">{e.time}</span>
                <span>{e.event}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "alerts":
      return (
        <div className="space-y-3">
          {[
            { type: "warning", message: "High CPU usage detected", time: "5m ago" },
            { type: "info", message: "Maintenance scheduled", time: "1h ago" },
            { type: "success", message: "Backup completed", time: "3h ago" },
          ].map((alert, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              {alert.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />}
              {alert.type === "info" && <Clock className="w-4 h-4 text-blue-500 mt-0.5" />}
              {alert.type === "success" && <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />}
              <div className="flex-1">
                <p>{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      );
    case "activity":
      return (
        <div className="space-y-3">
          {[
            { action: "New user registered", user: "john@example.com", time: "2m ago" },
            { action: "Order #1234 placed", user: "sarah@example.com", time: "15m ago" },
            { action: "Support ticket resolved", user: "mike@example.com", time: "1h ago" },
          ].map((activity, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Zap className="w-4 h-4 text-primary mt-0.5" />
              <div className="flex-1">
                <p>{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.user} - {activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      );
    case "goals":
      return (
        <div className="space-y-3">
          {[
            { goal: "Revenue Target", progress: 78, target: "$50,000" },
            { goal: "New Customers", progress: 92, target: "100" },
            { goal: "Support Tickets", progress: 65, target: "< 50" },
          ].map((g, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{g.goal}</span>
                <span className="text-muted-foreground">{g.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${g.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    case "reports":
      return (
        <div className="space-y-2">
          {[
            { name: "Sales Report", type: "PDF" },
            { name: "User Analytics", type: "Excel" },
            { name: "Financial Summary", type: "PDF" },
          ].map((report, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{report.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs">{report.type}</Badge>
            </div>
          ))}
        </div>
      );
    default:
      return <p className="text-muted-foreground">Widget content</p>;
  }
}

export function DashboardWidgets() {
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setWidgets(parsed);
        } catch {
          setWidgets(defaultWidgets);
        }
      }
      setIsHydrated(true);
    }
  }, []);

  const saveWidgets = useCallback((newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets));
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetId) return;

    const draggedIndex = widgets.findIndex(w => w.id === draggedWidget);
    const targetIndex = widgets.findIndex(w => w.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, removed);

    saveWidgets(newWidgets);
    setDraggedWidget(null);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const handleDropAtEnd = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedWidget) return;
    const draggedItem = widgets.find(w => w.id === draggedWidget);
    if (!draggedItem) return;
    const newWidgets = widgets.filter(w => w.id !== draggedWidget);
    newWidgets.push(draggedItem);
    saveWidgets(newWidgets);
    setDraggedWidget(null);
  };

  const toggleWidget = (widgetId: string) => {
    const newWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    saveWidgets(newWidgets);
  };

  const removeWidget = (widgetId: string) => {
    const newWidgets = widgets.filter(w => w.id !== widgetId);
    saveWidgets(newWidgets);
  };

  const addWidget = (type: WidgetType) => {
    const def = widgetDefinitions[type];
    const newWidget: Widget = {
      id: `w${Date.now()}`,
      type,
      title: def.title,
      size: "medium",
      enabled: true,
    };
    saveWidgets([...widgets, newWidget]);
  };

  const resetToDefaults = () => {
    saveWidgets(defaultWidgets);
  };

  const changeSize = (widgetId: string, size: "small" | "medium" | "large") => {
    const newWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, size } : w
    );
    saveWidgets(newWidgets);
  };

  const enabledWidgets = widgets.filter(w => w.enabled);
  const availableWidgetTypes = Object.keys(widgetDefinitions) as WidgetType[];

  const getSizeClass = (size: string) => {
    switch (size) {
      case "small": return "col-span-1";
      case "large": return "col-span-2 lg:col-span-3";
      default: return "col-span-1 lg:col-span-2";
    }
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold" data-testid="text-widgets-title">Dashboard Widgets</h2>
          <p className="text-sm text-muted-foreground">Drag and drop to rearrange your widgets</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-customize-widgets">
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Customize Dashboard</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-80 pr-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Toggle Widgets</h4>
                    <div className="space-y-3">
                      {widgets.map((widget) => (
                        <div key={widget.id} className="flex items-center justify-between">
                          <Label htmlFor={`toggle-${widget.id}`} className="flex items-center gap-2">
                            {(() => {
                              const IconComponent = widgetDefinitions[widget.type].icon;
                              return <IconComponent className="w-4 h-4 text-muted-foreground" />;
                            })()}
                            {widget.title}
                          </Label>
                          <Switch
                            id={`toggle-${widget.id}`}
                            checked={widget.enabled}
                            onCheckedChange={() => toggleWidget(widget.id)}
                            data-testid={`switch-widget-${widget.id}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3">Add Widgets</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availableWidgetTypes.map((type) => {
                        const def = widgetDefinitions[type];
                        const exists = widgets.some(w => w.type === type);
                        return (
                          <Button
                            key={type}
                            variant="outline"
                            size="sm"
                            className="justify-start h-auto py-2"
                            disabled={exists}
                            onClick={() => addWidget(type)}
                            data-testid={`button-add-widget-${type}`}
                          >
                            <def.icon className="w-4 h-4 mr-2" />
                            <span className="text-xs">{def.title}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full" 
                    onClick={resetToDefaults}
                    data-testid="button-reset-widgets"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-add-widget">
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Available Widgets</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableWidgetTypes.map((type) => {
                const def = widgetDefinitions[type];
                const exists = widgets.some(w => w.type === type);
                return (
                  <DropdownMenuItem
                    key={type}
                    disabled={exists}
                    onClick={() => addWidget(type)}
                    data-testid={`menu-add-widget-${type}`}
                  >
                    <def.icon className="w-4 h-4 mr-2" />
                    {def.title}
                    {exists && <Badge variant="secondary" className="ml-auto text-xs">Added</Badge>}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enabledWidgets.map((widget) => {
          const IconComponent = widgetDefinitions[widget.type].icon;
          return (
            <Card
              key={widget.id}
              className={`${getSizeClass(widget.size)} transition-all ${
                draggedWidget === widget.id ? "opacity-50 scale-95" : ""
              } ${draggedWidget && draggedWidget !== widget.id ? "hover:border-primary" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, widget.id)}
              onDragEnd={handleDragEnd}
              data-testid={`widget-card-${widget.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div 
                      className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-muted"
                      data-testid={`drag-handle-${widget.id}`}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                    <span data-testid={`text-widget-title-${widget.id}`}>{widget.title}</span>
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        data-testid={`button-widget-menu-${widget.id}`}
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Widget Size</DropdownMenuLabel>
                      <DropdownMenuItem 
                        onClick={() => changeSize(widget.id, "small")}
                        data-testid={`menu-size-small-${widget.id}`}
                      >
                        Small
                        {widget.size === "small" && <CheckCircle className="w-4 h-4 ml-auto" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => changeSize(widget.id, "medium")}
                        data-testid={`menu-size-medium-${widget.id}`}
                      >
                        Medium
                        {widget.size === "medium" && <CheckCircle className="w-4 h-4 ml-auto" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => changeSize(widget.id, "large")}
                        data-testid={`menu-size-large-${widget.id}`}
                      >
                        Large
                        {widget.size === "large" && <CheckCircle className="w-4 h-4 ml-auto" />}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => removeWidget(widget.id)}
                        className="text-red-600"
                        data-testid={`menu-remove-widget-${widget.id}`}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove Widget
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <WidgetContent type={widget.type} />
              </CardContent>
            </Card>
          );
        })}
        {enabledWidgets.length > 0 && draggedWidget && (
          <div
            className="col-span-1 border-2 border-dashed border-muted-foreground/30 rounded-lg min-h-32 flex items-center justify-center transition-colors hover:border-primary hover:bg-muted/30"
            onDragOver={handleDragOver}
            onDrop={handleDropAtEnd}
            data-testid="widget-drop-zone-end"
          >
            <span className="text-muted-foreground text-sm">Drop here to move to end</span>
          </div>
        )}
      </div>

      {enabledWidgets.length === 0 && (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium" data-testid="text-no-widgets">No widgets enabled</h3>
              <p className="text-sm text-muted-foreground">
                Click "Customize" or "Add Widget" to add widgets to your dashboard
              </p>
            </div>
            <Button onClick={resetToDefaults} data-testid="button-add-default-widgets">
              <Plus className="w-4 h-4 mr-2" />
              Add Default Widgets
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
