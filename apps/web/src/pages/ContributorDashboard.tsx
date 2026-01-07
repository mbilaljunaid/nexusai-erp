import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, Briefcase, FileText, ShoppingCart, Star, Award, 
  TrendingUp, Clock, DollarSign, CheckCircle, Package,
  MessageSquare, Calendar, ArrowRight, ExternalLink, Shield
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  bio: string;
  trust_level: number;
  reputation_score: number;
  badges: string[];
  total_orders: number;
  completed_orders: number;
  total_reviews: number;
  average_rating: number;
  member_since: string;
}

interface ServicePackage {
  id: string;
  title: string;
  price: string;
  delivery_days: number;
  status: string;
  order_count: number;
  rating: number;
  review_count: number;
}

interface ServiceOrder {
  id: string;
  service_title: string;
  buyer_name: string;
  amount: string;
  status: string;
  created_at: string;
}

interface JobPosting {
  id: string;
  title: string;
  status: string;
  proposal_count: number;
  budget_min: string;
  budget_max: string;
  created_at: string;
}

interface Proposal {
  id: string;
  job_title: string;
  proposed_price: string;
  status: string;
  created_at: string;
}

export default function ContributorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: user } = useQuery<{ user: UserProfile }>({
    queryKey: ["/api/auth/user"],
  });

  const { data: myServices, isLoading: servicesLoading } = useQuery<ServicePackage[]>({
    queryKey: ["/api/community/marketplace/my-services"],
  });

  const { data: myOrders, isLoading: ordersLoading } = useQuery<ServiceOrder[]>({
    queryKey: ["/api/community/marketplace/my-orders"],
  });

  const { data: myJobs, isLoading: jobsLoading } = useQuery<JobPosting[]>({
    queryKey: ["/api/community/marketplace/my-jobs"],
  });

  const { data: myProposals, isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/community/marketplace/my-proposals"],
  });

  const profile = user?.user;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": case "active": case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">{status}</Badge>;
      case "in_progress": case "accepted": case "shortlisted":
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">{status.replace("_", " ")}</Badge>;
      case "completed": case "delivered":
        return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">{status}</Badge>;
      case "cancelled": case "rejected": case "withdrawn":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrustLevelBadge = (level: number) => {
    const levels: Record<number, { label: string; color: string }> = {
      0: { label: "New Member", color: "bg-gray-500/10 text-gray-600 dark:text-gray-400" },
      1: { label: "Basic", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      2: { label: "Member", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
      3: { label: "Regular", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
      4: { label: "Leader", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
      5: { label: "Champion", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
    };
    const { label, color } = levels[level] || levels[0];
    return <Badge className={color}>{label}</Badge>;
  };

  const totalEarnings = myOrders?.filter(o => o.status === "completed" || o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.amount), 0) || 0;

  const activeServices = myServices?.filter(s => s.status === "active").length || 0;
  const openJobs = myJobs?.filter(j => j.status === "open").length || 0;
  const pendingProposals = myProposals?.filter(p => p.status === "pending").length || 0;
  const acceptedProposals = myProposals?.filter(p => p.status === "accepted").length || 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-contributor-dashboard-title">
            <User className="w-8 h-8" />
            Contributor Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Your unified marketplace activity center</p>
        </div>
      </div>

      {profile && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback className="text-2xl">{profile.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  {getTrustLevelBadge(profile.trust_level)}
                  {profile.badges?.slice(0, 3).map((badge, i) => (
                    <Badge key={i} variant="outline" className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {badge}
                    </Badge>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">@{profile.username}</p>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">{profile.average_rating?.toFixed(1) || "N/A"}</span>
                    <span className="text-muted-foreground">({profile.total_reviews || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Reputation: <span className="font-semibold">{profile.reputation_score || 0}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {formatDate(profile.member_since || new Date().toISOString())}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/settings/profile">
                  <Button variant="outline" data-testid="button-edit-profile">Edit Profile</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--primary))' }} />
            <div className="text-2xl font-bold">{activeServices}</div>
            <p className="text-xs text-muted-foreground">Active Services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{myOrders?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{openJobs}</div>
            <p className="text-xs text-muted-foreground">Open Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{pendingProposals}</div>
            <p className="text-xs text-muted-foreground">Pending Proposals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{acceptedProposals}</div>
            <p className="text-xs text-muted-foreground">Won Projects</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="services" data-testid="tab-services">My Services</TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
          <TabsTrigger value="jobs" data-testid="tab-jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="proposals" data-testid="tab-proposals">Proposals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                  <CardDescription>Your latest service orders</CardDescription>
                </div>
                <Link to="/marketplace/my-orders">
                  <Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
                </Link>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : !myOrders?.length ? (
                  <p className="text-center text-muted-foreground py-8">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {myOrders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{order.service_title}</p>
                          <p className="text-xs text-muted-foreground">{order.buyer_name} • {formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">${Number(order.amount).toLocaleString()}</span>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">Recent Proposals</CardTitle>
                  <CardDescription>Your latest job proposals</CardDescription>
                </div>
                <Link to="/marketplace/my-proposals">
                  <Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
                </Link>
              </CardHeader>
              <CardContent>
                {proposalsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : !myProposals?.length ? (
                  <p className="text-center text-muted-foreground py-8">No proposals yet</p>
                ) : (
                  <div className="space-y-3">
                    {myProposals.slice(0, 5).map(proposal => (
                      <div key={proposal.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{proposal.job_title}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(proposal.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">${Number(proposal.proposed_price).toLocaleString()}</span>
                          {getStatusBadge(proposal.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg">My Services</CardTitle>
                <CardDescription>Services you offer on the marketplace</CardDescription>
              </div>
              <Link to="/marketplace/services">
                <Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
              ) : !myServices?.length ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">You haven't created any services yet</p>
                  <Link to="/marketplace/services/create">
                    <Button>Create Your First Service</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myServices.slice(0, 6).map(service => (
                    <Card key={service.id} className="hover-elevate">
                      <CardContent className="pt-4">
                        <h4 className="font-semibold truncate mb-2">{service.title}</h4>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-bold" style={{ color: 'hsl(var(--primary))' }}>${Number(service.price).toLocaleString()}</span>
                          {getStatusBadge(service.status)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {service.rating?.toFixed(1) || "N/A"}
                          </span>
                          <span>{service.order_count || 0} orders</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {service.delivery_days}d
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>My Services</CardTitle>
              <Link to="/marketplace/services/create">
                <Button data-testid="button-create-service">Create New Service</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : !myServices?.length ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No services created yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myServices.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg hover-elevate">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{service.title}</h4>
                          {getStatusBadge(service.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>${Number(service.price).toLocaleString()}</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {service.rating?.toFixed(1) || "N/A"} ({service.review_count || 0})
                          </span>
                          <span>{service.order_count || 0} orders</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {service.delivery_days} days delivery
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>Orders received for your services</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : !myOrders?.length ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No orders received yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover-elevate">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{order.service_title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Ordered by {order.buyer_name} on {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg">${Number(order.amount).toLocaleString()}</span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>My Job Postings</CardTitle>
                <CardDescription>Jobs you've posted on the marketplace</CardDescription>
              </div>
              <Link to="/marketplace/my-jobs">
                <Button variant="outline">Manage Jobs <ExternalLink className="w-4 h-4 ml-2" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : !myJobs?.length ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">You haven't posted any jobs yet</p>
                  <Link to="/marketplace/my-jobs">
                    <Button>Post Your First Job</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myJobs.map(job => (
                    <Link key={job.id} to={`/marketplace/jobs/${job.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover-elevate cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{job.title}</h4>
                            {getStatusBadge(job.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Posted {formatDate(job.created_at)} • {job.proposal_count || 0} proposals
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">${Number(job.budget_min).toLocaleString()} - ${Number(job.budget_max).toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proposals" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>My Proposals</CardTitle>
                <CardDescription>Proposals you've submitted to jobs</CardDescription>
              </div>
              <Link to="/marketplace/my-proposals">
                <Button variant="outline">Manage Proposals <ExternalLink className="w-4 h-4 ml-2" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {proposalsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : !myProposals?.length ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">You haven't submitted any proposals yet</p>
                  <Link to="/marketplace/jobs">
                    <Button>Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myProposals.map(proposal => (
                    <Link key={proposal.id} to={`/marketplace/jobs/${proposal.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover-elevate cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{proposal.job_title}</h4>
                            {getStatusBadge(proposal.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Submitted {formatDate(proposal.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>${Number(proposal.proposed_price).toLocaleString()}</span>
                          <p className="text-xs text-muted-foreground">Your bid</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
