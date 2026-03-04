import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";

export default function Sprints() {
  const [activeNav, setActiveNav] = useState("list");
  const { data: sprints = [] } = useQuery<any[]>({ queryKey: ["/api/projects/sprints"] });

  const navigationItems = [
    { id: "list", label: "All Sprints", icon: Flame, badge: sprints.length, color: "blue" as const },
    { id: "active", label: "Active", icon: Flame, badge: sprints.filter((s: any) => s.status === "active").length, color: "orange" as const },
    { id: "planning", label: "Planning", icon: Flame, badge: sprints.filter((s: any) => s.status === "planning").length, color: "purple" as const },
  ];

  const filteredSprints = {
    list: sprints,
    active: sprints.filter((s: any) => s.status === "active"),
    planning: sprints.filter((s: any) => s.status === "planning"),
  }[activeNav] || sprints;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Sprints</h1>
        <p className="text-muted-foreground">Plan and execute sprints with your team</p>
      </div>

      <IconNavigation items={navigationItems} activeId={activeNav} onSelect={setActiveNav} />

      <div className="grid gap-4">
        {filteredSprints.map((sprint: any) => (
          <Card key={sprint.id} className="hover-elevate">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{sprint.name}</CardTitle>
                <Badge variant={sprint.status === "active" ? "default" : "secondary"}>{sprint.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <p className="text-muted-foreground">Start</p>
                  <p className="font-semibold">{sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End</p>
                  <p className="font-semibold">{sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Velocity</p>
                  <p className="font-semibold">{sprint.velocity || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
