import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";

export default function Stories() {
  const [activeNav, setActiveNav] = useState("list");
  const { data: stories = [] } = useQuery<any[]>({ queryKey: ["/api/projects/stories"] });

  const navigationItems = [
    { id: "list", label: "Stories", icon: Zap, badge: stories.length, color: "blue" as const, onNavigate: setActiveNav },
    { id: "todo", label: "Todo", icon: Zap, badge: stories.filter((s: any) => s.status === "todo").length, color: "gray" as const, onNavigate: setActiveNav },
    { id: "in_progress", label: "In Progress", icon: Zap, badge: stories.filter((s: any) => s.status === "in_progress").length, color: "orange" as const, onNavigate: setActiveNav },
    { id: "done", label: "Done", icon: Zap, badge: stories.filter((s: any) => s.status === "done").length, color: "green" as const, onNavigate: setActiveNav },
  ];

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    todo: "secondary",
    in_progress: "default",
    review: "default",
    done: "outline",
  };

  const filteredStories = {
    list: stories,
    todo: stories.filter((s: any) => s.status === "todo"),
    in_progress: stories.filter((s: any) => s.status === "in_progress"),
    done: stories.filter((s: any) => s.status === "done"),
  }[activeNav] || stories;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Stories</h1>
        <p className="text-muted-foreground">Manage sprint stories and track progress</p>
      </div>

      <IconNavigation items={navigationItems} activeId={activeNav} onNavigate={setActiveNav} />

      <div className="grid gap-4">
        {filteredStories.map((story: any) => (
          <Card key={story.id} className="hover-elevate">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{story.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{story.storyKey} • {story.storyPoints} pts</p>
                </div>
                <Badge variant={statusColors[story.status] || "default"}>{story.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <p className="text-muted-foreground">Assignee</p>
                  <p className="font-semibold">{story.assignee || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sprint</p>
                  <p className="font-semibold">{story.sprintId || "Backlog"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-semibold">{story.dueDate ? new Date(story.dueDate).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
              {story.description && <p className="text-sm text-muted-foreground mb-3">{story.description}</p>}
              <Button variant="outline" size="sm">
                <Plus className="w-3 h-3 mr-1" /> Add Task
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
