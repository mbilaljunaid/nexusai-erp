import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users2, Plus } from "lucide-react";

export default function RecruitmentManagement() {
  const jobs = [
    { id: "j1", title: "Senior Developer", dept: "Engineering", applicants: 15, stage: "interview", target: "2025-12-15" },
    { id: "j2", title: "Product Manager", dept: "Product", applicants: 8, stage: "screening", target: "2025-12-30" },
    { id: "j3", title: "Sales Executive", dept: "Sales", applicants: 12, stage: "offer", target: "2025-12-10" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users2 className="h-8 w-8" />
          Recruitment Management
        </h1>
        <p className="text-muted-foreground mt-2">Manage job openings and candidates</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6 flex gap-2">
          <Button className="flex-1 gap-2" data-testid="button-post-job">
            <Plus className="h-4 w-4" />
            Post Job
          </Button>
          <Button className="flex-1 gap-2" data-testid="button-add-candidate">
            <Plus className="h-4 w-4" />
            Add Candidate
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
          {jobs.map((job) => (
            <div key={job.id} className="p-3 border rounded-lg hover-elevate" data-testid={`job-${job.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{job.title}</h3>
                <Badge variant="outline">{job.stage}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Dept: {job.dept} • Applicants: {job.applicants} • Target: {job.target}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
