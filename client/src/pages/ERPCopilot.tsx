import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, AlertTriangle, Zap, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ERPAnalysis {
  id: string;
  category: string;
  finding: string;
  severity: "critical" | "warning" | "info";
  impact: string;
}

export default function ERPCopilot() {
  const { data: analyses = [] } = useQuery<ERPAnalysis[]>({
    queryKey: ["/api/copilot/erp"],
    retry: false,
  });

  const stats = {
    total: analyses.length,
    critical: analyses.filter((a: any) => a.severity === "critical").length,
    warnings: analyses.filter((a: any) => a.severity === "warning").length,
    costSavings: analyses.length * 15000,
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">ERP Copilot</h1>
        <p className="text-muted-foreground text-sm">Financial optimization and anomaly detection</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Analyses</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div><p className="text-2xl font-semibold">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Critical</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-500" />
            <div><p className="text-2xl font-semibold">{stats.warnings}</p>
              <p className="text-xs text-muted-foreground">Warnings</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold font-mono">${(stats.costSavings / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">Est. Savings</p></div>
          </div>
        </CardContent></Card>
      </div>
      <Tabs defaultValue="findings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>
        <TabsContent value="findings">
          {analyses.map((analysis: any) => (
            <Card key={analysis.id}><CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div><p className="font-semibold">{analysis.category}</p>
                  <p className="text-sm text-muted-foreground mt-1">{analysis.finding}</p></div>
                <Badge variant={analysis.severity === "critical" ? "destructive" : "secondary"}>{analysis.severity}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="recommendations"><p className="text-muted-foreground">AI-driven cost optimization and efficiency recommendations</p></TabsContent>
        <TabsContent value="impact"><p className="text-muted-foreground">Quantified business impact analysis</p></TabsContent>
      </Tabs>
    </div>
  );
}
