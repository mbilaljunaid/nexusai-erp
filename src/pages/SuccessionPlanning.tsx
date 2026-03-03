import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, ArrowUpRight, ShieldCheck, AlertCircle, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { CandidateComparisonModal, RemoveCandidateDialog } from "@/components/succession/CandidateManagementDialogs";
import { ReadinessAssessmentDialog } from "@/components/succession/ReadinessAssessmentDialog";
import { NineBoxMatrix } from "@/components/succession/NineBoxMatrix";

export default function SuccessionPlanning() {
  const [activeTab, setActiveTab] = useState("plans");
  const queryClient = useQueryClient();
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [createPoolOpen, setCreatePoolOpen] = useState(false);
  const [candidateModal, setCandidateModal] = useState<{
    isOpen: boolean;
    planId?: string;
    planName?: string;
  }>({ isOpen: false });

  const [removeDialog, setRemoveDialog] = useState<{
    isOpen: boolean;
    candidate: any | null;
  }>({ isOpen: false, candidate: null });

  const [comparisonModal, setComparisonModal] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const [assessmentDialog, setAssessmentDialog] = useState<{
    isOpen: boolean;
    candidate: any | null;
  }>({ isOpen: false, candidate: null });

  // Fetch Plans
  const { data: plans = [], isLoading: isPlansLoading } = useQuery({
    queryKey: ["/succession/plans"],
    queryFn: async () => {
      const res = await fetch("/api/succession/plans");
      if (!res.ok) {
        // Mock data for development
        return [
          {
            id: 'plan-1',
            name: 'CFO Succession Plan',
            status: 'ACTIVE',
            targetJobId: 'Chief Financial Officer',
            incumbentId: 'emp-001',
            reviewDate: '2026-06-01',
            candidateCount: 2
          },
          {
            id: 'plan-2',
            name: 'VP Engineering Succession',
            status: 'DRAFT',
            targetJobId: 'VP of Engineering',
            incumbentId: 'emp-002',
            reviewDate: '2026-08-15',
            candidateCount: 3
          },
          {
            id: 'plan-3',
            name: 'Regional Director - APAC',
            status: 'ACTIVE',
            targetJobId: 'Regional Director',
            incumbentId: 'emp-003',
            reviewDate: '2026-12-01',
            candidateCount: 1
          }
        ];
      }
      return res.json();
    }
  });

  // Fetch Pools
  const { data: pools = [], isLoading: isPoolsLoading } = useQuery({
    queryKey: ["/succession/pools"],
    queryFn: async () => {
      const res = await fetch("/api/succession/pools");
      if (!res.ok) {
        // Mock data for development
        return [
          {
            id: 'pool-1',
            name: 'Executive Leadership Pipeline',
            description: 'High-potential candidates for C-suite roles',
            status: 'ACTIVE',
            memberCount: 12
          },
          {
            id: 'pool-2',
            name: 'Technical Leaders',
            description: 'Senior engineering and product talent',
            status: 'ACTIVE',
            memberCount: 8
          },
          {
            id: 'pool-3',
            name: 'Emerging Talent',
            description: 'Early career high performers',
            status: 'ACTIVE',
            memberCount: 15
          }
        ];
      }
      return res.json();
    }
  });

  // Fetch candidates for a plan
  const { data: candidates = [] } = useQuery({
    queryKey: ["/succession/plans/candidates", candidateModal.planId],
    queryFn: async () => {
      if (!candidateModal.planId) return [];

      const res = await fetch(`/api/succession/plans/${candidateModal.planId}/candidates`);
      if (!res.ok) {
        // Mock data
        return [
          {
            id: 'cand-1',
            personId: 'emp-101',
            personName: 'Sarah Johnson',
            readiness: 'Ready Now',
            potential: 'High',
            lastAssessment: '2026-01-15'
          },
          {
            id: 'cand-2',
            personId: 'emp-102',
            personName: 'Michael Chen',
            readiness: '1-2 Years',
            potential: 'High',
            lastAssessment: '2026-01-20'
          }
        ];
      }
      return res.json();
    },
    enabled: !!candidateModal.planId
  });

  // Create Plan Mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/succession/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create plan");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/succession/plans"] });
      setCreatePlanOpen(false);
      toast({ title: "Success", description: "Succession plan created successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create succession plan" });
    }
  });

  // Create Pool Mutation
  const createPoolMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/succession/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create pool");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/succession/pools"] });
      setCreatePoolOpen(false);
      toast({ title: "Success", description: "Talent pool created successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create talent pool" });
    }
  });

  // Add Candidate Mutation
  const addCandidateMutation = useMutation({
    mutationFn: async ({ planId, data }: { planId: string; data: any }) => {
      const res = await fetch(`/api/succession/plans/${planId}/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add candidate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/succession/plans/candidates", candidateModal.planId] });
      toast({ title: "Success", description: "Candidate added to succession plan" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to add candidate" });
    }
  });

  // Remove Candidate Mutation
  const removeCandidateMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const res = await fetch(`/api/succession/candidates/${candidateId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove candidate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/succession/plans/candidates", candidateModal.planId] });
      setRemoveDialog({ isOpen: false, candidate: null });
      toast({ title: "Success", description: "Candidate removed from succession plan" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to remove candidate" });
    }
  });

  // Assess Candidate Mutation
  const assessCandidateMutation = useMutation({
    mutationFn: async (assessment: any) => {
      const res = await fetch(`/api/succession/candidates/${assessment.candidateId}/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessment),
      });
      if (!res.ok) throw new Error("Failed to submit assessment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/succession/plans/candidates", candidateModal.planId] });
      setAssessmentDialog({ isOpen: false, candidate: null });
      toast({ title: "Success", description: "Readiness assessment submitted successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit assessment" });
    }
  });

  // Update 9-Box Position Mutation
  const updatePositionMutation = useMutation({
    mutationFn: async ({ candidateId, nineBoxPosition }: { candidateId: string; nineBoxPosition: string }) => {
      const res = await fetch(`/api/succession/candidates/${candidateId}/position`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nineBoxPosition }),
      });
      if (!res.ok) throw new Error("Failed to update position");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/succession/plans/candidates"] });
      toast({ title: "Success", description: "Candidate position updated" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to update position" });
    }
  });

  // Auto-Position Mutation
  const autoPositionMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const res = await fetch(`/api/succession/candidates/${candidateId}/auto-position`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to auto-position candidate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/succession/plans/candidates"] });
      toast({ title: "Success", description: "Candidate auto-positioned based on assessment scores", duration: 3000 });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to auto-position candidate"
      });
    }
  });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createPlanMutation.mutate({
      name: formData.get("name"),
      targetJobId: formData.get("target"),
      status: "DRAFT",
      reviewDate: new Date().toISOString(),
    });
  };

  const handleCreatePool = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createPoolMutation.mutate({
      name: formData.get("poolName"),
      description: formData.get("poolDescription"),
      status: "ACTIVE"
    });
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    if (!candidateModal.planId) return;

    addCandidateMutation.mutate({
      planId: candidateModal.planId,
      data: {
        personId: formData.get("personId"),
        readiness: formData.get("readiness"),
        potential: formData.get("potential")
      }
    });
  };

  if (isPlansLoading || isPoolsLoading) return <div className="p-8">Loading Succession Data...</div>;

  return (
    <StandardPage
      title="Succession Planning"
      description="Identify and develop future leaders"
      className="p-h1>
          <p className="text-muted-foreground mt-1">Identify and develop future leaders</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createPoolOpen} onOpenChange={setCreatePoolOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" /> Create Talent Pool
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Talent Pool</DialogTitle>
                <DialogDescription>Group high-potential employees for succession planning</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePool} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="poolName">Pool Name *</Label>
                  <Input id="poolName" name="poolName" placeholder="e.g., Executive Leadership Pipeline" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poolDescription">Description</Label>
                  <Textarea id="poolDescription" name="poolDescription" placeholder="Purpose and criteria for this talent pool" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreatePoolOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPoolMutation.isPending}>
                    Create Pool
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={createPlanOpen} onOpenChange={setCreatePlanOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Create Succession Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Succession Plan</DialogTitle>
                <DialogDescription>Define a succession strategy for a critical role</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input id="name" name="name" placeholder="e.g., CFO Succession 2026" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target Role *</Label>
                  <Input id="target" name="target" placeholder="Role being planned for" required />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreatePlanOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPlanMutation.isPending}>
                    Create Plan
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.filter((p: any) => p.status === 'ACTIVE').length}</div>
            <p className="text-xs text-muted-foreground">Key roles covered</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Talent Pools</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pools.length}</div>
            <p className="text-xs text-muted-foreground">High potential groups</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.reduce((sum: number, p: any) => sum + (p.candidateCount || 0), 0)}</div>
            <p className="text-xs text-muted-foreground">Identified successors</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Analysis</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.filter((p: any) => p.candidateCount === 0).length}</div>
            <p className="text-xs text-muted-foreground">Plans without candidates</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Succession Plans</TabsTrigger>
          <TabsTrigger value="pools">Talent Pools</TabsTrigger>
          <TabsTrigger value="matrix">9-Box Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {plans.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No active succession plans found. Create one to get started.</Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan: any) => (
                <Card key={plan.id} className="cursor-pointer hover:border-indigo-200 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'}>{plan.status}</Badge>
                    </div>
                    <CardDescription>Target: {plan.targetJobId || "General Leadership"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Review Date</span>
                        <span className="font-medium">{plan.reviewDate ? new Date(plan.reviewDate).toLocaleDateString() : 'Not set'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Candidates</span>
                        <span className="font-medium">{plan.candidateCount || 0} Identified</span>
                      </div>
                      <div className="pt-2">
                        <Button
                          variant="ghost"
                          className="w-full h-8 text-xs"
                          onClick={() => setCandidateModal({ isOpen: true, planId: plan.id, planName: plan.name })}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Manage Candidates
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pools" className="space-y-4">
          {pools.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No talent pools defined. Create one to organize high-potential talent.</Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pools.map((pool: any) => (
                <Card key={pool.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{pool.name}</CardTitle>
                      <Badge variant={pool.status === "ACTIVE" ? "default" : "secondary"}>{pool.status}</Badge>
                    </div>
                    <CardDescription>{pool.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Members</span>
                      <span className="text-2xl font-bold text-indigo-600">{pool.memberCount || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Talent 9-Box Matrix</CardTitle>
              <CardDescription>
                Drag and drop candidates to position them based on performance and potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NineBoxMatrix
                candidates={candidates}
                plans={plans}
                onPositionChange={(candidateId, position) => {
                  updatePositionMutation.mutate({ candidateId, nineBoxPosition: position });
                }}
                onAutoPosition={(candidateId) => {
                  autoPositionMutation.mutate(candidateId);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Candidate Management Modal */}
      <Dialog open={candidateModal.isOpen} onOpenChange={(open) => !open && setCandidateModal({ isOpen: false })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Candidates - {candidateModal.planName}</DialogTitle>
            <DialogDescription>Add and review succession candidates for this role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Current Candidates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Current Candidates</h4>
                {selectedCandidates.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setComparisonModal(true)}
                  >
                    Compare Selected ({selectedCandidates.length})
                  </Button>
                )}
              </div>
              {candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No candidates assigned yet</p>
              ) : (
                <div className="space-y-2">
                  {candidates.map((cand: any) => (
                    <Card key={cand.id} className="p-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedCandidates.includes(cand.id)}
                          onCheckedChange={(checked) => {
                            setSelectedCandidates(prev =>
                              checked
                                ? [...prev, cand.id]
                                : prev.filter(id => id !== cand.id)
                            );
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{cand.personName}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{cand.readiness}</Badge>
                            <Badge variant="outline">{cand.potential} Potential</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Last assessed: {cand.lastAssessment ? new Date(cand.lastAssessment).toLocaleDateString() : 'Never'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => setAssessmentDialog({ isOpen: true, candidate: cand })}
                          >
                            Assess
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => setRemoveDialog({ isOpen: true, candidate: cand })}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Candidate Form */}
            <div className="border-t pt-4">
              <form onSubmit={handleAddCandidate} className="space-y-4">
                <h4 className="font-medium">Add New Candidate</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="personId">Employee ID *</Label>
                    <Input id="personId" name="personId" placeholder="e.g., EMP-101" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="readiness">Readiness *</Label>
                    <Select name="readiness" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select readiness" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ready Now">Ready Now</SelectItem>
                        <SelectItem value="1-2 Years">1-2 Years</SelectItem>
                        <SelectItem value="2-3 Years">2-3 Years</SelectItem>
                        <SelectItem value="3+ Years">3+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="potential">Potential Level *</Label>
                    <Select name="potential" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select potential" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={addCandidateMutation.isPending}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Candidate
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Candidate Dialog */}
      <RemoveCandidateDialog
        isOpen={removeDialog.isOpen}
        onClose={() => setRemoveDialog({ isOpen: false, candidate: null })}
        candidate={removeDialog.candidate}
        onConfirm={() => {
          if (removeDialog.candidate) {
            removeCandidateMutation.mutate(removeDialog.candidate.id);
          }
        }}
        isLoading={removeCandidateMutation.isPending}
      />

      {/* Candidate Comparison Modal */}
      <CandidateComparisonModal
        isOpen={comparisonModal}
        onClose={() => {
          setComparisonModal(false);
          setSelectedCandidates([]);
        }}
        candidates={candidates.filter((c: any) => selectedCandidates.includes(c.id))}
      />

      {/* Readiness Assessment Dialog */}
      <ReadinessAssessmentDialog
        isOpen={assessmentDialog.isOpen}
        onClose={() => setAssessmentDialog({ isOpen: false, candidate: null })}
        candidate={assessmentDialog.candidate}
        onSubmit={(assessment) => assessCandidateMutation.mutate(assessment)}
        isLoading={assessCandidateMutation.isPending}
      />
    </StandardPage>
  );
}
