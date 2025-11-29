import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Play, CheckCircle } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Sprints() {
  const [activeNav, setActiveNav] = useState("list");
  const { data: sprints = [] } = useQuery<any[]>({ queryKey: ["/api/projects/sprints"] });

  const createMutation = useMutation({
    mutationFn: (sprintId: string, action: string) => apiRequest("POST", `/api/projects/sprints/${sprintId}/${action}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/projects/sprints"] }),
  });

  const navigationItems = [
    { id: "list", label: "All Sprints", icon: Flame, badge: sprints.length, color: "blue" as const, onNavigate: setActiveNav },
    { id: "active", label: "Active", icon: Flame, badge: sprints.filter((s: any) => s.status === "active").length, color: "orange" as const, onNavigate: setActiveNav },
    { id: "completed", label: "Completed", icon: CheckCircle, badge: sprints.filter((s: any) => s.status === "completed").length, color: "green" as const, onNavigate: setActiveNav },
  ];

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    planning: "secondary",
    active: "default",
    completed: "outline",
    closed: "outline",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Sprints</h1>
        <p className="text-muted-foreground">Plan, track, and complete sprints with your team</p>
      </div>

      <IconNavigation items={navigationItems} activeId={activeNav} onNavigate={setActiveNav} />

      <div className="grid gap-4">
        {(activeNav === "list" ? sprints : sprints.filter((s: any) => s.status === (activeNav === "active" ? "active" : "completed"))).map((sprint: any) => (
          <Card key={sprint.id} className="hover-elevate">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{sprint.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{sprint.sprintKey}</p>
                </div>
                <Badge variant={statusColors[sprint.status] || "default"}>{sprint.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-semibold">{sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-semibold">{sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Team</p>
                  <p className="font-semibold">{sprint.teamId || "Unassigned"}</p>
                </div>
              </div>
              {sprint.goal && <p className="text-sm text-muted-foreground mb-3"><strong>Goal:</strong> {sprint.goal}</p>}
              {sprint.status === "planning" && (
                <Button size="sm" onClick={() => createMutation.mutate(sprint.id, "start")}>
                  <Play className="w-3 h-3 mr-1" /> Start Sprint
                </Button>
              )}
              {sprint.status === "active" && (
                <Button size="sm" onClick={() => createMutation.mutate(sprint.id, "complete")}>
                  <CheckCircle className="w-3 h-3 mr-1" /> Complete Sprint
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
