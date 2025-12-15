import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header, Footer } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, Briefcase, Clock, DollarSign, ChevronLeft, ChevronRight,
  AlertCircle, Users, Calendar, ArrowUpDown, Filter
} from "lucide-react";

interface JobPosting {
  id: string;
  buyer_id: string;
  category_id: string;
  title: string;
  description: string;
  budget_min: string;
  budget_max: string;
  currency: string;
  deadline: string;
  status: string;
  skills: string[];
  urgency: string;
  total_proposals: number;
  created_at: string;
  updated_at: string;
  buyer_name: string;
  category_name: string;
  proposal_count: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
}

export default function MarketplaceJobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("open");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const { data: categories } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/community/marketplace/categories"],
  });

  const { data: jobs, isLoading } = useQuery<JobPosting[]>({
    queryKey: ["/api/community/marketplace/jobs", selectedCategory, selectedStatus, selectedUrgency, sortBy, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("categoryId", selectedCategory);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedUrgency !== "all") params.append("urgency", selectedUrgency);
      params.append("sort", sortBy);
      params.append("limit", String(ITEMS_PER_PAGE));
      params.append("offset", String((currentPage - 1) * ITEMS_PER_PAGE));
      const res = await fetch(`/api/community/marketplace/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });

  const filteredJobs = jobs?.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatBudget = (min: string, max: string, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(Number(min))} - ${formatter.format(Number(max))}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "critical": return <Badge variant="destructive">{urgency}</Badge>;
      case "high": return <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">{urgency}</Badge>;
      case "normal": return <Badge variant="secondary">{urgency}</Badge>;
      case "low": return <Badge variant="outline">{urgency}</Badge>;
      default: return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">Open</Badge>;
      case "in_progress": return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">In Progress</Badge>;
      case "completed": return <Badge variant="secondary">Completed</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-muted/50 py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <Badge className="mb-4" style={{ backgroundColor: `hsl(var(--primary) / 0.1)`, color: `hsl(var(--primary))` }}>
                JOB BOARD
              </Badge>
              <h1 className="text-4xl font-bold mb-4" data-testid="text-jobs-title">
                NexusAI Job Board
              </h1>
              <p className="text-xl text-muted-foreground mb-8" data-testid="text-jobs-description">
                Find ERP consulting opportunities or post a job to hire experienced NexusAI experts
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs by title or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-jobs-search"
                  />
                </div>
                <Button data-testid="button-post-job">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Urgency</label>
                    <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                      <SelectTrigger data-testid="select-urgency">
                        <SelectValue placeholder="All Urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Urgency</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger data-testid="select-sort">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Newest First" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="budget_high">Budget: High to Low</SelectItem>
                        <SelectItem value="budget_low">Budget: Low to High</SelectItem>
                        <SelectItem value="deadline">Deadline Soon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">Quick Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Open Jobs</span>
                      <span className="font-medium">{jobs?.filter(j => j.status === "open").length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Projects</span>
                      <span className="font-medium">{jobs?.filter(j => j.status === "in_progress").length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredJobs.length} jobs
                </p>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search terms
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map(job => (
                    <Link key={job.id} to={`/marketplace/jobs/${job.id}`}>
                      <Card className="hover-elevate cursor-pointer" data-testid={`card-job-${job.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <h3 className="text-lg font-semibold">{job.title}</h3>
                                {getStatusBadge(job.status)}
                                {getUrgencyBadge(job.urgency)}
                              </div>
                              <p className="text-muted-foreground line-clamp-2 mb-3">
                                {job.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {job.skills?.slice(0, 4).map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills?.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{job.skills.length - 4} more
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {job.buyer_name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {job.category_name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Posted {formatDate(job.created_at)}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="text-right">
                                <p className="text-lg font-bold" style={{ color: `hsl(var(--primary))` }}>
                                  {formatBudget(job.budget_min, job.budget_max, job.currency)}
                                </p>
                                <p className="text-xs text-muted-foreground">Budget</p>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Due {formatDate(job.deadline)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {job.proposal_count || 0} proposals
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {filteredJobs.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="px-4 text-sm text-muted-foreground">
                    Page {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={filteredJobs.length < ITEMS_PER_PAGE}
                    data-testid="button-next-page"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
