import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, Briefcase, Package, Star, Award, 
  MessageSquare, Calendar, ArrowLeft, MapPin, Building2,
  Shield, TrendingUp, Clock, CheckCircle, ExternalLink
} from "lucide-react";

interface ContributorProfileData {
  user: {
    id: string;
    name: string;
    role: string;
    created_at: string;
  };
  trust: {
    trust_level: number;
    total_reputation: number;
  } | null;
  services: Array<{
    id: string;
    title: string;
    description: string;
    price: string;
    delivery_days: number;
    category: string;
    rating: number;
    review_count: number;
    status: string;
  }>;
  jobs: Array<{
    id: string;
    title: string;
    description: string;
    budget_min: string;
    budget_max: string;
    status: string;
    proposal_count: number;
    created_at: string;
  }>;
  posts: Array<{
    id: string;
    title: string;
    content: string;
    space_id: string;
    view_count: number;
    like_count: number;
    reply_count: number;
    created_at: string;
  }>;
  stats: {
    total_services: number;
    total_jobs: number;
    total_posts: number;
    total_comments: number;
  };
}

export default function ContributorProfile() {
  const [, params] = useRoute("/marketplace/profile/:userId");
  const userId = params?.userId;

  const { data, isLoading, error } = useQuery<ContributorProfileData>({
    queryKey: ["/api/community/marketplace/profile", userId],
    queryFn: async () => {
      const res = await fetch(`/api/community/marketplace/profile/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!userId,
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTrustLevelInfo = (level: number) => {
    const levels: Record<number, { label: string; color: string; icon: typeof Shield }> = {
      0: { label: "New Member", color: "bg-gray-500/10 text-gray-600 dark:text-gray-400", icon: User },
      1: { label: "Basic", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: User },
      2: { label: "Member", color: "bg-green-500/10 text-green-600 dark:text-green-400", icon: Star },
      3: { label: "Regular", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400", icon: TrendingUp },
      4: { label: "Leader", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", icon: Award },
      5: { label: "Champion", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400", icon: Shield },
    };
    return levels[level] || levels[0];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": case "active": case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">{status}</Badge>;
      case "in_progress": case "accepted":
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">{status.replace("_", " ")}</Badge>;
      case "completed": case "closed":
        return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">{status}</Badge>;
      case "cancelled": case "rejected":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-80" />
          <div className="md:col-span-2">
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Link href="/marketplace/services">
          <Button variant="ghost" className="mb-4" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground">This contributor profile does not exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, trust, services, jobs, posts, stats } = data;
  const trustInfo = getTrustLevelInfo(trust?.trust_level || 0);
  const TrustIcon = trustInfo.icon;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link href="/marketplace/services">
        <Button variant="ghost" className="mb-4" data-testid="button-back-marketplace">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="h-fit">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold" data-testid="text-profile-name">{user.name}</h1>
              <p className="text-muted-foreground capitalize">{user.role}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Badge className={trustInfo.color}>
                  <TrustIcon className="h-3 w-3 mr-1" />
                  {trustInfo.label}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Member since {formatDate(user.created_at)}</span>
              </div>
              {trust && (
                <div className="flex items-center gap-3 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>{trust.total_reputation.toLocaleString()} reputation</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total_services}</div>
                <div className="text-xs text-muted-foreground">Services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total_jobs}</div>
                <div className="text-xs text-muted-foreground">Jobs Posted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total_posts}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total_comments}</div>
                <div className="text-xs text-muted-foreground">Comments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services" data-testid="tab-services">
                <Package className="h-4 w-4 mr-2" />
                Services ({services.length})
              </TabsTrigger>
              <TabsTrigger value="jobs" data-testid="tab-jobs">
                <Briefcase className="h-4 w-4 mr-2" />
                Jobs ({jobs.length})
              </TabsTrigger>
              <TabsTrigger value="posts" data-testid="tab-posts">
                <MessageSquare className="h-4 w-4 mr-2" />
                Posts ({posts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-6">
              {services.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    No services offered yet
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {services.slice(0, 10).map((service) => (
                    <Card key={service.id} className="hover-elevate">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <Link href={`/marketplace/services/${service.id}`}>
                              <h3 className="font-semibold hover:text-primary cursor-pointer truncate" data-testid={`text-service-title-${service.id}`}>
                                {service.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <Badge variant="outline">{service.category}</Badge>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.delivery_days} days
                              </span>
                              {service.review_count > 0 && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {service.rating.toFixed(1)} ({service.review_count})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              ${parseFloat(service.price).toLocaleString()}
                            </div>
                            {getStatusBadge(service.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {services.length > 10 && (
                    <p className="text-center text-muted-foreground text-sm">
                      Showing 10 of {services.length} services
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="jobs" className="mt-6">
              {jobs.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    No jobs posted yet
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {jobs.slice(0, 10).map((job) => (
                    <Card key={job.id} className="hover-elevate">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <Link href={`/marketplace/jobs/${job.id}`}>
                              <h3 className="font-semibold hover:text-primary cursor-pointer" data-testid={`text-job-title-${job.id}`}>
                                {job.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {job.description}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                              <span>Posted {formatDate(job.created_at)}</span>
                              <span>{job.proposal_count} proposals</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              ${parseFloat(job.budget_min).toLocaleString()} - ${parseFloat(job.budget_max).toLocaleString()}
                            </div>
                            {getStatusBadge(job.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {jobs.length > 10 && (
                    <p className="text-center text-muted-foreground text-sm">
                      Showing 10 of {jobs.length} jobs
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    No community posts yet
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.slice(0, 10).map((post) => (
                    <Card key={post.id} className="hover-elevate">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <Link href={`/community/posts/${post.id}`}>
                              <h3 className="font-semibold hover:text-primary cursor-pointer" data-testid={`text-post-title-${post.id}`}>
                                {post.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {post.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                              <span>Posted {formatDate(post.created_at)}</span>
                              <span>{post.view_count} views</span>
                              <span>{post.like_count} likes</span>
                              <span>{post.reply_count} replies</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {posts.length > 10 && (
                    <p className="text-center text-muted-foreground text-sm">
                      Showing 10 of {posts.length} posts
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
