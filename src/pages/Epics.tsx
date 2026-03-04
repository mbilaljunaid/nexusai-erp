import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export default function Epics() {
  const { data: issues = [] } = useQuery<any[]>({ queryKey: ["/api/projects/issues"] });
  const epics = issues.filter((i: any) => i.issueType === "epic");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="w-8 h-8" />
          Epics
        </h1>
        <p className="text-muted-foreground">Large-scale initiatives spanning multiple sprints</p>
      </div>

      <div className="grid gap-4">
        {epics.map((epic: any) => (
          <Card key={epic.id} className="hover-elevate">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{epic.title}</CardTitle>
                <div className="space-x-2">
                  <Badge variant={epic.status === "todo" ? "secondary" : "default"}>{epic.status}</Badge>
                  <Badge variant={epic.priority === "high" ? "destructive" : "default"}>{epic.priority}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <p className="text-muted-foreground">Assignee</p>
                  <p className="font-semibold">{epic.assignee || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Story Points</p>
                  <p className="font-semibold">{epic.storyPoints || "—"}</p>
                </div>
              </div>
              {epic.description && <p className="text-sm text-muted-foreground">{epic.description}</p>}
            </CardContent>
          </Card>
        ))}
        {epics.length === 0 && (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No epics yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
