import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IconNavigation } from "@/components/IconNavigation";
import { MessageSquare, Heart, Plus, Users, Activity, Clock, TrendingUp } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Collaboration {
  id: string;
  taskId: string;
  comments: { id: string; author: string; content: string; likes: number }[];
  activity: { id: string; actor: string; action: string; target: string }[];
  participants: string[];
}

export default function TeamCollaboration() {
  const [activeNav, setActiveNav] = useState("comments");
  const [newComment, setNewComment] = useState("");
  const { data: collaborations = [] } = useQuery<Collaboration[]>({
    queryKey: ["/api/collaborations"]
    retry: false
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: { taskId: string; content: string }) =>
      apiRequest("POST", "/api/collaborations/comments", data)
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collaborations"] });
      setNewComment("");
    }
  });

  const stats = {
    comments: (collaborations || []).reduce((sum, c) => sum + (c.comments?.length || 0), 0)
    members: 5
    activities: (collaborations || []).reduce((sum, c) => sum + (c.activity?.length || 0), 0)
  };

  const navItems = [
    { id: "comments", label: "Comments", icon: MessageSquare, color: "text-blue-500" }
    { id: "activity", label: "Activity", icon: Activity, color: "text-green-500" }
    { id: "team", label: "Team Members", icon: Users, color: "text-purple-500" }
    { id: "timeline", label: "Timeline", icon: TrendingUp, color: "text-orange-500" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Team Collaboration</h1>
          <p className="text-muted-foreground text-sm">Comments, mentions, and activity tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><MessageSquare className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-semibold">{stats.comments}</p><p className="text-xs text-muted-foreground">Comments</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Activity className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-semibold">{stats.activities}</p><p className="text-xs text-muted-foreground">Activities</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-purple-500" /><div><p className="text-2xl font-semibold">{stats.members}</p><p className="text-xs text-muted-foreground">Team Members</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Heart className="h-5 w-5 text-red-500" /><div><p className="text-2xl font-semibold">342</p><p className="text-xs text-muted-foreground">Total Likes</p></div></div></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "comments" && (
        <div className="space-y-4">
          <Card><CardContent className="p-4"><Textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="mb-3" /><Button onClick={() => addCommentMutation.mutate({ taskId: "1", content: newComment })}>Post Comment</Button></CardContent></Card>
          {collaborations[0]?.comments?.map((comment: any) => (
            <Card key={comment.id} className="hover-elevate"><CardContent className="p-4"><div className="flex justify-between items-start"><div><p className="font-semibold text-sm">{comment.author}</p><p className="text-sm text-muted-foreground">{comment.content}</p></div><div className="flex items-center gap-2"><Heart className="h-4 w-4" /><span className="text-xs">{comment.likes}</span></div></div></CardContent></Card>
          )) || <p className="text-muted-foreground">No comments yet</p>}
        </div>
      )}
      {activeNav === "activity" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.activities} activity entries</p></CardContent></Card>}
      {activeNav === "team" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.members} team members participating</p></CardContent></Card>}
      {activeNav === "timeline" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Activity timeline view</p></CardContent></Card>}
    </div>
  );
}
