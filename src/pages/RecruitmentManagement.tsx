import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users2, Plus, Trash2, Calendar, Download } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InterviewScheduler } from "@/components/recruitment/InterviewScheduler";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export default function RecruitmentManagement() {
  const { toast } = useToast();
  const [newJob, setNewJob] = useState({ title: "", department: "Engineering", stage: "open" });
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [schedulerModal, setSchedulerModal] = useState<{
    isOpen: boolean;
    applicationId?: string;
    candidateName?: string;
    jobTitle?: string;
  }>({ isOpen: false });

  const { legalEntityId, businessUnitId } = useEnterpriseStore();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["/api/recruitment/jobs", page, legalEntityId], // Add deps to re-fetch on switch
    queryFn: () => fetch(`/api/recruitment/jobs?limit=${pageSize}&offset=${page * pageSize}`, {
      headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined
    }).then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/recruitment/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(legalEntityId ? { "x-legal-entity-id": legalEntityId } : {})
      },
      body: JSON.stringify({ ...data, entLegalEntityId: legalEntityId, entBusinessUnitId: businessUnitId })
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recruitment/jobs"] });
      setNewJob({ title: "", department: "Engineering", stage: "open" });
      toast({ title: "Job posted" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/recruitment/jobs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recruitment/jobs"] });
      toast({ title: "Job deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users2 className="h-8 w-8" />
          Recruitment Management
        </h1>
        <p className="text-muted-foreground mt-2">Manage job openings and candidates</p>
      </div>

      <Card data-testid="card-post-job">
        <CardHeader><CardTitle className="text-base">Post New Job</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Job title" value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} data-testid="input-title" />
            <Select value={newJob.department} onValueChange={(v) => setNewJob({ ...newJob, department: v })}>
              <SelectTrigger data-testid="select-department"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newJob.stage} onValueChange={(v) => setNewJob({ ...newJob, stage: v })}>
              <SelectTrigger data-testid="select-stage"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={createMutation.isPending || !newJob.title} className="w-full" data-testid="button-create-job">
            <Plus className="w-4 h-4 mr-2" /> Post Job
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Open Positions</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Applicants</p><p className="text-2xl font-bold">35</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">In Interview</p><p className="text-2xl font-bold text-blue-600">15</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Offers Made</p><p className="text-2xl font-bold text-green-600">2</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Active Openings</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={jobs.length < pageSize}>Next</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : jobs.length === 0 ? <p className="text-muted-foreground text-center py-4">No open positions</p> : jobs.map((job: any) => (
            <div key={job.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`job-${job.id}`}>
              <div>
                <Link href={`/hr/recruitment/requisitions/${job.id}`}>
                  <h3 className="font-semibold cursor-pointer hover:underline text-primary">{job.title}</h3>
                </Link>
                <p className="text-sm text-muted-foreground">Dept: {job.department || job.dept} • Applicants: {job.applicants || 0}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => {
                    setSchedulerModal({
                      isOpen: true,
                      applicationId: `mock-app-${job.id}`,
                      candidateName: "Mock Candidate",
                      jobTitle: job.title
                    });
                  }}>
                    <Calendar className="w-3 h-3 mr-1" />
                    Schedule Interview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    // Demo Apply Action
                    fetch("/api/recruitment/applications", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        requisitionId: job.id,
                        candidateId: "mock-candidate-id",
                        status: "APPLIED"
                      })
                    }).then(() => toast({ title: "Applied successfully (Mock Candidate)" }));
                  }}>
                    Mock Apply
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="outline">{job.stage}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${job.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Interview Scheduler Modal */}
      <InterviewScheduler
        isOpen={schedulerModal.isOpen}
        onClose={() => setSchedulerModal({ isOpen: false })}
        applicationId={schedulerModal.applicationId || ''}
        candidateName={schedulerModal.candidateName}
        jobTitle={schedulerModal.jobTitle}
      />
    </div>
  );
}
