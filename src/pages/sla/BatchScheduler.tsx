import { formatDateTime } from "@/lib/dateUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Play, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";


export default function BatchScheduler() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [frequency, setFrequency] = useState("HOURLY");

    const { data: jobs } = useQuery<any>({
        queryKey: ["/api/sla/batch-jobs"],
        queryFn: () => apiRequest("GET", "/api/sla/batch-jobs").then(res => res.json()),
    });

    const runMutation = useMutation({
        mutationFn: (jobId: number) =>
            apiRequest("POST", `/api/sla/batch-jobs/${jobId}/run`),
        onSuccess: () => {
            toast({ title: "Success", description: "Batch job started" });
            queryClient.invalidateQueries({ queryKey: ["/api/sla/batch-jobs"] });
        },
    });

    return (
        <StandardPage title="SLA Batch Job Scheduler">
            <div>
                
                <p className="text-muted-foreground">Schedule and monitor subledger accounting batches</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Batch Jobs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {jobs?.map((job: any) => (
                        <div key={job.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-medium">{job.name}</div>
                                    <div className="text-sm text-muted-foreground">{job.description}</div>
                                </div>
                                <Badge variant={job.status === "RUNNING" ? "default" : "secondary"}>
                                    {job.status}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                                <div>
                                    <div className="text-muted-foreground">Schedule</div>
                                    <div className="font-medium">{job.schedule}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Last Run</div>
                                    <div className="font-medium">
                                        {job.lastRun ? formatDateTime(job.lastRun) : "Never"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Success Rate</div>
                                    <div className="font-medium">{job.successRate}%</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Avg Duration</div>
                                    <div className="font-medium">{job.avgDuration}s</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => runMutation.mutate(job.id)}>
                                    <Play className="h-3 w-3 mr-1" />
                                    Run Now
                                </Button>
                                <Button size="sm" variant="outline">
                                    {job.enabled ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                                    {job.enabled ? "Disable" : "Enable"}
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </StandardPage>
    );
}
