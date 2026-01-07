import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, AlertCircle, CheckCircle2, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";

interface HRInsight {
  id: string;
  employee: string;
  insight: string;
  category: "retention" | "development" | "engagement" | "succession";
  action: string;
}

export default function HRCopilot() {
  const [activeNav, setActiveNav] = useState("insights");
  const { data: insights = [] } = useQuery<HRInsight[]>({
    queryKey: ["/api/copilot/hr"],
    retry: false,
  });

  const navItems = [
    { id: "insights", label: "Insights", icon: AlertCircle, color: "text-red-500" },
    { id: "actions", label: "Actions", icon: CheckCircle2, color: "text-green-500" },
    { id: "outcomes", label: "Outcomes", icon: TrendingUp, color: "text-blue-500" },
  ];

  const stats = {
    total: insights.length,
    retention: insights.filter((i: any) => i.category === "retention").length,
    development: insights.filter((i: any) => i.category === "development").length,
    succession: insights.filter((i: any) => i.category === "succession").length,
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold flex items-center gap-2"><Brain className="h-8 w-8" />HR Copilot</h1>
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
      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />
      
      {activeNav === "insights" && (
        <div className="space-y-3">
          {insights.map((insight: any) => (
            <Card key={insight.id} className="hover-elevate cursor-pointer"><CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div><p className="font-semibold">{insight.employee}</p>
                  <p className="text-sm text-muted-foreground mt-1">{insight.insight}</p>
                  <p className="text-xs text-muted-foreground mt-2">Action: {insight.action}</p></div>
                <Badge>{insight.category}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "actions" && (<Card><CardContent className="p-4"><p className="text-muted-foreground">Recommended HR actions and interventions</p><div className="mt-4 space-y-2"><Button size="sm" variant="outline" className="w-full">Review Retention Actions</Button><Button size="sm" variant="outline" className="w-full">Schedule Development Plans</Button></div></CardContent></Card>)}
      {activeNav === "outcomes" && (<Card><CardContent className="p-4"><p className="text-muted-foreground">Outcome tracking and effectiveness metrics</p></CardContent></Card>)}
    </div>
  );
}
