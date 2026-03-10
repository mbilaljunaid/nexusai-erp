import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, BarChart3, Download, TrendingUp, AlertCircle } from "lucide-react";
import { formatNumber } from '@/lib/formatters';

export default function MobileApps() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const { data: apps = [] } = useQuery<any[]>({ queryKey: ["/api/mobile/apps"] });
  const { data: metrics = [] } = useQuery<any[]>({ queryKey: ["/api/mobile/metrics"] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mobile Apps</h1>
        <p className="text-muted-foreground mt-2">Monitor mobile application performance and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Apps List */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Available Apps</h2>
          {apps.map((app: any) => (
            <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelectedApp(app.id)}>
              <Card
                            key={app.id}
                            className={cn(`cursor-pointer transition-all ${selectedApp === app.id ? "ring-2 ring-blue-500" : ""}`)}
                            data-testid={`card-app-${app.id}`}
                          >
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" />
                                    {app.appName}
                                  </h4>
                                  <div className="flex gap-2">
                                    <Badge variant="outline">{app.platform}</Badge>
                                    <Badge variant="secondary">v{app.version}</Badge>
                                  </div>
                                </div>
                                <div className="text-right space-y-1">
                                  <div className="flex items-center gap-1 text-sm font-medium">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    {app.rating}★
                                  </div>
                                  <div className="text-xs text-muted-foreground">{formatNumber(app.downloadCount)} downloads</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
              </Button>
          ))}
        </div>

        {/* Metrics */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Performance Metrics</h2>
          {metrics.map((metric: any) => (
            <Card key={metric.id} data-testid={`card-metric-${metric.id}`}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>App {metric.appId}</span>
                  {metric.crashReports > 0 && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">DAU:</span>
                    <div className="font-bold">{formatNumber(metric.dailyActiveUsers)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Session:</span>
                    <div className="font-bold">{metric.sessionDuration}s</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Crash Reports:</span>
                    <div className="font-bold">{metric.crashReports}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" data-testid="button-deploy-app">
          <Download className="h-4 w-4 mr-2" />
          Deploy Update
        </Button>
        <Button variant="outline" data-testid="button-view-analytics">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      </div>
    </div>
  );
}
