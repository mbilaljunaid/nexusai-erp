import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";

export default function Stories() {
  const [activeNav, setActiveNav] = useState("list");
  const { data: issues = [] } = useQuery<any[]>({ queryKey: ["/api/projects/issues"] });
  const stories = issues.filter((i: any) => i.issueType === "story");

  const navigationItems = [
    { id: "list", label: "Stories", icon: Zap, badge: stories.length, color: "blue" as const },
    { id: "todo", label: "Todo", icon: Zap, badge: stories.filter((s: any) => s.status === "todo").length, color: "gray" as const },
    { id: "in_progress", label: "In Progress", icon: Zap, badge: stories.filter((s: any) => s.status === "in_progress").length, color: "orange" as const },
    { id: "done", label: "Done", icon: Zap, badge: stories.filter((s: any) => s.status === "done").length, color: "green" as const },
  ];

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

      <IconNavigation items={navigationItems} activeId={activeNav} onSelect={setActiveNav} />

      <div className="grid gap-4">
        {filteredStories.map((story: any) => (
          <Card key={story.id} className="hover-elevate">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{story.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{story.storyPoints || 0} pts</p>
                </div>
                <Badge variant={story.status === "todo" ? "secondary" : "default"}>{story.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Assignee</p>
                  <p className="font-semibold">{story.assignee || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <p className="font-semibold">{story.priority}</p>
                </div>
              </div>
              {story.description && <p className="text-sm text-muted-foreground mt-3">{story.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
