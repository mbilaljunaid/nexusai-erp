import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Paperclip } from "lucide-react";

export default function TeamCollaborationHub() {
  const discussions = [
    { id: "tc1", project: "Project Alpha", title: "Design Review - Homepage", author: "Alice", comments: 12, attachments: 2, status: "active" },
    { id: "tc2", project: "Project Beta", title: "API Integration Progress", author: "Bob", comments: 8, attachments: 1, status: "active" },
    { id: "tc3", project: "Project Gamma", title: "Budget Discussion - Resolved", author: "Carol", comments: 5, attachments: 0, status: "resolved" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          Team Collaboration Hub
        </h1>
        <p className="text-muted-foreground mt-2">Collaborate with your team on projects and tasks</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-start-discussion">
            <Plus className="h-4 w-4" />
            Start Discussion
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active Discussions</p>
            <p className="text-2xl font-bold">{discussions.filter(d => d.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Comments</p>
            <p className="text-2xl font-bold">{discussions.reduce((sum, d) => sum + d.comments, 0)}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Attachments</p>
            <p className="text-2xl font-bold">{discussions.reduce((sum, d) => sum + d.attachments, 0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Discussions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {discussions.map((discussion) => (
            <div key={discussion.id} className="p-3 border rounded-lg hover-elevate" data-testid={`discussion-${discussion.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{discussion.title}</h3>
                <Badge variant={discussion.status === "active" ? "default" : "secondary"}>{discussion.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Project: {discussion.project} • Author: {discussion.author} • {discussion.comments} comments</p>
              <div className="flex gap-2 mt-2">
                {discussion.attachments > 0 && <span className="text-xs flex items-center gap-1 text-muted-foreground"><Paperclip className="h-3 w-3" />{discussion.attachments} files</span>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
