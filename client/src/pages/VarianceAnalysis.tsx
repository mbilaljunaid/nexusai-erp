import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Target, LineChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Variance {
  id: string;
  accountName: string;
  actual: number;
  forecast: number;
  variance: number;
}

export default function VarianceAnalysis() {
  const { data: variances = [] } = useQuery<Variance[]>({
    queryKey: ["/api/variance-analysis"],
    retry: false,
  });

  const stats = {
    total: variances.length,
    favorable: variances.filter((v: any) => v.variance > 0).length,
    unfavorable: variances.filter((v: any) => v.variance < 0).length,
    avgVariance: ((variances.reduce((sum: number, v: any) => sum + (v.variance || 0), 0) / (variances.length || 1))).toFixed(2),
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Variance Analysis</h1>
        <p className="text-muted-foreground text-sm">Actual vs forecast trending and analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <LineChart className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Accounts</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold">{stats.favorable}</p>
              <p className="text-xs text-muted-foreground">Favorable</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <div><p className="text-2xl font-semibold">{stats.unfavorable}</p>
              <p className="text-xs text-muted-foreground">Unfavorable</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold">{stats.avgVariance}%</p>
              <p className="text-xs text-muted-foreground">Avg %</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="root-cause">Root Cause</TabsTrigger>
        </TabsList>
        <TabsContent value="analysis">
          {variances.map((variance: any) => (
            <Card key={variance.id}><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{variance.accountName}</p>
                  <p className="text-sm text-muted-foreground">Actual: ${(variance.actual / 1000).toFixed(0)}K • Forecast: ${(variance.forecast / 1000).toFixed(0)}K</p></div>
                <Badge variant={variance.variance > 0 ? "default" : "destructive"}>{(variance.variance).toFixed(1)}%</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="trending"><p className="text-muted-foreground">Historical variance trends and patterns</p></TabsContent>
        <TabsContent value="root-cause"><p className="text-muted-foreground">Root cause analysis and drill-down</p></TabsContent>
      </Tabs>
    </div>
  );
}
