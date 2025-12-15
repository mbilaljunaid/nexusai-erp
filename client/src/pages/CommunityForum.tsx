import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Header, Footer } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, ThumbsUp, ThumbsDown, Eye, CheckCircle, 
  Plus, Search, TrendingUp, Clock, Award, Users, Hash, Trophy, Star, Shield, User, Flag, AlertTriangle
} from "lucide-react";
import type { CommunitySpace, CommunityPost, UserTrustLevel } from "@shared/schema";
import { UserProfile } from "@/components/UserProfile";
import { FlagContentDialog } from "@/components/FlagContentDialog";
import { ModerationQueue } from "@/components/ModerationQueue";
import { ServiceMarketplace } from "@/components/ServiceMarketplace";

interface PostWithComments extends CommunityPost {
  comments?: Array<{
    id: string;
    content: string;
    authorId: string;
    upvotes: number | null;
    downvotes: number | null;
    isAccepted: boolean | null;
    createdAt: Date | null;
  }>;
}

interface LeaderboardUser extends UserTrustLevel {
  // Extended for display
}

interface ReputationData {
  trustLevel: UserTrustLevel;
  recentEvents: Array<{
    id: string;
    actionType: string;
    points: number;
    description: string | null;
    createdAt: Date | null;
  }>;
  badges: Array<{
    id: string;
    badgeType: string;
    currentTier: string | null;
    progress: number | null;
    threshold: number | null;
  }>;
}

export default function CommunityForum() {
  const { toast } = useToast();
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", postType: "discussion", spaceId: "" });
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [flagTarget, setFlagTarget] = useState<{ type: "post" | "comment"; id: string } | null>(null);
  const [showModeration, setShowModeration] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);

  const { data: spaces, isLoading: spacesLoading } = useQuery<CommunitySpace[]>({
    queryKey: ["/api/community/spaces"],
  });

  const { data: posts, isLoading: postsLoading } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", selectedSpace],
    queryFn: async () => {
      const url = selectedSpace 
        ? `/api/community/posts?spaceId=${selectedSpace}` 
        : "/api/community/posts";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const { data: postDetail, isLoading: postDetailLoading } = useQuery<PostWithComments>({
    queryKey: ["/api/community/posts", selectedPost],
    queryFn: async () => {
      const res = await fetch(`/api/community/posts/${selectedPost}`);
      if (!res.ok) throw new Error("Failed to fetch post");
      return res.json();
    },
    enabled: !!selectedPost,
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: typeof newPost) => {
      return apiRequest("POST", "/api/community/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setIsNewPostOpen(false);
      setNewPost({ title: "", content: "", postType: "discussion", spaceId: "" });
      toast({ title: "Post created!", description: "You earned +2 reputation points." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post. Please log in first.", variant: "destructive" });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      return apiRequest("POST", `/api/community/posts/${postId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", selectedPost] });
      setNewComment("");
      toast({ title: "Answer posted!", description: "You earned +5 reputation points." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to post answer. Please log in first.", variant: "destructive" });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ targetType, targetId, voteType }: { targetType: string; targetId: string; voteType: string }) => {
      return apiRequest("POST", "/api/community/vote", { targetType, targetId, voteType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      if (selectedPost) {
        queryClient.invalidateQueries({ queryKey: ["/api/community/posts", selectedPost] });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Please log in to vote.", variant: "destructive" });
    },
  });

  const acceptAnswerMutation = useMutation({
    mutationFn: async ({ postId, commentId }: { postId: string; commentId: string }) => {
      return apiRequest("POST", `/api/community/posts/${postId}/accept-answer`, { commentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", selectedPost] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/leaderboard"] });
      toast({ title: "Answer accepted!", description: "The answerer earned +15 reputation points." });
    },
    onError: () => {
      toast({ title: "Error", description: "Only the post author can accept answers.", variant: "destructive" });
    },
  });

  const { data: leaderboard } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/community/leaderboard"],
    enabled: showLeaderboard,
  });

  const getTrustLevelInfo = (level: number) => {
    const levels = [
      { name: "New Member", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", icon: Users },
      { name: "Contributor", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Star },
      { name: "Trusted", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: Shield },
      { name: "Leader", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", icon: Trophy },
    ];
    return levels[level] || levels[0];
  };

  const filteredPosts = posts?.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPostTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      question: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      discussion: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "how-to": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      bug: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      feature: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      "show-tell": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      announcement: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  if (showMarketplace) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setShowMarketplace(false)} data-testid="button-back-from-marketplace">
              Back to Forum
            </Button>
            <ServiceMarketplace />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (showModeration) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setShowModeration(false)} data-testid="button-back-from-moderation">
              Back to Forum
            </Button>
            <ModerationQueue />
            <FlagContentDialog
              open={!!flagTarget}
              onOpenChange={(open) => !open && setFlagTarget(null)}
              targetType={flagTarget?.type || "post"}
              targetId={flagTarget?.id || ""}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (selectedPost && postDetail) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setSelectedPost(null)} data-testid="button-back">
              Back to Posts
            </Button>
            <FlagContentDialog
              open={!!flagTarget}
              onOpenChange={(open) => !open && setFlagTarget(null)}
              targetType={flagTarget?.type || "post"}
          targetId={flagTarget?.id || ""}
        />

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getPostTypeBadge(postDetail.postType)}>{postDetail.postType}</Badge>
                  {postDetail.acceptedAnswerId && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" /> Solved
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl" data-testid="text-post-title">{postDetail.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {postDetail.viewCount || 0} views
                  </span>
                  <span>{formatDate(postDetail.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => voteMutation.mutate({ targetType: "post", targetId: postDetail.id, voteType: "upvote" })}
                    data-testid="button-upvote-post"
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </Button>
                  <span className="font-bold text-lg" data-testid="text-post-score">
                    {(postDetail.upvotes || 0) - (postDetail.downvotes || 0)}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => voteMutation.mutate({ targetType: "post", targetId: postDetail.id, voteType: "downvote" })}
                    data-testid="button-downvote-post"
                  >
                    <ThumbsDown className="w-5 h-5" />
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); setFlagTarget({ type: "post", id: postDetail.id }); }}
                  data-testid="button-flag-post"
                >
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap" data-testid="text-post-content">{postDetail.content}</p>
            {postDetail.tags && postDetail.tags.length > 0 && (
              <div className="flex gap-2 mt-4">
                {postDetail.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <Hash className="w-3 h-3 mr-1" />{tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {postDetail.comments?.length || 0} Answers
          </h3>

          {postDetail.comments?.map((comment) => (
            <Card key={comment.id} className={comment.isAccepted ? "border-green-500 border-2" : ""}>
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => voteMutation.mutate({ targetType: "comment", targetId: comment.id, voteType: "upvote" })}
                      data-testid={`button-upvote-comment-${comment.id}`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <span className="font-medium">
                      {(comment.upvotes || 0) - (comment.downvotes || 0)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => voteMutation.mutate({ targetType: "comment", targetId: comment.id, voteType: "downvote" })}
                      data-testid={`button-downvote-comment-${comment.id}`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                    {comment.isAccepted ? (
                      <CheckCircle className="w-6 h-6 text-green-600 mt-2" />
                    ) : !postDetail.acceptedAnswerId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs"
                        onClick={() => acceptAnswerMutation.mutate({ postId: postDetail.id, commentId: comment.id })}
                        disabled={acceptAnswerMutation.isPending}
                        data-testid={`button-accept-answer-${comment.id}`}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-muted-foreground">{formatDate(comment.createdAt)}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setFlagTarget({ type: "comment", id: comment.id })}
                        data-testid={`button-flag-comment-${comment.id}`}
                      >
                        <Flag className="w-3 h-3 mr-1" />
                        Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Share your knowledge..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[120px]"
                data-testid="input-new-answer"
              />
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => createCommentMutation.mutate({ postId: postDetail.id, content: newComment })}
                disabled={!newComment.trim() || createCommentMutation.isPending}
                data-testid="button-submit-answer"
              >
                Post Answer (+5 rep)
              </Button>
            </CardFooter>
          </Card>
        </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Community Forum</h1>
          <p className="text-muted-foreground mt-1">Ask questions, share knowledge, earn reputation</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => setShowMarketplace(true)}
            data-testid="button-marketplace"
          >
            <Award className="w-4 h-4 mr-2" /> Marketplace
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowModeration(true)}
            data-testid="button-moderation"
          >
            <Shield className="w-4 h-4 mr-2" /> Moderation
          </Button>
          <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-leaderboard">
                <Trophy className="w-4 h-4 mr-2" /> Leaderboard
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Contributors
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {leaderboard?.slice(0, 10).map((user, index) => {
                  const trustInfo = getTrustLevelInfo(user.trustLevel || 0);
                  const TrustIcon = trustInfo.icon;
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover-elevate"
                      onClick={() => { setShowLeaderboard(false); setProfileUserId(user.userId); }}
                      data-testid={`leaderboard-user-${index}`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <Avatar>
                        <AvatarFallback>
                          <TrustIcon className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.userId.slice(0, 8)}...</p>
                        <Badge className={`${trustInfo.color} text-xs`}>{trustInfo.name}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{user.totalReputation || 0}</p>
                        <p className="text-xs text-muted-foreground">rep</p>
                      </div>
                    </div>
                  );
                })}
                {!leaderboard?.length && (
                  <p className="text-center text-muted-foreground py-4">No contributors yet. Be the first!</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={!!profileUserId} onOpenChange={(open) => !open && setProfileUserId(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Profile
                </DialogTitle>
              </DialogHeader>
              {profileUserId && <UserProfile userId={profileUserId} />}
            </DialogContent>
          </Dialog>
          <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-post">
                <Plus className="w-4 h-4 mr-2" /> New Post
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Select value={newPost.spaceId} onValueChange={(v) => setNewPost({ ...newPost, spaceId: v })}>
                  <SelectTrigger data-testid="select-space">
                    <SelectValue placeholder="Select Space" />
                  </SelectTrigger>
                  <SelectContent>
                    {spaces?.map((space) => (
                      <SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newPost.postType} onValueChange={(v) => setNewPost({ ...newPost, postType: v })}>
                  <SelectTrigger data-testid="select-post-type">
                    <SelectValue placeholder="Post Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="how-to">How-To Guide</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="show-tell">Show & Tell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                data-testid="input-post-title"
              />
              <Textarea
                placeholder="Describe your question or share your knowledge..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="min-h-[200px]"
                data-testid="input-post-content"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>Cancel</Button>
              <Button
                onClick={() => createPostMutation.mutate(newPost)}
                disabled={!newPost.title || !newPost.content || !newPost.spaceId || createPostMutation.isPending}
                data-testid="button-submit-post"
              >
                Post (+2 rep)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 flex items-center gap-3"><Users className="w-8 h-8 text-primary" /><div><p className="text-sm text-muted-foreground">Active Users</p><p className="text-2xl font-bold">4.2K</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><MessageSquare className="w-8 h-8 text-primary" /><div><p className="text-sm text-muted-foreground">Total Posts</p><p className="text-2xl font-bold">{posts?.length || 0}</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><TrendingUp className="w-8 h-8 text-primary" /><div><p className="text-sm text-muted-foreground">Solved Rate</p><p className="text-2xl font-bold">78%</p></div></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-3"><Award className="w-8 h-8 text-primary" /><div><p className="text-sm text-muted-foreground">Top Rep</p><p className="text-2xl font-bold">2.4K</p></div></CardContent></Card>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all" onClick={() => setSelectedSpace(null)} data-testid="tab-all">
            All Spaces
          </TabsTrigger>
          {spacesLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            spaces?.slice(0, 6).map((space) => (
              <TabsTrigger
                key={space.id}
                value={space.id}
                onClick={() => setSelectedSpace(space.id)}
                data-testid={`tab-space-${space.slug}`}
              >
                {space.icon} {space.name}
              </TabsTrigger>
            ))
          )}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <PostList
            posts={filteredPosts}
            isLoading={postsLoading}
            onSelectPost={setSelectedPost}
            getPostTypeBadge={getPostTypeBadge}
            formatDate={formatDate}
          />
        </TabsContent>
        {spaces?.map((space) => (
          <TabsContent key={space.id} value={space.id} className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{space.name}</h2>
              <p className="text-muted-foreground">{space.description}</p>
            </div>
            <PostList
              posts={filteredPosts}
              isLoading={postsLoading}
              onSelectPost={setSelectedPost}
              getPostTypeBadge={getPostTypeBadge}
              formatDate={formatDate}
            />
          </TabsContent>
        ))}
      </Tabs>
      <FlagContentDialog
        open={!!flagTarget}
        onOpenChange={(open) => !open && setFlagTarget(null)}
        targetType={flagTarget?.type || "post"}
        targetId={flagTarget?.id || ""}
      />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PostList({
  posts,
  isLoading,
  onSelectPost,
  getPostTypeBadge,
  formatDate,
}: {
  posts: CommunityPost[] | undefined;
  isLoading: boolean;
  onSelectPost: (id: string) => void;
  getPostTypeBadge: (type: string) => string;
  formatDate: (date: Date | string | null) => string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No posts yet. Be the first to start a discussion!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="cursor-pointer hover-elevate transition-colors"
          onClick={() => onSelectPost(post.id)}
          data-testid={`card-post-${post.id}`}
        >
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1 text-center min-w-[60px]">
                <span className="font-bold text-lg">{(post.upvotes || 0) - (post.downvotes || 0)}</span>
                <span className="text-xs text-muted-foreground">votes</span>
                <span className={`font-medium text-sm ${post.acceptedAnswerId ? "text-green-600" : ""}`}>
                  {post.answerCount || 0}
                </span>
                <span className="text-xs text-muted-foreground">answers</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className={getPostTypeBadge(post.postType)}>{post.postType}</Badge>
                  {post.acceptedAnswerId && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" /> Solved
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg truncate" data-testid={`text-post-title-${post.id}`}>
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{post.content}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {post.viewCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
