import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface HRInsight {
  id: string;
  employee: string;
  insight: string;
  category: "retention" | "development" | "engagement" | "succession";
  action: string;
}

export default function HRCopilot() {
  const { data: insights = [] } = useQuery<HRInsight[]>({
    queryKey: ["/api/copilot/hr"],
    retry: false,
  });

  const stats = {
    total: insights.length,
    retention: insights.filter((i: any) => i.category === "retention").length,
    development: insights.filter((i: any) => i.category === "development").length,
    succession: insights.filter((i: any) => i.category === "succession").length,
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">HR Copilot</h1>
        <p className="text-muted-foreground text-sm">Talent management and people insights</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Insights</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div><p className="text-2xl font-semibold">{stats.retention}</p>
              <p className="text-xs text-muted-foreground">Retention</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold">{stats.development}</p>
              <p className="text-xs text-muted-foreground">Development</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold">{stats.succession}</p>
              <p className="text-xs text-muted-foreground">Succession</p></div>
          </div>
        </CardContent></Card>
      </div>
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
        </TabsList>
        <TabsContent value="insights">
          {insights.map((insight: any) => (
            <Card key={insight.id}><CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div><p className="font-semibold">{insight.employee}</p>
                  <p className="text-sm text-muted-foreground mt-1">{insight.insight}</p>
                  <p className="text-xs text-muted-foreground mt-2">Action: {insight.action}</p></div>
                <Badge>{insight.category}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="actions"><p className="text-muted-foreground">Recommended HR actions and interventions</p></TabsContent>
        <TabsContent value="outcomes"><p className="text-muted-foreground">Outcome tracking and effectiveness metrics</p></TabsContent>
      </Tabs>
    </div>
  );
}
