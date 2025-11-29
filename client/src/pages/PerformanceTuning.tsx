import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, TrendingUp, BarChart3, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PerformanceMetric {
  id: string;
  name: string;
  before: number;
  after: number;
  unit: string;
}

export default function PerformanceTuning() {
  const { data: metrics = [] } = useQuery<PerformanceMetric[]>({
    queryKey: ["/api/performance/metrics"],
    retry: false,
  });

  const stats = {
    total: metrics.length,
    improved: metrics.filter((m: any) => m.after < m.before).length,
    avgImprovement: metrics.length > 0 
      ? ((metrics.reduce((sum: number, m: any) => sum + ((m.before - m.after) / m.before * 100), 0) / metrics.length)).toFixed(1)
      : 0,
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Performance Tuning</h1>
        <p className="text-muted-foreground text-sm">Code splitting, lazy loading, and optimization</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Optimizations</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold">{stats.improved}</p>
              <p className="text-xs text-muted-foreground">Improved</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold">{stats.avgImprovement}%</p>
              <p className="text-xs text-muted-foreground">Avg Gain</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-red-500" />
            <div><p className="text-2xl font-semibold">98%</p>
              <p className="text-xs text-muted-foreground">Uptime</p></div>
          </div>
        </CardContent></Card>
      </div>
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="bundle">Bundle</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>
        <TabsContent value="metrics">
          {metrics.map((metric: any) => (
            <Card key={metric.id}><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.before}{metric.unit} → {metric.after}{metric.unit}</p></div>
                <Badge>{(((metric.before - metric.after) / metric.before * 100)).toFixed(0)}% better</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="bundle"><p className="text-muted-foreground">Code splitting and bundle size analysis</p></TabsContent>
        <TabsContent value="config"><p className="text-muted-foreground">Lazy loading and performance configuration</p></TabsContent>
      </Tabs>
    </div>
  );
}
