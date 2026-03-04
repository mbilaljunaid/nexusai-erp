import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StandardPage } from "@/components/layout/StandardPage";
import { Badge } from "@/components/ui/badge";
import {
    Users2,
    Search,
    MoreHorizontal,
    Mail,
    Phone,
    Calendar,
    CheckCircle2,
    Briefcase,
    TrendingUp,
    Filter,
    Clock
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED"];

export default function RecruitmentPipelineBoard() {
    const { toast } = useToast();
    const [filterDept, setFilterDept] = useState("all");

    const { data: pipeline = {}, isLoading } = useQuery({
        queryKey: ["/api/recruitment/pipeline/all"],
        queryFn: async () => {
            // In a real app we'd fetch all applications and group them,
            // but for the demo we'll use a mocked grouping.
            const res = await fetch("/api/recruitment/requisitions/all/pipeline");
            return res.json();
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const res = await fetch(`/api/recruitment/applications/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/recruitment/pipeline/all"] });
            toast({ title: "Status Updated", description: "Candidate has been moved to the new stage." });
        }
    });

    if (isLoading) return <div className="p-8">Loading Recruiting Pipeline...</div>;

    return (
        <StandardPage
            title="Global Recruitment Pipeline"
            description="Real-time candidate tracking across all active requisitions"
            className="flex-1 overflow-hidden"
            actions={
                <div className="flex gap-3">
                    <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">Post New Requisition</Button>
                </div>
            }
        >
            <div className="grid grid-cols-5 gap-4 flex-1 overflow-y-auto pb-6 -mt-2">
                {STAGES.map((stage) => {
                    const candidates = pipeline[stage] || [];
                    return (
                        <div key={stage} className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-sm tracking-tight text-slate-700 dark:text-slate-300">{stage}</h3>
                                <Badge variant="secondary" className="bg-slate-200 text-slate-700">{candidates.length}</Badge>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {candidates.map((app: any) => (
                                    <Card key={app.id} className="group cursor-pointer hover:border-blue-400 transition-all shadow-sm">
                                        <CardContent className="p-3 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm group-hover:text-blue-600 transition-colors">
                                                        {app.candidate.firstName} {app.candidate.lastName}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                        <Briefcase className="w-3 h-3" /> {app.jobTitle || "Sr. Frontend Dev"}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">
                                                        {app.score}% Match
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <div className="flex -space-x-2">
                                                    {[1, 2].map((i) => (
                                                        <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold">
                                                            {String.fromCharCode(64 + i)}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex-1" />
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6"><Mail className="w-3 h-3" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6"><Calendar className="w-3 h-3" /></Button>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2d ago</span>
                                                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-blue-500" /> V3 Score</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {candidates.length === 0 && (
                                    <div className="py-8 text-center border-2 border-dashed rounded-lg bg-slate-100/30">
                                        <p className="text-xs text-muted-foreground">No Candidates</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </StandardPage>
    );
}
