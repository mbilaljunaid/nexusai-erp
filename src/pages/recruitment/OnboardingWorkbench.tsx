
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";


export default function OnboardingWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const { data: hires = [], isLoading } = useQuery<any>({
        queryKey: ["/api/recruitment/onboarding/progress"],
        queryFn: () => fetch("/api/recruitment/onboarding/progress").then(r => r.json())
    });

    const updateTaskMutation = useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
            const res = await fetch(`/api/recruitment/onboarding/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error("Failed to update task");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/recruitment/onboarding/progress"] });
            toast({ title: "Task Updated" });
        }
    });

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <StandardPage title="Onboarding Workbench">
            <div className="flex items-center justify-between">
                <div>
                    
                    <p className="text-muted-foreground mt-2">Track provisioning and setup for new hires.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">New Hires (This Month)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{hires.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending Tasks</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{hires.reduce((acc: number, curr: any) => acc + (curr.totalTasks - curr.completedTasks), 0)}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Onboarding Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {hires.length === 0 ? <p className="text-muted-foreground">No active onboardings.</p> : null}

                        {hires.map((hire: any) => (
                            <div key={hire.id} className="border rounded-lg overflow-hidden">
                                <div role="button" tabIndex={0}
                                    className="flex items-center justify-between p-4 bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => toggleRow(hire.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {hire.candidateName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{hire.candidateName}</h3>
                                            <p className="text-sm text-muted-foreground">{hire.jobTitle} • Starting Soon</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end gap-1 w-48">
                                            <span className="text-xs text-muted-foreground">{hire.completedTasks}/{hire.totalTasks} Tasks</span>
                                            <Progress value={hire.progress} className="h-2" />
                                        </div>
                                        {expandedRow === hire.id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                                    </div>
                                </div>

                                {expandedRow === hire.id && (
                                    <div className="p-4 bg-muted/20 border-t space-y-2">
                                        <h4 className="font-semibold text-sm mb-3">Onboarding Checklist</h4>
                                        {hire.tasks.map((task: any) => (
                                            <div key={task.id} className="flex items-center justify-between p-3 bg-background rounded border">
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn("h-6 w-6", task.status === "COMPLETED" ? "text-green-600" : "text-muted-foreground")}
                                                        onClick={() => updateTaskMutation.mutate({ taskId: task.id, status: task.status === "COMPLETED" ? "PENDING" : "COMPLETED" })}
                                                    >
                                                        {task.status === "COMPLETED" ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                                    </Button>
                                                    <span className={task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}>{task.taskName}</span>
                                                    <Badge variant="outline" className="text-xs">{task.category}</Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Assigned to: {task.assignedTo}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
