import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { StandardPage } from "@/components/layout/StandardPage";
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
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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

  const { data: jobs = [], isLoading } = useQuery<any>({
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
    <StandardPage
      title="Recruitment"
      description="Manage job openings and candidates"
    >

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

      
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm font-medium mx-4">Page {page} of {1}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(p => p + 1)} 
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

      {/* Interview Scheduler Modal */}
      <InterviewScheduler
        isOpen={schedulerModal.isOpen}
        onClose={() => setSchedulerModal({ isOpen: false })}
        applicationId={schedulerModal.applicationId || ''}
        candidateName={schedulerModal.candidateName}
        jobTitle={schedulerModal.jobTitle}
      />
    </StandardPage>
  );
}
