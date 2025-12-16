import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SystemHealth } from "@/components/SystemHealth";
import { 
  Activity, 
  Database, 
  Cpu, 
  HardDrive,
  Wifi,
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Clock,
  Zap
} from "lucide-react";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  latency: number;
  uptime: number;
  lastChecked: string;
}

interface DiagnosticLog {
  id: string;
  timestamp: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
  details?: string;
}

export default function Health() {
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  // Fallback data for demo/preview when no API data provided
  const services: ServiceStatus[] = [
    { name: "API Gateway", status: "operational", latency: 45, uptime: 99.99, lastChecked: "1 min ago" },
    { name: "Database", status: "operational", latency: 23, uptime: 99.95, lastChecked: "1 min ago" },
    { name: "AI Engine", status: "operational", latency: 156, uptime: 99.87, lastChecked: "1 min ago" },
    { name: "File Storage", status: "degraded", latency: 320, uptime: 98.5, lastChecked: "1 min ago" },
    { name: "Email Service", status: "operational", latency: 89, uptime: 99.92, lastChecked: "2 min ago" },
    { name: "Cache Layer", status: "operational", latency: 12, uptime: 99.99, lastChecked: "1 min ago" },
  ];

  const diagnosticLogs: DiagnosticLog[] = [
    { id: "1", timestamp: "2024-11-29 14:32:15", type: "success", message: "All critical services operational" },
    { id: "2", timestamp: "2024-11-29 14:30:00", type: "warning", message: "File Storage latency elevated", details: "Latency increased to 320ms, threshold is 200ms" },
    { id: "3", timestamp: "2024-11-29 14:25:00", type: "info", message: "Automatic cache cleanup completed", details: "Freed 2.3GB of cached data" },
    { id: "4", timestamp: "2024-11-29 14:00:00", type: "success", message: "Daily health check passed" },
    { id: "5", timestamp: "2024-11-29 13:45:00", type: "info", message: "AI model updated to version 2.4.1" },
  ];

  const statusConfig = {
    operational: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    degraded: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    down: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  };

  const logTypeConfig = {
    info: { color: "text-blue-500", bg: "bg-blue-500/10" },
    warning: { color: "text-yellow-500", bg: "bg-yellow-500/10" },
    error: { color: "text-red-500", bg: "bg-red-500/10" },
    success: { color: "text-green-500", bg: "bg-green-500/10" },
  };

  const runDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => setIsRunningDiagnostics(false), 3000);
  };

  const overallHealth = services.every(s => s.status === "operational") 
    ? "healthy" 
    : services.some(s => s.status === "down") 
    ? "critical" 
    : "warning";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">System Health</h1>
          <p className="text-muted-foreground text-sm">Self-diagnostic monitoring and AI-powered insights</p>
        </div>
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunningDiagnostics}
          data-testid="button-run-diagnostics"
        >
          {isRunningDiagnostics ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Run Full Diagnostics
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${overallHealth === "healthy" ? "bg-green-500/10" : overallHealth === "warning" ? "bg-yellow-500/10" : "bg-red-500/10"}`}>
                <Activity className={`h-4 w-4 ${overallHealth === "healthy" ? "text-green-500" : overallHealth === "warning" ? "text-yellow-500" : "text-red-500"}`} />
              </div>
              <div>
                <p className="text-sm font-medium capitalize">{overallHealth}</p>
                <p className="text-xs text-muted-foreground">Overall Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Wifi className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">45ms</p>
                <p className="text-xs text-muted-foreground">Avg Latency</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-green-500/10">
                <Shield className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">99.87%</p>
                <p className="text-xs text-muted-foreground">Uptime (30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-500/10">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">1 min ago</p>
                <p className="text-xs text-muted-foreground">Last Check</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => {
                  const config = statusConfig[service.status];
                  const StatusIcon = config.icon;
                  return (
                    <div key={service.name} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${config.bg}`}>
                          <StatusIcon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">Last checked {service.lastChecked}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-mono">{service.latency}ms</p>
                          <p className="text-xs text-muted-foreground">Latency</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono">{service.uptime}%</p>
                          <p className="text-xs text-muted-foreground">Uptime</p>
                        </div>
                        <Badge variant="secondary" className={`${config.bg} ${config.color} capitalize`}>
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Diagnostic Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {diagnosticLogs.map((log) => {
                  const config = logTypeConfig[log.type];
                  return (
                    <div key={log.id} className={`p-3 rounded-md ${config.bg}`}>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${config.color}`}>{log.message}</p>
                        <span className="text-xs text-muted-foreground font-mono">{log.timestamp}</span>
                      </div>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <SystemHealth />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Self-Healing Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                <p className="text-sm font-medium">Auto-recovery enabled</p>
                <p className="text-xs text-muted-foreground mt-1">
                  System will automatically attempt to recover from transient failures.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Issues detected today</span>
                  <span className="font-mono">3</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Auto-resolved</span>
                  <span className="font-mono text-green-500">3</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Manual intervention needed</span>
                  <span className="font-mono">0</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Last auto-healing action: Restarted cache service due to memory pressure (2 hours ago)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
