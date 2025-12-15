import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Header, Footer } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, ThumbsUp, ThumbsDown, Eye, CheckCircle, 
  Plus, Search, TrendingUp, Clock, Award, Users, Hash, Trophy, Star, Shield, User, Flag,
  Flame, ArrowUp, Sparkles, ChevronDown, Bell, BellOff, Home, History, Bookmark,
  LayoutGrid, Filter, X, Settings, Store, FileText, Plug, DollarSign, Building, Bug,
  Lightbulb, GraduationCap, MessageCircle, type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Settings, Store, FileText, Plug, DollarSign, Building, Bug, Lightbulb,
  GraduationCap, MessageCircle, MessageSquare, Users, Star, Trophy,
  TrendingUp, Clock, Award, Hash, Home, Bookmark, Flag, Shield
};

const getSpaceIcon = (iconName: string | null) => {
  if (!iconName) return <MessageSquare className="w-4 h-4" />;
  const Icon = iconMap[iconName];
  return Icon ? <Icon className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />;
};
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

interface LeaderboardUser {
  id: string;
  userId: string;
  trustLevel: number | null;
  totalReputation: number | null;
  userName: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  profileImageUrl: string | null;
}

const ITEMS_PER_PAGE = 30;

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
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top" | "rising">("hot");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [subscribedSpaces, setSubscribedSpaces] = useState<Set<string>>(new Set());
  const [recentSpaces, setRecentSpaces] = useState<string[]>([]);
  const [filterBySubscribed, setFilterBySubscribed] = useState(false);
  const [filterByPostType, setFilterByPostType] = useState<string>("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("subscribedSpaces");
    if (saved) setSubscribedSpaces(new Set(JSON.parse(saved)));
    const recent = localStorage.getItem("recentSpaces");
    if (recent) setRecentSpaces(JSON.parse(recent));
  }, []);

  const saveSubscription = (spaceId: string, subscribe: boolean) => {
    const newSubs = new Set(subscribedSpaces);
    if (subscribe) newSubs.add(spaceId);
    else newSubs.delete(spaceId);
    setSubscribedSpaces(newSubs);
    localStorage.setItem("subscribedSpaces", JSON.stringify(Array.from(newSubs)));
    toast({ 
      title: subscribe ? "Subscribed!" : "Unsubscribed", 
      description: subscribe ? "You'll see posts from this space in your feed" : "Removed from your subscriptions" 
    });
  };

  const addToRecent = (spaceId: string) => {
    const updated = [spaceId, ...recentSpaces.filter(s => s !== spaceId)].slice(0, 5);
    setRecentSpaces(updated);
    localStorage.setItem("recentSpaces", JSON.stringify(updated));
  };

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
    mutationFn: async (data: typeof newPost) => apiRequest("POST", "/api/community/posts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setIsNewPostOpen(false);
      setNewPost({ title: "", content: "", postType: "discussion", spaceId: "" });
      toast({ title: "Post created!", description: "You earned +2 reputation points." });
    },
    onError: () => toast({ title: "Error", description: "Failed to create post. Please log in first.", variant: "destructive" }),
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => apiRequest("POST", `/api/community/posts/${postId}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", selectedPost] });
      setNewComment("");
      toast({ title: "Answer posted!", description: "You earned +5 reputation points." });
    },
    onError: () => toast({ title: "Error", description: "Failed to post answer. Please log in first.", variant: "destructive" }),
  });

  const voteMutation = useMutation({
    mutationFn: async ({ targetType, targetId, voteType }: { targetType: string; targetId: string; voteType: string }) => apiRequest("POST", "/api/community/vote", { targetType, targetId, voteType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      if (selectedPost) queryClient.invalidateQueries({ queryKey: ["/api/community/posts", selectedPost] });
    },
    onError: () => toast({ title: "Error", description: "Please log in to vote.", variant: "destructive" }),
  });

  const acceptAnswerMutation = useMutation({
    mutationFn: async ({ postId, commentId }: { postId: string; commentId: string }) => apiRequest("POST", `/api/community/posts/${postId}/accept-answer`, { commentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", selectedPost] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/leaderboard"] });
      toast({ title: "Answer accepted!", description: "The answerer earned +15 reputation points." });
    },
    onError: () => toast({ title: "Error", description: "Only the post author can accept answers.", variant: "destructive" }),
  });

  const { data: leaderboard } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/community/leaderboard"],
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

  const sortPosts = (postsToSort: CommunityPost[]) => {
    const sorted = [...postsToSort];
    switch (sortBy) {
      case "hot":
        return sorted.sort((a, b) => {
          const scoreA = ((a.upvotes || 0) - (a.downvotes || 0)) * 2 + (a.viewCount || 0) * 0.1 + (a.answerCount || 0) * 3;
          const scoreB = ((b.upvotes || 0) - (b.downvotes || 0)) * 2 + (b.viewCount || 0) * 0.1 + (b.answerCount || 0) * 3;
          const ageA = Date.now() - new Date(a.createdAt || 0).getTime();
          const ageB = Date.now() - new Date(b.createdAt || 0).getTime();
          return (scoreB / Math.pow(ageB / 3600000 + 2, 1.5)) - (scoreA / Math.pow(ageA / 3600000 + 2, 1.5));
        });
      case "new":
        return sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      case "top":
        return sorted.sort((a, b) => ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0)));
      case "rising":
        return sorted.sort((a, b) => {
          const hourAgo = Date.now() - 3600000;
          const aRecent = new Date(a.createdAt || 0).getTime() > hourAgo;
          const bRecent = new Date(b.createdAt || 0).getTime() > hourAgo;
          if (aRecent && !bRecent) return -1;
          if (!aRecent && bRecent) return 1;
          return ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0));
        });
      default:
        return sorted;
    }
  };

  let filteredPosts = posts?.filter(p => 
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterByPostType === "all" || p.postType === filterByPostType) &&
    (!filterBySubscribed || subscribedSpaces.has(p.spaceId))
  ) || [];

  filteredPosts = sortPosts(filteredPosts);

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

  const trendingPosts = posts?.slice().sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5) || [];

  if (showMarketplace) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setShowMarketplace(false)} data-testid="button-back-from-marketplace">Back to Forum</Button>
          <ServiceMarketplace />
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
          <Button variant="ghost" onClick={() => setShowModeration(false)} data-testid="button-back-from-moderation">Back to Forum</Button>
          <ModerationQueue />
          <FlagContentDialog open={!!flagTarget} onOpenChange={(open) => !open && setFlagTarget(null)} targetType={flagTarget?.type || "post"} targetId={flagTarget?.id || ""} />
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
          <Button variant="ghost" onClick={() => setSelectedPost(null)} className="mb-4" data-testid="button-back">Back to Posts</Button>
          <FlagContentDialog open={!!flagTarget} onOpenChange={(open) => !open && setFlagTarget(null)} targetType={flagTarget?.type || "post"} targetId={flagTarget?.id || ""} />
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getPostTypeBadge(postDetail.postType)}>{postDetail.postType}</Badge>
                    {postDetail.acceptedAnswerId && <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Solved</Badge>}
                  </div>
                  <CardTitle className="text-2xl" data-testid="text-post-title">{postDetail.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {postDetail.viewCount || 0} views</span>
                    <span>{formatDate(postDetail.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => voteMutation.mutate({ targetType: "post", targetId: postDetail.id, voteType: "upvote" })} data-testid="button-upvote-post"><ThumbsUp className="w-5 h-5" /></Button>
                    <span className="font-bold text-lg" data-testid="text-post-score">{(postDetail.upvotes || 0) - (postDetail.downvotes || 0)}</span>
                    <Button size="icon" variant="ghost" onClick={() => voteMutation.mutate({ targetType: "post", targetId: postDetail.id, voteType: "downvote" })} data-testid="button-downvote-post"><ThumbsDown className="w-5 h-5" /></Button>
                  </div>
                  <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setFlagTarget({ type: "post", id: postDetail.id }); }} data-testid="button-flag-post"><Flag className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap" data-testid="text-post-content">{postDetail.content}</p>
              {postDetail.tags && postDetail.tags.length > 0 && (
                <div className="flex gap-2 mt-4">{postDetail.tags.map((tag, i) => <Badge key={i} variant="secondary" className="text-xs"><Hash className="w-3 h-3 mr-1" />{tag}</Badge>)}</div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4 mt-6">
            <h3 className="font-semibold text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5" /> {postDetail.comments?.length || 0} Answers</h3>
            {postDetail.comments?.map((comment) => (
              <Card key={comment.id} className={comment.isAccepted ? "border-green-500 border-2" : ""}>
                <CardContent className="pt-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => voteMutation.mutate({ targetType: "comment", targetId: comment.id, voteType: "upvote" })} data-testid={`button-upvote-comment-${comment.id}`}><ThumbsUp className="w-4 h-4" /></Button>
                      <span className="font-medium">{(comment.upvotes || 0) - (comment.downvotes || 0)}</span>
                      <Button size="icon" variant="ghost" onClick={() => voteMutation.mutate({ targetType: "comment", targetId: comment.id, voteType: "downvote" })} data-testid={`button-downvote-comment-${comment.id}`}><ThumbsDown className="w-4 h-4" /></Button>
                      {comment.isAccepted ? <CheckCircle className="w-6 h-6 text-green-600 mt-2" /> : !postDetail.acceptedAnswerId && (
                        <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => acceptAnswerMutation.mutate({ postId: postDetail.id, commentId: comment.id })} disabled={acceptAnswerMutation.isPending} data-testid={`button-accept-answer-${comment.id}`}><CheckCircle className="w-3 h-3 mr-1" />Accept</Button>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{comment.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-muted-foreground">{formatDate(comment.createdAt)}</p>
                        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => setFlagTarget({ type: "comment", id: comment.id })} data-testid={`button-flag-comment-${comment.id}`}><Flag className="w-3 h-3 mr-1" />Report</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardHeader><CardTitle className="text-base">Your Answer</CardTitle></CardHeader>
              <CardContent><Textarea placeholder="Share your knowledge..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="min-h-[120px]" data-testid="input-new-answer" /></CardContent>
              <CardFooter><Button onClick={() => createCommentMutation.mutate({ postId: postDetail.id, content: newComment })} disabled={!newComment.trim() || createCommentMutation.isPending} data-testid="button-submit-answer">Post Answer (+5 rep)</Button></CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const LeftSidebar = () => (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 space-y-1">
          <Button variant={!selectedSpace && !filterBySubscribed ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => { setSelectedSpace(null); setFilterBySubscribed(false); }} data-testid="button-home-feed">
            <Home className="w-4 h-4 mr-2" /> Home
          </Button>
          <Button variant={filterBySubscribed ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => { setSelectedSpace(null); setFilterBySubscribed(true); }} data-testid="button-subscribed-feed">
            <Bell className="w-4 h-4 mr-2" /> Subscribed
          </Button>
        </CardContent>
      </Card>

      {subscribedSpaces.size > 0 && (
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><Bookmark className="w-4 h-4" /> Your Spaces</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-1">
            {spaces?.filter(s => subscribedSpaces.has(s.id)).map(space => (
              <Button key={space.id} variant={selectedSpace === space.id ? "secondary" : "ghost"} className="w-full justify-start text-sm" onClick={() => { setSelectedSpace(space.id); setFilterBySubscribed(false); addToRecent(space.id); }} data-testid={`button-subscribed-space-${space.slug}`}>
                {getSpaceIcon(space.icon)} <span className="ml-2">{space.name}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {recentSpaces.length > 0 && (
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><History className="w-4 h-4" /> Recent</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-1">
            {spaces?.filter(s => recentSpaces.includes(s.id)).slice(0, 5).map(space => (
              <Button key={space.id} variant={selectedSpace === space.id ? "secondary" : "ghost"} className="w-full justify-start text-sm" onClick={() => { setSelectedSpace(space.id); setFilterBySubscribed(false); }} data-testid={`button-recent-space-${space.slug}`}>
                {getSpaceIcon(space.icon)} <span className="ml-2">{space.name}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> All Spaces</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {spacesLoading ? [1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />) : spaces?.map(space => (
                <div key={space.id} className="flex items-center gap-1">
                  <Button variant={selectedSpace === space.id ? "secondary" : "ghost"} className="flex-1 justify-start text-sm" onClick={() => { setSelectedSpace(space.id); setFilterBySubscribed(false); addToRecent(space.id); }} data-testid={`button-space-${space.slug}`}>
                    {getSpaceIcon(space.icon)} <span className="ml-2">{space.name}</span>
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveSubscription(space.id, !subscribedSpaces.has(space.id))} data-testid={`button-subscribe-${space.slug}`}>
                    {subscribedSpaces.has(space.id) ? <BellOff className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const RightSidebar = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Trending Today</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-3">
          {trendingPosts.map((post, i) => (
            <div key={post.id} className="cursor-pointer hover:bg-muted/50 p-2 rounded-md -mx-2" onClick={() => setSelectedPost(post.id)} data-testid={`trending-post-${i}`}>
              <p className="text-sm font-medium line-clamp-2">{post.title}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.viewCount || 0}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.answerCount || 0}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3"><CardTitle className="text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> Top Contributors</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-2">
          {leaderboard?.slice(0, 5).map((user, index) => {
            const trustInfo = getTrustLevelInfo(user.trustLevel || 0);
            const displayName = user.userName || (user.userFirstName && user.userLastName ? `${user.userFirstName} ${user.userLastName}` : null) || user.userId?.slice(0, 12);
            const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
            return (
              <div key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md -mx-2" onClick={() => setProfileUserId(user.userId)} data-testid={`leaderboard-user-${index}`}>
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">{index + 1}</div>
                <Avatar className="w-7 h-7">
                  {user.profileImageUrl && <AvatarImage src={user.profileImageUrl} alt={displayName} />}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={`text-[10px] px-1 py-0 ${trustInfo.color}`}>
                      <trustInfo.icon className="w-2 h-2 mr-0.5" />{trustInfo.name}
                    </Badge>
                  </div>
                </div>
                <span className="text-xs font-bold text-muted-foreground">{user.totalReputation || 0}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3"><CardTitle className="text-sm">Community Stats</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Active Users</span><span className="font-medium">4.2K</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total Posts</span><span className="font-medium">{posts?.length || 0}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Spaces</span><span className="font-medium">{spaces?.length || 0}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Solved Rate</span><span className="font-medium">78%</span></div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Community</h1>
            <p className="text-muted-foreground text-sm">Ask questions, share knowledge, earn reputation</p>
          </div>
          <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => setShowModeration(true)} data-testid="button-moderation"><Shield className="w-4 h-4 mr-2" /> Moderation</Button>
            <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
              <DialogTrigger asChild><Button size="sm" data-testid="button-new-post"><Plus className="w-4 h-4 mr-2" /> New Post</Button></DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Create New Post</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newPost.spaceId} onValueChange={(v) => setNewPost({ ...newPost, spaceId: v })}>
                      <SelectTrigger data-testid="select-space"><SelectValue placeholder="Select Space" /></SelectTrigger>
                      <SelectContent>{spaces?.map((space) => <SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={newPost.postType} onValueChange={(v) => setNewPost({ ...newPost, postType: v })}>
                      <SelectTrigger data-testid="select-post-type"><SelectValue placeholder="Post Type" /></SelectTrigger>
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
                  <Input placeholder="Post title..." value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} data-testid="input-post-title" />
                  <Textarea placeholder="Describe your question or share your knowledge..." value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} className="min-h-[200px]" data-testid="input-post-content" />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>Cancel</Button>
                  <Button onClick={() => createPostMutation.mutate(newPost)} disabled={!newPost.title || !newPost.content || !newPost.spaceId || createPostMutation.isPending} data-testid="button-submit-post">Post (+2 rep)</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-4"><LeftSidebar /></div>
          </aside>

          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" data-testid="input-search" />
              </div>
              <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setShowMobileFilters(!showMobileFilters)} data-testid="button-mobile-filters"><Filter className="w-4 h-4" /></Button>
            </div>

            {showMobileFilters && (
              <Card className="lg:hidden">
                <CardContent className="pt-4 space-y-4">
                  <LeftSidebar />
                  <Button variant="outline" className="w-full" onClick={() => setShowMobileFilters(false)}><X className="w-4 h-4 mr-2" /> Close</Button>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Button variant={sortBy === "hot" ? "default" : "outline"} size="sm" onClick={() => setSortBy("hot")} data-testid="sort-hot"><Flame className="w-4 h-4 mr-1" /> Hot</Button>
              <Button variant={sortBy === "new" ? "default" : "outline"} size="sm" onClick={() => setSortBy("new")} data-testid="sort-new"><Sparkles className="w-4 h-4 mr-1" /> New</Button>
              <Button variant={sortBy === "top" ? "default" : "outline"} size="sm" onClick={() => setSortBy("top")} data-testid="sort-top"><ArrowUp className="w-4 h-4 mr-1" /> Top</Button>
              <Button variant={sortBy === "rising" ? "default" : "outline"} size="sm" onClick={() => setSortBy("rising")} data-testid="sort-rising"><TrendingUp className="w-4 h-4 mr-1" /> Rising</Button>
              <Separator orientation="vertical" className="h-6" />
              <Select value={filterByPostType} onValueChange={setFilterByPostType}>
                <SelectTrigger className="w-[130px] h-8" data-testid="filter-post-type"><SelectValue placeholder="Post Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="question">Questions</SelectItem>
                  <SelectItem value="discussion">Discussions</SelectItem>
                  <SelectItem value="how-to">How-To</SelectItem>
                  <SelectItem value="bug">Bugs</SelectItem>
                  <SelectItem value="feature">Features</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedSpace && spaces && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{spaces.find(s => s.id === selectedSpace)?.icon}</span>
                    <div>
                      <p className="font-semibold">{spaces.find(s => s.id === selectedSpace)?.name}</p>
                      <p className="text-xs text-muted-foreground">{spaces.find(s => s.id === selectedSpace)?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant={subscribedSpaces.has(selectedSpace) ? "outline" : "default"} onClick={() => saveSubscription(selectedSpace, !subscribedSpaces.has(selectedSpace))} data-testid="button-subscribe-current">
                      {subscribedSpaces.has(selectedSpace) ? <><BellOff className="w-4 h-4 mr-1" /> Unsubscribe</> : <><Bell className="w-4 h-4 mr-1" /> Subscribe</>}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedSpace(null)} data-testid="button-clear-space"><X className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {postsLoading ? (
              <div className="space-y-4">{[1,2,3].map(i => <Card key={i}><CardContent className="pt-6"><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>)}</div>
            ) : filteredPosts.length === 0 ? (
              <Card><CardContent className="pt-6 text-center text-muted-foreground"><MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No posts found. {filterBySubscribed ? "Subscribe to some spaces to see posts here!" : "Be the first to start a discussion!"}</p></CardContent></Card>
            ) : (
              <>
                <div className="space-y-3">
                  {filteredPosts.slice(0, visibleCount).map((post) => (
                    <Card key={post.id} className="cursor-pointer hover-elevate" onClick={() => setSelectedPost(post.id)} data-testid={`card-post-${post.id}`}>
                      <CardContent className="py-4">
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center gap-0.5 text-center min-w-[50px]">
                            <span className="font-bold text-base">{(post.upvotes || 0) - (post.downvotes || 0)}</span>
                            <span className="text-xs text-muted-foreground">votes</span>
                            <span className={`font-medium text-sm mt-1 ${post.acceptedAnswerId ? "text-green-600" : ""}`}>{post.answerCount || 0}</span>
                            <span className="text-xs text-muted-foreground">answers</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge className={getPostTypeBadge(post.postType)}>{post.postType}</Badge>
                              {post.acceptedAnswerId && <Badge variant="outline" className="text-green-600 border-green-600 text-xs"><CheckCircle className="w-3 h-3 mr-1" /> Solved</Badge>}
                            </div>
                            <h3 className="font-semibold line-clamp-2" data-testid={`text-post-title-${post.id}`}>{post.title}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-1 mt-1">{post.content}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.viewCount || 0}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {visibleCount < filteredPosts.length && (
                  <div className="flex justify-center pt-4">
                    <Button variant="outline" onClick={() => setVisibleCount(v => v + ITEMS_PER_PAGE)} data-testid="button-load-more">
                      <ChevronDown className="w-4 h-4 mr-2" /> Load more topics ({filteredPosts.length - visibleCount} remaining)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-4"><RightSidebar /></div>
          </aside>
        </div>

        <Dialog open={!!profileUserId} onOpenChange={(open) => !open && setProfileUserId(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><User className="w-5 h-5" /> User Profile</DialogTitle></DialogHeader>
            {profileUserId && <UserProfile userId={profileUserId} />}
          </DialogContent>
        </Dialog>
        <FlagContentDialog open={!!flagTarget} onOpenChange={(open) => !open && setFlagTarget(null)} targetType={flagTarget?.type || "post"} targetId={flagTarget?.id || ""} />
      </main>
      <Footer />
    </div>
  );
}
