import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { Plus, GitBranch, Zap, Settings, BarChart3 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Workflow {
  id: string;
  name: string;
  description: string;
  states: { id: string; name: string; color: string }[];
  automationRules: { trigger: string; action: string }[];
  active: boolean;
}

export default function WorkflowDesigner() {
  const [activeNav, setActiveNav] = useState("workflows");
  const { data: workflows = [] } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"]
    retry: false
  });

  const stats = {
    total: (workflows || []).length
    active: (workflows || []).filter(w => w.active).length
    totalStates: (workflows || []).reduce((sum, w) => sum + (w.states?.length || 0), 0)
    totalRules: (workflows || []).reduce((sum, w) => sum + (w.automationRules?.length || 0), 0)
  };

  const navItems = [
    { id: "workflows", label: "Workflows", icon: GitBranch, color: "text-blue-500" }
    { id: "active", label: "Active", icon: Zap, color: "text-green-500" }
    { id: "rules", label: "Automation", icon: Settings, color: "text-purple-500" }
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-orange-500" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Workflow Designer</h1>
          <p className="text-muted-foreground text-sm">Create custom states and automation rules</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><GitBranch className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-semibold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Zap className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-semibold">{stats.active}</p><p className="text-xs text-muted-foreground">Active</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Settings className="h-5 w-5 text-purple-500" /><div><p className="text-2xl font-semibold">{stats.totalRules}</p><p className="text-xs text-muted-foreground">Rules</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-semibold">{stats.totalStates}</p><p className="text-xs text-muted-foreground">States</p></div></div></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "workflows" && (
        <div className="space-y-3">
          {(workflows || []).map((workflow: any) => (
            <Card key={workflow.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-start"><div><p className="font-semibold">{workflow.name}</p><p className="text-sm text-muted-foreground">{workflow.states?.length || 0} states</p></div><Badge variant={workflow.active ? "default" : "secondary"}>{workflow.active ? "Active" : "Inactive"}</Badge></div></CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "active" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.active} active workflows</p></CardContent></Card>}
      {activeNav === "rules" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.totalRules} automation rules configured</p></CardContent></Card>}
      {activeNav === "analytics" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Workflow performance analytics</p></CardContent></Card>}
    </div>
  );
}
