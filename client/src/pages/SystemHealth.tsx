import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Activity, Zap, Database, Eye } from "lucide-react";

export default function SystemHealth() {
  const services = [
    { name: "API Server", status: "healthy", uptime: 99.98, responseTime: 145 },
    { name: "Database", status: "healthy", uptime: 99.99, responseTime: 52 },
    { name: "Cache (Redis)", status: "healthy", uptime: 99.95, responseTime: 8 },
    { name: "Search Engine", status: "degraded", uptime: 99.2, responseTime: 892 },
    { name: "Message Queue", status: "healthy", uptime: 99.97, responseTime: 234 },
    { name: "Load Balancer", status: "healthy", uptime: 100, responseTime: 5 },
  ];

  const metrics = [
    { label: "CPU Usage", value: 45, max: 100, icon: <Zap className="h-5 w-5" /> },
    { label: "Memory Usage", value: 62, max: 100, icon: <Activity className="h-5 w-5" /> },
    { label: "Disk Usage", value: 78, max: 100, icon: <Database className="h-5 w-5" /> },
    { label: "Network I/O", value: 38, max: 100, icon: <Eye className="h-5 w-5" /> },
  ];

  const alerts = [
    { level: "warning", message: "High memory usage detected on db-server-02", time: "5 minutes ago" },
    { level: "info", message: "Scheduled maintenance completed successfully", time: "2 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Health</h1>
        <p className="text-muted-foreground mt-2">Monitor infrastructure and service status</p>
      </div>

      {/* System Status Overview */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">All Systems Operational</p>
              <p className="text-sm text-green-700">5 of 6 services healthy • Uptime: 99.94%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-blue-600">{metric.icon}</div>
                  <span className="font-medium text-sm">{metric.label}</span>
                </div>
                <span className="font-bold">{metric.value}%</span>
              </div>
              <Progress value={metric.value} data-testid={`progress-${metric.label.replace(/\s+/g, "-").toLowerCase()}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {services.map((service, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`service-${service.name.replace(/\s+/g, "-").toLowerCase()}`}>
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${
                  service.status === "healthy" ? "bg-green-500" : service.status === "degraded" ? "bg-yellow-500" : "bg-red-500"
                }`} />
                <div>
                  <p className="font-medium text-sm">{service.name}</p>
                  <p className="text-xs text-muted-foreground">Response: {service.responseTime}ms • Uptime: {service.uptime}%</p>
                </div>
              </div>
              <Badge variant={service.status === "healthy" ? "default" : "secondary"}>
                {service.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`p-3 rounded-lg border ${
              alert.level === "warning" ? "bg-yellow-50 border-yellow-200" : "bg-blue-50 border-blue-200"
            }`} data-testid={`alert-${idx}`}>
              <div className="flex items-start gap-2">
                {alert.level === "warning" ? (
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
