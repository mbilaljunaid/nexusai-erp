import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { Workflow, Zap, BarChart3, TrendingUp } from "lucide-react";

export default function BPM() {
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" }
    { id: "processes", label: "Processes", icon: Workflow, color: "text-purple-500" }
    { id: "workflows", label: "Workflows", icon: Zap, color: "text-green-500" }
    { id: "analytics", label: "Analytics", icon: TrendingUp, color: "text-orange-500" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2"><Workflow className="w-8 h-8" />Business Process Mapping</h1>
        <p className="text-muted-foreground text-sm">Design, optimize, and automate business workflows</p>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">24</p><p className="text-xs text-muted-foreground">Mapped Processes</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">156</p><p className="text-xs text-muted-foreground">Active Workflows</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">42%</p><p className="text-xs text-muted-foreground">Automation Rate</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">18h</p><p className="text-xs text-muted-foreground">Time Saved/Week</p></div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">BPM Capabilities</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Process Mapping", description: "Visualize and design business processes" }
                  { name: "Workflow Automation", description: "Automate repetitive tasks and approvals" }
                  { name: "Optimization", description: "Identify bottlenecks and improvements" }
                  { name: "Monitoring", description: "Track process performance and metrics" }
                  { name: "Compliance", description: "Enforce rules and compliance checks" }
                  { name: "Analytics", description: "Analyze process efficiency and ROI" }
                ].map((capability) => (
                  <Button key={capability.name} variant="outline" className="h-auto flex flex-col items-start justify-start p-4">
                    <span className="font-medium">{capability.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{capability.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "processes" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Process Library</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">24 mapped business processes</p></CardContent></Card>
        </div>
      )}

      {activeNav === "workflows" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Active Workflows</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">156 active workflows running</p></CardContent></Card>
        </div>
      )}

      {activeNav === "analytics" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Process Analytics</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Efficiency metrics and performance data</p></CardContent></Card>
        </div>
      )}
    </div>
  );
}
