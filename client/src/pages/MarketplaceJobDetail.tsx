import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Header, Footer } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Briefcase, Clock, DollarSign, Calendar, Users, 
  MessageSquare, CheckCircle, XCircle, AlertCircle, User, Star
} from "lucide-react";

interface JobProposal {
  id: string;
  job_posting_id: string;
  provider_id: string;
  package_id: string | null;
  proposal_message: string;
  bid_amount: string;
  estimated_delivery_days: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  provider_name: string;
}

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
  proposals?: JobProposal[];
}

export default function MarketplaceJobDetail() {
  const [, params] = useRoute("/marketplace/jobs/:id");
  const jobId = params?.id;

  const { data: job, isLoading, error } = useQuery<JobPosting>({
    queryKey: ["/api/community/marketplace/jobs", jobId],
    queryFn: async () => {
      const res = await fetch(`/api/community/marketplace/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch job");
      return res.json();
    },
    enabled: !!jobId,
  });

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
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatShortDate = (dateStr: string) => {
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

  const getProposalStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-500" />;
      case "shortlisted": return <Star className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "shortlisted": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "withdrawn": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 bg-slate-800 mb-6" />
          <Skeleton className="h-12 w-3/4 bg-slate-800 mb-4" />
          <Skeleton className="h-64 w-full bg-slate-800" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Job Not Found</h3>
              <p className="text-slate-400 mb-4">The job posting you're looking for doesn't exist or has been removed.</p>
              <Link to="/marketplace/jobs">
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 py-8 border-b border-slate-800">
          <div className="container mx-auto px-4">
            <Link to="/marketplace/jobs">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white mb-4" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline" className={getStatusColor(job.status)}>
                    {job.status === "in_progress" ? "In Progress" : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className={getUrgencyColor(job.urgency)}>
                    {job.urgency.charAt(0).toUpperCase() + job.urgency.slice(1)} Priority
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-white mb-3" data-testid="text-job-title">
                  {job.title}
                </h1>
                <div className="flex items-center gap-4 text-slate-400">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Posted by {job.buyer_name}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {job.category_name}
                  </span>
                </div>
              </div>
              
              <div className="lg:text-right">
                <div className="text-2xl font-bold text-green-400 mb-2" data-testid="text-job-budget">
                  {formatBudget(job.budget_min, job.budget_max, job.currency)}
                </div>
                <p className="text-slate-400 text-sm">Budget Range</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap" data-testid="text-job-description">
                    {job.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills?.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-slate-700/50 text-slate-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Proposals</CardTitle>
                    <CardDescription className="text-slate-400">
                      {job.proposals?.length || 0} experts have submitted proposals
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {!job.proposals || job.proposals.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-400">No proposals submitted yet</p>
                      <p className="text-slate-500 text-sm mt-1">Be the first to submit a proposal!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {job.proposals.map((proposal) => (
                        <div 
                          key={proposal.id} 
                          className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50"
                          data-testid={`card-proposal-${proposal.id}`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-slate-700 text-slate-300">
                                  {proposal.provider_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-white">{proposal.provider_name}</h4>
                                <p className="text-xs text-slate-400">
                                  Submitted {formatShortDate(proposal.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getProposalStatusIcon(proposal.status)}
                              <Badge variant="outline" className={getProposalStatusColor(proposal.status)}>
                                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                            {proposal.proposal_message}
                          </p>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1.5 text-green-400">
                                <DollarSign className="w-4 h-4" />
                                ${Number(proposal.bid_amount).toLocaleString()}
                              </span>
                              {proposal.estimated_delivery_days && (
                                <span className="flex items-center gap-1.5 text-slate-400">
                                  <Clock className="w-4 h-4" />
                                  {proposal.estimated_delivery_days} days
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-base">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Budget</p>
                      <p className="font-semibold text-white">
                        {formatBudget(job.budget_min, job.budget_max, job.currency)}
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-700" />
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Deadline</p>
                      <p className="font-semibold text-white">{formatDate(job.deadline)}</p>
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-700" />
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Proposals</p>
                      <p className="font-semibold text-white">{job.proposals?.length || 0} submitted</p>
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-700" />
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-500/10 rounded-lg">
                      <Clock className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Posted</p>
                      <p className="font-semibold text-white">{formatDate(job.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {job.status === "open" && (
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-white mb-2">Interested in this project?</h4>
                    <p className="text-sm text-slate-400 mb-4">
                      Submit a proposal to show the client why you're the best fit for this job.
                    </p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-500" data-testid="button-submit-proposal">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Submit Proposal
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-base">About the Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-slate-700 text-slate-300">
                        {job.buyer_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-white">{job.buyer_name}</h4>
                      <p className="text-xs text-slate-400">Member since 2022</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Jobs Posted</p>
                      <p className="font-semibold text-white">12</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Hire Rate</p>
                      <p className="font-semibold text-white">83%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
