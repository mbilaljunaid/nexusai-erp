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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "normal": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "low": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "completed": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 py-12 border-b border-slate-800">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold text-white mb-4" data-testid="text-jobs-title">
                NexusAI Job Board
              </h1>
              <p className="text-xl text-slate-400 mb-8" data-testid="text-jobs-description">
                Find ERP consulting opportunities or post a job to hire experienced NexusAI experts
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search jobs by title or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    data-testid="input-jobs-search"
                  />
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800" data-testid="button-post-job">
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
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200" data-testid="select-category">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all" className="text-slate-200">All Categories</SelectItem>
                        {categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="text-slate-200">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Status</label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200" data-testid="select-status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all" className="text-slate-200">All Status</SelectItem>
                        <SelectItem value="open" className="text-slate-200">Open</SelectItem>
                        <SelectItem value="in_progress" className="text-slate-200">In Progress</SelectItem>
                        <SelectItem value="completed" className="text-slate-200">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Urgency</label>
                    <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200" data-testid="select-urgency">
                        <SelectValue placeholder="Urgency" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all" className="text-slate-200">Any Urgency</SelectItem>
                        <SelectItem value="critical" className="text-slate-200">Critical</SelectItem>
                        <SelectItem value="high" className="text-slate-200">High</SelectItem>
                        <SelectItem value="normal" className="text-slate-200">Normal</SelectItem>
                        <SelectItem value="low" className="text-slate-200">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200" data-testid="select-sort">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="newest" className="text-slate-200">Newest First</SelectItem>
                        <SelectItem value="budget_high" className="text-slate-200">Budget: High to Low</SelectItem>
                        <SelectItem value="budget_low" className="text-slate-200">Budget: Low to High</SelectItem>
                        <SelectItem value="deadline" className="text-slate-200">Deadline: Soonest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                <h4 className="font-semibold text-white mb-2">Looking to hire?</h4>
                <p className="text-sm text-slate-400 mb-3">
                  Post your project requirements and receive proposals from qualified experts.
                </p>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500" data-testid="button-post-job-sidebar">
                  Post a Job
                </Button>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white" data-testid="text-jobs-count">
                  {isLoading ? "Loading..." : `${filteredJobs.length} Jobs Available`}
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Sorted by {sortBy === "newest" ? "Newest" : sortBy}</span>
                </div>
              </div>

              {isLoading ? (
                <div className="grid gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 bg-slate-700" />
                        <Skeleton className="h-4 w-1/2 bg-slate-700 mt-2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-16 w-full bg-slate-700" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Jobs Found</h3>
                    <p className="text-slate-400">Try adjusting your filters or search query</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredJobs.map((job) => (
                    <Link key={job.id} to={`/marketplace/jobs/${job.id}`}>
                      <Card 
                        className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                        data-testid={`card-job-${job.id}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg text-white mb-1 line-clamp-1" data-testid={`text-job-title-${job.id}`}>
                                {job.title}
                              </CardTitle>
                              <div className="flex items-center gap-3 text-sm text-slate-400">
                                <span>{job.buyer_name}</span>
                                <span className="text-slate-600">|</span>
                                <span>{job.category_name}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Badge variant="outline" className={getStatusColor(job.status)}>
                                {job.status === "in_progress" ? "In Progress" : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </Badge>
                              <Badge variant="outline" className={getUrgencyColor(job.urgency)}>
                                {job.urgency.charAt(0).toUpperCase() + job.urgency.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="text-slate-400 text-sm line-clamp-2 mb-4" data-testid={`text-job-description-${job.id}`}>
                            {job.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills?.slice(0, 4).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills?.length > 4 && (
                              <Badge variant="secondary" className="bg-slate-700/50 text-slate-400 text-xs">
                                +{job.skills.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-3 border-t border-slate-700/50">
                          <div className="flex items-center justify-between w-full text-sm">
                            <div className="flex items-center gap-4 text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 font-medium">{formatBudget(job.budget_min, job.budget_max, job.currency)}</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                Due {formatDate(job.deadline)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Users className="w-4 h-4" />
                              <span>{job.proposal_count || 0} proposals</span>
                            </div>
                          </div>
                        </CardFooter>
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
                    className="border-slate-700 text-slate-300"
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="px-4 text-slate-400 text-sm">Page {currentPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={filteredJobs.length < ITEMS_PER_PAGE}
                    className="border-slate-700 text-slate-300"
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
