import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users2, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RecruitmentManagement() {
  const { toast } = useToast();
  const [newJob, setNewJob] = useState({ title: "", department: "Engineering", stage: "open" });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["/api/recruitment/jobs"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/recruitment/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recruitment/jobs"] });
      setNewJob({ title: "", department: "Engineering", stage: "open" });
      toast({ title: "Job posted" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/recruitment/jobs/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recruitment/jobs"] });
      toast({ title: "Job deleted" });
    }
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
          <Button onClick={() => createMutation.mutate(newJob)} disabled={createMutation.isPending || !newJob.title} className="w-full" data-testid="button-create-job">
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
        <CardHeader><CardTitle className="text-base">Active Openings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : jobs.length === 0 ? <p className="text-muted-foreground text-center py-4">No open positions</p> : jobs.map((job: any) => (
            <div key={job.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`job-${job.id}`}>
              <div>
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-muted-foreground">Dept: {job.department || job.dept} • Applicants: {job.applicants || 0}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="outline">{job.stage}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(job.id)} data-testid={`button-delete-${job.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
