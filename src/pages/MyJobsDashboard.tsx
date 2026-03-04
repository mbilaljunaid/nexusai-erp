import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Briefcase, Plus, Clock, DollarSign, Users, Calendar, 
  CheckCircle, XCircle, Eye, MessageSquare, ChevronRight,
  AlertCircle, Edit, Trash2, FileText
} from "lucide-react";

interface JobPosting {
  id: string;
  title: string;
  description: string;
  budget_min: string;
  budget_max: string;
  currency: string;
  deadline: string;
  status: string;
  skills: string[];
  urgency: string;
  category_id: string;
  category_name: string;
  proposal_count: number;
  created_at: string;
}

interface Proposal {
  id: string;
  job_id: string;
  provider_id: string;
  provider_name: string;
  cover_letter: string;
  proposed_price: string;
  estimated_days: number;
  status: string;
  created_at: string;
}

interface ServiceCategory {
  id: string;
  name: string;
}

export default function MyJobsDashboard() {
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    categoryId: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    skills: "",
    urgency: "normal"
  });

  const { data: myJobs, isLoading: jobsLoading } = useQuery<JobPosting[]>({
    queryKey: ["/api/community/marketplace/my-jobs"],
  });

  const { data: categories } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/community/marketplace/categories"],
  });

  const { data: proposals, isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/community/marketplace/jobs", selectedJob?.id, "proposals"],
    queryFn: async () => {
      if (!selectedJob) return [];
      const res = await fetch(`/api/community/marketplace/jobs/${selectedJob.id}/proposals`);
      if (!res.ok) throw new Error("Failed to fetch proposals");
      return res.json();
    },
    enabled: !!selectedJob,
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: typeof newJob) => {
      return apiRequest("POST", "/api/community/marketplace/jobs", {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        deadline: data.deadline,
        skills: data.skills.split(",").map(s => s.trim()).filter(Boolean),
        urgency: data.urgency
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/marketplace/my-jobs"] });
      setIsCreateOpen(false);
      setNewJob({ title: "", description: "", categoryId: "", budgetMin: "", budgetMax: "", deadline: "", skills: "", urgency: "normal" });
      toast({ title: "Job Posted", description: "Your job has been posted successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create job posting.", variant: "destructive" });
    },
  });

  const updateProposalMutation = useMutation({
    mutationFn: async ({ proposalId, status }: { proposalId: string; status: string }) => {
      return apiRequest("PATCH", `/api/community/marketplace/proposals/${proposalId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/marketplace/jobs", selectedJob?.id, "proposals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/marketplace/my-jobs"] });
      toast({ title: "Proposal Updated", description: "Proposal status updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update proposal.", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">Open</Badge>;
      case "in_progress": return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">In Progress</Badge>;
      case "completed": return <Badge variant="secondary">Completed</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProposalStatusBadge = (status: string) => {
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

  const openJobs = myJobs?.filter(j => j.status === "open") || [];
  const inProgressJobs = myJobs?.filter(j => j.status === "in_progress") || [];
  const completedJobs = myJobs?.filter(j => j.status === "completed" || j.status === "cancelled") || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-my-jobs-title">
            <Briefcase className="w-8 h-8" />
            My Jobs
          </h1>
          <p className="text-muted-foreground mt-1">Manage your job postings and review proposals</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-job">
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{myJobs?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{openJobs.length}</div>
            <p className="text-sm text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{inProgressJobs.length}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{completedJobs.length}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>My Job Postings</CardTitle>
            <CardDescription>Click on a job to view proposals</CardDescription>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !myJobs?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>You haven't posted any jobs yet.</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsCreateOpen(true)}>
                  Post Your First Job
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myJobs.map(job => (
                  <div
                    key={job.id}
                    className={`p-4 border rounded-lg cursor-pointer hover-elevate ${selectedJob?.id === job.id ? 'border-primary bg-muted/50' : ''}`}
                    onClick={() => setSelectedJob(job)}
                    data-testid={`job-item-${job.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{job.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{job.category_name}</p>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatBudget(job.budget_min, job.budget_max, job.currency)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {job.proposal_count} proposals
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              {selectedJob ? `Proposals for: ${selectedJob.title}` : "Select a Job"}
            </CardTitle>
            <CardDescription>
              {selectedJob ? `${proposals?.length || 0} proposals received` : "Click on a job to view proposals"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedJob ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a job from the list to view proposals</p>
              </div>
            ) : proposalsLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : !proposals?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No proposals received yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map(proposal => (
                  <Card key={proposal.id} data-testid={`proposal-item-${proposal.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold">{proposal.provider_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Submitted {formatDate(proposal.created_at)}
                          </p>
                        </div>
                        {getProposalStatusBadge(proposal.status)}
                      </div>
                      <p className="text-sm line-clamp-2 mb-3">{proposal.cover_letter}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>
                            ${Number(proposal.proposed_price).toLocaleString()}
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {proposal.estimated_days} days
                          </span>
                        </div>
                        {proposal.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProposalMutation.mutate({ proposalId: proposal.id, status: "shortlisted" })}
                              data-testid={`button-shortlist-${proposal.id}`}
                            >
                              Shortlist
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateProposalMutation.mutate({ proposalId: proposal.id, status: "accepted" })}
                              data-testid={`button-accept-${proposal.id}`}
                            >
                              Accept
                            </Button>
                          </div>
                        )}
                        {proposal.status === "shortlisted" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProposalMutation.mutate({ proposalId: proposal.id, status: "rejected" })}
                              data-testid={`button-reject-${proposal.id}`}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateProposalMutation.mutate({ proposalId: proposal.id, status: "accepted" })}
                              data-testid={`button-accept-${proposal.id}`}
                            >
                              Accept
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post a New Job</DialogTitle>
            <DialogDescription>
              Describe your project requirements to attract qualified providers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Job Title</label>
              <Input
                placeholder="e.g., ERP Implementation Consultant Needed"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                data-testid="input-job-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea
                placeholder="Describe your project requirements, goals, and expectations..."
                rows={4}
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                data-testid="input-job-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <Select value={newJob.categoryId} onValueChange={(v) => setNewJob({ ...newJob, categoryId: v })}>
                  <SelectTrigger data-testid="select-job-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Urgency</label>
                <Select value={newJob.urgency} onValueChange={(v) => setNewJob({ ...newJob, urgency: v })}>
                  <SelectTrigger data-testid="select-job-urgency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Budget Min ($)</label>
                <Input
                  type="number"
                  placeholder="500"
                  value={newJob.budgetMin}
                  onChange={(e) => setNewJob({ ...newJob, budgetMin: e.target.value })}
                  data-testid="input-budget-min"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Budget Max ($)</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={newJob.budgetMax}
                  onChange={(e) => setNewJob({ ...newJob, budgetMax: e.target.value })}
                  data-testid="input-budget-max"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Deadline</label>
              <Input
                type="date"
                value={newJob.deadline}
                onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                data-testid="input-job-deadline"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Required Skills (comma-separated)</label>
              <Input
                placeholder="e.g., SAP, Oracle, Financial Reporting"
                value={newJob.skills}
                onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                data-testid="input-job-skills"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createJobMutation.mutate(newJob)}
              disabled={createJobMutation.isPending || !newJob.title || !newJob.description || !newJob.categoryId}
              data-testid="button-submit-job"
            >
              {createJobMutation.isPending ? "Posting..." : "Post Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
