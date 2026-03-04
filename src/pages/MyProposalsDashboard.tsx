import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  FileText, Clock, DollarSign, Briefcase, Calendar, 
  CheckCircle, XCircle, Eye, AlertCircle, ExternalLink, 
  TrendingUp, ArrowRight
} from "lucide-react";

interface MyProposal {
  id: string;
  job_id: string;
  job_title: string;
  job_status: string;
  job_budget_min: string;
  job_budget_max: string;
  job_currency: string;
  job_deadline: string;
  buyer_name: string;
  cover_letter: string;
  proposed_price: string;
  estimated_days: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function MyProposalsDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  const { data: proposals, isLoading } = useQuery<MyProposal[]>({
    queryKey: ["/api/community/marketplace/my-proposals"],
  });

  const withdrawMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      return apiRequest("PATCH", `/api/community/marketplace/proposals/${proposalId}`, { status: "withdrawn" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/marketplace/my-proposals"] });
      toast({ title: "Proposal Withdrawn", description: "Your proposal has been withdrawn." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to withdraw proposal.", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">Pending</Badge>;
      case "accepted": return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">Accepted</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      case "shortlisted": return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">Shortlisted</Badge>;
      case "withdrawn": return <Badge variant="secondary">Withdrawn</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatBudget = (min: string, max: string, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 0 });
    return `${formatter.format(Number(min))} - ${formatter.format(Number(max))}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const pendingProposals = proposals?.filter(p => p.status === "pending") || [];
  const shortlistedProposals = proposals?.filter(p => p.status === "shortlisted") || [];
  const acceptedProposals = proposals?.filter(p => p.status === "accepted") || [];
  const rejectedProposals = proposals?.filter(p => p.status === "rejected" || p.status === "withdrawn") || [];

  const filteredProposals = activeTab === "all" ? proposals : 
    activeTab === "pending" ? pendingProposals :
    activeTab === "shortlisted" ? shortlistedProposals :
    activeTab === "accepted" ? acceptedProposals :
    rejectedProposals;

  const successRate = proposals?.length ? 
    Math.round((acceptedProposals.length / proposals.length) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-my-proposals-title">
            <FileText className="w-8 h-8" />
            My Proposals
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage your submitted proposals</p>
        </div>
        <Link to="/marketplace/jobs">
          <Button variant="outline" data-testid="button-browse-jobs">
            Browse Jobs <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{proposals?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total Proposals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingProposals.length}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{shortlistedProposals.length}</div>
            <p className="text-sm text-muted-foreground">Shortlisted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{acceptedProposals.length}</div>
            <p className="text-sm text-muted-foreground">Accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold flex items-center gap-1">
              <TrendingUp className="w-5 h-5" />
              {successRate}%
            </div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-proposals">All ({proposals?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">Pending ({pendingProposals.length})</TabsTrigger>
          <TabsTrigger value="shortlisted" data-testid="tab-shortlisted">Shortlisted ({shortlistedProposals.length})</TabsTrigger>
          <TabsTrigger value="accepted" data-testid="tab-accepted">Accepted ({acceptedProposals.length})</TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected/Withdrawn ({rejectedProposals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !filteredProposals?.length ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  {activeTab === "all" ? "No proposals yet" : `No ${activeTab} proposals`}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "all" 
                    ? "Start by browsing available jobs and submitting proposals"
                    : `You don't have any ${activeTab} proposals at the moment`}
                </p>
                <Link to="/marketplace/jobs">
                  <Button>
                    Browse Jobs <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredProposals.map(proposal => (
                <Card key={proposal.id} className="hover-elevate" data-testid={`proposal-card-${proposal.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Link to={`/marketplace/jobs/${proposal.job_id}`}>
                            <h3 className="text-lg font-semibold hover:underline cursor-pointer">
                              {proposal.job_title}
                            </h3>
                          </Link>
                          {getStatusBadge(proposal.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Posted by {proposal.buyer_name}
                        </p>
                        <p className="text-sm line-clamp-2 mb-3">{proposal.cover_letter}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Job Budget: {formatBudget(proposal.job_budget_min, proposal.job_budget_max, proposal.job_currency)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Submitted {formatDate(proposal.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: 'hsl(var(--primary))' }}>
                            ${Number(proposal.proposed_price).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Your Bid</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {proposal.estimated_days} days
                          </p>
                          <p className="text-xs text-muted-foreground">Delivery</p>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/marketplace/jobs/${proposal.job_id}`}>
                            <Button size="sm" variant="outline" data-testid={`button-view-job-${proposal.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View Job
                            </Button>
                          </Link>
                          {proposal.status === "pending" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => withdrawMutation.mutate(proposal.id)}
                              disabled={withdrawMutation.isPending}
                              data-testid={`button-withdraw-${proposal.id}`}
                            >
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
