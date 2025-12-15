import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, Briefcase, Clock, DollarSign, Calendar, Users, 
  MessageSquare, CheckCircle, XCircle, AlertCircle, User, Star,
  MapPin, Globe, Award, Shield
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
  const { toast } = useToast();
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [proposal, setProposal] = useState({
    message: "",
    bidAmount: "",
    estimatedDays: ""
  });

  const { data: job, isLoading, error } = useQuery<JobPosting>({
    queryKey: ["/api/community/marketplace/jobs", jobId],
    queryFn: async () => {
      const res = await fetch(`/api/community/marketplace/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch job");
      return res.json();
    },
    enabled: !!jobId,
  });

  const submitProposalMutation = useMutation({
    mutationFn: async (data: typeof proposal) => {
      return apiRequest("POST", `/api/community/marketplace/jobs/${jobId}/proposals`, {
        coverLetter: data.message,
        proposedPrice: data.bidAmount,
        estimatedDays: parseInt(data.estimatedDays) || 7
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/marketplace/jobs", jobId] });
      setIsProposalOpen(false);
      setProposal({ message: "", bidAmount: "", estimatedDays: "" });
      toast({ title: "Proposal Submitted", description: "Your proposal has been submitted successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit proposal. You may need to be logged in.", variant: "destructive" });
    },
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

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "critical": return <Badge variant="destructive">Critical Priority</Badge>;
      case "high": return <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400">High Priority</Badge>;
      case "normal": return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">Normal Priority</Badge>;
      case "low": return <Badge variant="secondary">Low Priority</Badge>;
      default: return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">Open</Badge>;
      case "in_progress": return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">In Progress</Badge>;
      case "completed": return <Badge variant="secondary">Completed</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProposalStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-500" />;
      case "shortlisted": return <Star className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getProposalStatusBadge = (status: string) => {
    switch (status) {
      case "accepted": return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">Accepted</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      case "shortlisted": return <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">Shortlisted</Badge>;
      case "withdrawn": return <Badge variant="secondary">Withdrawn</Badge>;
      default: return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Job Not Found</h3>
              <p className="text-muted-foreground mb-4">The job posting you're looking for doesn't exist or has been removed.</p>
              <Link to="/marketplace/jobs">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <Link to="/marketplace/jobs">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {getStatusBadge(job.status)}
                {getUrgencyBadge(job.urgency)}
              </div>
              <h1 className="text-3xl font-bold mb-3" data-testid="text-job-title">
                {job.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Posted by {job.buyer_name}
                </span>
                <span className="hidden md:inline text-border">|</span>
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {job.category_name}
                </span>
                <span className="hidden md:inline text-border">|</span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Posted {formatShortDate(job.created_at)}
                </span>
              </div>
            </div>
            
            <div className="lg:text-right">
              <div className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--primary))' }} data-testid="text-job-budget">
                {formatBudget(job.budget_min, job.budget_max, job.currency)}
              </div>
              <p className="text-muted-foreground text-sm">Budget Range</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed whitespace-pre-wrap" data-testid="text-job-description">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills?.map((skill, idx) => (
                    <Badge key={idx} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {(!job.skills || job.skills.length === 0) && (
                    <p className="text-muted-foreground">No specific skills listed</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle>Proposals</CardTitle>
                  <CardDescription>
                    {job.proposals?.length || 0} experts have submitted proposals
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {!job.proposals || job.proposals.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No proposals submitted yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Be the first to submit a proposal!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {job.proposals.map((proposalItem) => (
                      <div 
                        key={proposalItem.id} 
                        className="p-4 border rounded-lg hover-elevate"
                        data-testid={`card-proposal-${proposalItem.id}`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {proposalItem.provider_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{proposalItem.provider_name}</h4>
                              <p className="text-xs text-muted-foreground">
                                Submitted {formatShortDate(proposalItem.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getProposalStatusIcon(proposalItem.status)}
                            {getProposalStatusBadge(proposalItem.status)}
                          </div>
                        </div>
                        
                        <p className="text-sm mb-4 line-clamp-3">
                          {proposalItem.proposal_message}
                        </p>
                        
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'hsl(var(--primary))' }}>
                              <DollarSign className="w-4 h-4" />
                              ${Number(proposalItem.bid_amount).toLocaleString()}
                            </span>
                            {proposalItem.estimated_delivery_days && (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {proposalItem.estimated_delivery_days} days
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}>
                    <DollarSign className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-semibold">
                      {formatBudget(job.budget_min, job.budget_max, job.currency)}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="font-semibold">{formatDate(job.deadline)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Proposals</p>
                    <p className="font-semibold">{job.proposals?.length || 0} submitted</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Posted</p>
                    <p className="font-semibold">{formatDate(job.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {job.status === "open" && (
              <Card className="border-primary/20" style={{ background: 'linear-gradient(to bottom right, hsl(var(--primary) / 0.05), hsl(var(--primary) / 0.1))' }}>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">Interested in this project?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Submit a proposal to show the client why you're the best fit for this job.
                  </p>
                  <Button className="w-full" onClick={() => setIsProposalOpen(true)} data-testid="button-submit-proposal">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Submit Proposal
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">About the Client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {job.buyer_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{job.buyer_name}</h4>
                    <p className="text-xs text-muted-foreground">Member since 2022</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Jobs Posted</p>
                    <p className="font-semibold">12</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hire Rate</p>
                    <p className="font-semibold">83%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isProposalOpen} onOpenChange={setIsProposalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit a Proposal</DialogTitle>
            <DialogDescription>
              Explain why you're the best fit for "{job.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Cover Letter</label>
              <Textarea
                placeholder="Describe your experience and how you would approach this project..."
                rows={5}
                value={proposal.message}
                onChange={(e) => setProposal({ ...proposal, message: e.target.value })}
                data-testid="input-proposal-message"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Your Bid ($)</label>
                <Input
                  type="number"
                  placeholder={`${job.budget_min} - ${job.budget_max}`}
                  value={proposal.bidAmount}
                  onChange={(e) => setProposal({ ...proposal, bidAmount: e.target.value })}
                  data-testid="input-proposal-bid"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Delivery (days)</label>
                <Input
                  type="number"
                  placeholder="7"
                  value={proposal.estimatedDays}
                  onChange={(e) => setProposal({ ...proposal, estimatedDays: e.target.value })}
                  data-testid="input-proposal-days"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProposalOpen(false)}>Cancel</Button>
            <Button
              onClick={() => submitProposalMutation.mutate(proposal)}
              disabled={submitProposalMutation.isPending || !proposal.message || !proposal.bidAmount}
              data-testid="button-confirm-proposal"
            >
              {submitProposalMutation.isPending ? "Submitting..." : "Submit Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
