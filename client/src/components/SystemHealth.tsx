import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Database, 
  Cpu, 
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SystemMetric {
  name: string;
  status: "healthy" | "warning" | "critical";
  value: number;
  max: number;
  unit: string;
  icon: typeof Activity;
}

interface AIInsight {
  id: string;
  type: "optimization" | "warning" | "info";
  message: string;
  action?: string;
}

const statusColors = {
  healthy: "bg-green-500/10 text-green-600 dark:text-green-400",
  warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  critical: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const statusIcons = {
  healthy: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
};

interface SystemHealthProps {
  metrics?: SystemMetric[];
  insights?: AIInsight[];
  onRefresh?: () => void;
}

export function SystemHealth({ metrics, insights, onRefresh }: SystemHealthProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fallback data for demo/preview when no API data provided
  const defaultMetrics: SystemMetric[] = metrics || [
    { name: "API Response", status: "healthy", value: 45, max: 200, unit: "ms", icon: Activity },
    { name: "Database", status: "healthy", value: 23, max: 100, unit: "%", icon: Database },
    { name: "Memory Usage", status: "warning", value: 78, max: 100, unit: "%", icon: Cpu },
    { name: "Storage", status: "healthy", value: 42, max: 100, unit: "GB", icon: HardDrive },
  ];

  const defaultInsights: AIInsight[] = insights || [
    {
      id: "1",
      type: "optimization",
      message: "Memory usage is elevated. Consider clearing cached data.",
      action: "Clear Cache",
    },
    {
      id: "2",
      type: "info",
      message: "All API endpoints are responding normally.",
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const overallStatus = defaultMetrics.some(m => m.status === "critical")
    ? "critical"
    : defaultMetrics.some(m => m.status === "warning")
    ? "warning"
    : "healthy";

  const StatusIcon = statusIcons[overallStatus];

  return (
    <Card data-testid="card-system-health">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">System Health</CardTitle>
          <Badge variant="secondary" className={statusColors[overallStatus]}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {overallStatus}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          className={isRefreshing ? "animate-spin" : ""}
          data-testid="button-refresh-health"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {defaultMetrics.map((metric) => {
            const Icon = metric.icon;
            const StatusIcon = statusIcons[metric.status];
            const percentage = metric.unit === "%" ? metric.value : (metric.value / metric.max) * 100;
            
            return (
              <div key={metric.name} className="p-3 rounded-md bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">{metric.name}</span>
                  </div>
                  <StatusIcon className={`h-3 w-3 ${
                    metric.status === "healthy" ? "text-green-500" :
                    metric.status === "warning" ? "text-yellow-500" : "text-red-500"
                  }`} />
                </div>
                <Progress value={percentage} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {metric.value}{metric.unit}
                </p>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Diagnostics</span>
          </div>
          {defaultInsights.map((insight) => (
            <div 
              key={insight.id}
              className={`p-3 rounded-md text-xs ${
                insight.type === "optimization" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                insight.type === "warning" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                "bg-muted"
              }`}
            >
              <p>{insight.message}</p>
              {insight.action && (
                <Button variant="ghost" size="sm" className="h-auto p-0 mt-1 text-xs">
                  {insight.action}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
