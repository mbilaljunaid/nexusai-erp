
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Briefcase, MapPin, Upload } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";


export default function CareersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", resumeText: "" });

  // Fetch Public Jobs
  const { data: jobs = [], isLoading } = useQuery<any>({
    queryKey: ["/api/public/jobs"],
    queryFn: () => fetch("/api/public/jobs").then(res => res.json())
  });

  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/public/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Application failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Application Received!",
        description: `Thanks ${data.firstName}. Our AI is reviewing your profile.`
      });
      setSelectedJob(null);
      setFormData({ firstName: "", lastName: "", email: "", phone: "", resumeText: "" });
    },
    onError: () => toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
  });

  const filteredJobs = normalizeJobs(jobs).filter((j: any) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.department?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    applyMutation.mutate({ ...formData, requisitionId: selectedJob?.id });
  };

  return (
    <StandardPage title="Join Our Team">
      {/* Header */}
      <div className="bg-slate-900 text-white py-20 px-4 text-center">

        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          We are looking for talented individuals to help us build the future of enterprise software.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-5xl mx-auto w-full -mt-8 px-4">
        <Card className="shadow-lg">
          <CardContent className="p-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by job title or department..."
                className="pl-10 h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button className="h-11 px-8">Find Jobs</Button>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Grid */}
      <div className="max-w-5xl mx-auto w-full py-12 px-4 space-y-6">
        {isLoading ? <p>Loading open positions...</p> : filteredJobs.length === 0 ? <p className="text-center text-muted-foreground">No matching jobs found.</p> : (
          <div className="grid gap-4">
            {filteredJobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-md transition-all">
                <CardContent className="p-6 flex justify-between items-center sm:flex-row flex-col gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-1">{job.title}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.department || "Engineering"}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location || "Remote"}</span>
                      <Badge variant="secondary">{job.type || "Full-time"}</Badge>
                    </div>
                  </div>
                  <Button onClick={() => setSelectedJob(job)}>Apply Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Application Modal */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Please fill out the form below. For this demo, just paste your resume text.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Resume Content (Paste Text)</label>
              <Textarea
                placeholder="Paste resume text here (Skills, Experience, etc.) - Our AI will parse this!"
                className="h-40"
                value={formData.resumeText}
                onChange={e => setFormData({ ...formData, resumeText: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedJob(null)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={applyMutation.isPending}>
              {applyMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StandardPage>
  );
}

// Helper to handle potential nulls
function normalizeJobs(jobs: any) {
  if (Array.isArray(jobs)) return jobs;
  return [];
}
