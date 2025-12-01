import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { Users, CheckCircle2, Clock, FileText, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Onboarding {
  id: string;
  employeeName: string;
  status: string;
  documentsCount: number;
  startDate: string;
}

export default function OnboardingAutomation() {
  const [activeNav, setActiveNav] = useState("workflows");
  const { data: onboardings = [] } = useQuery<Onboarding[]>({
    queryKey: ["/api/onboarding/workflows"],
    retry: false,
  });

  const stats = {
    total: (onboardings || []).length,
    inProgress: (onboardings || []).filter((o: any) => o.status === "in_progress").length,
    completed: (onboardings || []).filter((o: any) => o.status === "completed").length,
    docs: (onboardings || []).reduce((sum: number, o: any) => sum + (o.documentsCount || 0), 0),
  };

  const navItems = [
    { id: "workflows", label: "Workflows", icon: Users, color: "text-blue-500" },
    { id: "documents", label: "Documents", icon: FileText, color: "text-green-500" },
    { id: "templates", label: "Templates", icon: CheckCircle2, color: "text-purple-500" },
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Onboarding Automation</h1>
        <p className="text-muted-foreground text-sm">Document management and workflow automation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-semibold">{stats.total}</p><p className="text-xs text-muted-foreground">Employees</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Clock className="h-5 w-5 text-yellow-500" /><div><p className="text-2xl font-semibold">{stats.inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-semibold">{stats.completed}</p><p className="text-xs text-muted-foreground">Completed</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-semibold">{stats.docs}</p><p className="text-xs text-muted-foreground">Docs</p></div></div></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "workflows" && (
        <div className="space-y-3">
          {(onboardings || []).map((ob: any) => (
            <Card key={ob.id} className="hover-elevate"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="font-semibold">{ob.employeeName}</p><p className="text-sm text-muted-foreground">Start: {ob.startDate}</p></div><Badge variant={ob.status === "completed" ? "default" : "secondary"}>{ob.status}</Badge></div></CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "documents" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.docs} onboarding documents</p></CardContent></Card>}
      {activeNav === "templates" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Onboarding templates and workflows</p></CardContent></Card>}
      {activeNav === "analytics" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Onboarding metrics and completion rates</p></CardContent></Card>}
    </div>
  );
}
