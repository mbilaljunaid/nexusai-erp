import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Heart, Plus, Users, Activity, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Comment {
  id: string;
  author: string;
  content: string;
  likes: number;
  mentions: string[];
  createdAt: string;
}

interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
}

interface Collaboration {
  id: string;
  taskId: string;
  comments: Comment[];
  activity: ActivityEntry[];
  participants: string[];
}

export default function TeamCollaboration() {
  const [newComment, setNewComment] = useState("");

  const { data: collaborations = [] } = useQuery<Collaboration[]>({
    queryKey: ["/api/collaborations"],
    retry: false,
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: { taskId: string; content: string }) =>
      apiRequest("POST", "/api/collaborations/comments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collaborations"] });
      setNewComment("");
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      apiRequest("POST", `/api/collaborations/comments/${commentId}/like`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/collaborations"] }),
  });

  const currentCollab = collaborations[0];
  const teamMembers = ["Alice", "Bob", "Carol", "David", "Eve"];

  const stats = {
    comments: collaborations.reduce((sum, c) => sum + c.comments.length, 0),
    members: teamMembers.length,
    activities: collaborations.reduce((sum, c) => sum + c.activity.length, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Team Collaboration</h1>
          <p className="text-muted-foreground text-sm">Comments, mentions, and activity tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.comments}</p>
                <p className="text-xs text-muted-foreground">Total Comments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.members}</p>
                <p className="text-xs text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.activities}</p>
                <p className="text-xs text-muted-foreground">Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Comment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Type @ to mention someone..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-24"
              />
              <div className="flex gap-2">
                <Button onClick={() => {
                  if (newComment.trim() && currentCollab) {
                    addCommentMutation.mutate({ taskId: currentCollab.taskId, content: newComment });
                  }
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {currentCollab?.comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      {comment.mentions.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {comment.mentions.map((mention) => (
                            <Badge key={mention} variant="secondary" className="text-xs">@{mention}</Badge>
                          ))}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2"
                        onClick={() => likeCommentMutation.mutate(comment.id)}
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        {comment.likes}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-3">
          {currentCollab?.activity.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{entry.actor}</span>
                      {" " + entry.action + " "}
                      <span className="font-semibold">{entry.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mentions" className="space-y-3">
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <Badge key={member} variant="outline" className="cursor-pointer hover-elevate">
                @{member}
              </Badge>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
