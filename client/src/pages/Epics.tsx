import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Epics() {
  const [activeNav, setActiveNav] = useState("list");
  const { data: epics = [] } = useQuery<any[]>({ queryKey: ["/api/projects/epics"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/projects/epics", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/projects/epics"] }),
  });

  const navigationItems = [
    { id: "list", label: "Epics", icon: BookOpen, badge: epics.length, color: "blue" as const, onNavigate: setActiveNav },
    { id: "active", label: "Active", icon: BookOpen, badge: epics.filter((e: any) => e.status === "active").length, color: "green" as const, onNavigate: setActiveNav },
    { id: "closed", label: "Closed", icon: BookOpen, badge: epics.filter((e: any) => e.status === "closed").length, color: "purple" as const, onNavigate: setActiveNav },
  ];

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    backlog: "secondary",
    active: "default",
    closed: "outline",
  };

  const priorityColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    low: "secondary",
    medium: "default",
    high: "destructive",
    critical: "destructive",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Epics</h1>
        <p className="text-muted-foreground">Plan large features and track cross-sprint initiatives</p>
      </div>

      <IconNavigation items={navigationItems} activeId={activeNav} onNavigate={setActiveNav} />

      {activeNav === "list" && (
        <div className="grid gap-4">
          {epics.map((epic: any) => (
            <Card key={epic.id} className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{epic.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{epic.epicKey}</p>
                  </div>
                  <div className="space-x-2">
                    <Badge variant={statusColors[epic.status] || "default"}>{epic.status}</Badge>
                    <Badge variant={priorityColors[epic.priority] || "default"}>{epic.priority}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Owner</p>
                    <p className="font-semibold">{epic.owner || "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-semibold">{epic.startDate ? new Date(epic.startDate).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Target Date</p>
                    <p className="font-semibold">{epic.targetDate ? new Date(epic.targetDate).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>
                {epic.description && <p className="mt-2 text-sm text-muted-foreground">{epic.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeNav === "active" && (
        <div className="grid gap-4">
          {epics.filter((e: any) => e.status === "active").map((epic: any) => (
            <Card key={epic.id} className="hover-elevate bg-blue-50 dark:bg-blue-950">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{epic.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{epic.description}</p>
                <Button variant="outline" size="sm">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeNav === "closed" && (
        <div className="grid gap-4">
          {epics.filter((e: any) => e.status === "closed").length > 0 ? (
            epics.filter((e: any) => e.status === "closed").map((epic: any) => (
              <Card key={epic.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{epic.name}</CardTitle>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                No closed epics
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
