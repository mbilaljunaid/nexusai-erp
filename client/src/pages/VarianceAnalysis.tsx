import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, LineChart, TrendingUpIcon, Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { IconNavigation } from "@/components/IconNavigation";

interface Variance {
  id: string;
  accountName: string;
  actual: number;
  forecast: number;
  variance: number;
}

export default function VarianceAnalysis() {
  const [activeNav, setActiveNav] = useState("analysis");
  const { data: variances = [] } = useQuery<Variance[]>({
    queryKey: ["/api/variance-analysis"]
    retry: false
  });

  const stats = {
    total: variances.length
    favorable: variances.filter((v: any) => v.variance > 0).length
    unfavorable: variances.filter((v: any) => v.variance < 0).length
    avgVariance: ((variances.reduce((sum: number, v: any) => sum + (v.variance || 0), 0) / (variances.length || 1))).toFixed(2)
  };

  const navItems = [
    { id: "analysis", label: "Analysis", icon: LineChart, color: "text-blue-500" }
    { id: "trending", label: "Trending", icon: TrendingUpIcon, color: "text-green-500" }
    { id: "root-cause", label: "Root Cause", icon: Lightbulb, color: "text-orange-500" }
  ];

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

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "analysis" && (
        <div className="space-y-3">
          {variances.map((variance: any) => (
            <Card key={variance.id} className="hover-elevate cursor-pointer"><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{variance.accountName}</p>
                  <p className="text-sm text-muted-foreground">Actual: ${(variance.actual / 1000).toFixed(0)}K • Forecast: ${(variance.forecast / 1000).toFixed(0)}K</p></div>
                <Badge variant={variance.variance > 0 ? "default" : "destructive"}>{(variance.variance).toFixed(1)}%</Badge>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "trending" && <Card><CardContent className="p-6"><p className="text-muted-foreground">Historical variance trends and patterns</p></CardContent></Card>}
      {activeNav === "root-cause" && <Card><CardContent className="p-6"><p className="text-muted-foreground">Root cause analysis and drill-down</p></CardContent></Card>}
    </div>
  );
}
