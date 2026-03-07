import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Users2,
    Briefcase,
    Mail,
    Calendar,
    ChevronRight,
    ArrowRightCircle,
    CheckCircle2,
    Clock,
    UserCircle,
    Search,
    Filter,
    Plus,
    LayoutGrid,
    Trello
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StandardPage } from "@/components/layout/StandardPage";
import { StatusBadge } from "@/components/shared/StatusBadge";

const STAGES = ["NEW", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

const stageColors: Record<string, string> = {
    "NEW": "bg-blue-100 text-blue-700",
    "SCREENING": "bg-yellow-100 text-yellow-700",
    "INTERVIEW": "bg-purple-100 text-purple-700",
    "OFFER": "bg-orange-100 text-orange-700",
    "HIRED": "bg-green-100 text-green-700",
    "REJECTED": "bg-red-100 text-red-700",
};

export default function RecruitmentPipelineBoard() {
    const { toast } = useToast();
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    // 1. Fetch Job Requisitions
    const { data: jobs = [] } = useQuery<any>({
        queryKey: ["/api/recruitment/jobs"],
        queryFn: async () => {
            const res = await fetch("/api/recruitment/jobs");
            if (!res.ok) throw new Error("Failed to fetch jobs");
            return res.json();
        }
    });

    // 2. Fetch Pipeline for selected job
    const { data: pipeline = {}, isLoading } = useQuery<any>({
        queryKey: ["/api/recruitment/pipeline", selectedJobId],
        queryFn: async () => {
            if (!selectedJobId) return {};
            const res = await fetch(`/api/recruitment/requisitions/${selectedJobId}/pipeline`);
            if (!res.ok) throw new Error("Failed to fetch pipeline");
            return res.json();
        },
        enabled: !!selectedJobId
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const res = await fetch(`/api/recruitment/applications/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/recruitment/pipeline", selectedJobId] });
            toast({ title: "Stage Updated", description: "Candidate has been moved successfully." });
        }
    });

    const handleMove = (id: string, currentStage: string) => {
        const nextIndex = STAGES.indexOf(currentStage) + 1;
        if (nextIndex < STAGES.length - 1) { // Don't auto-move to REJECTED usually
            updateStatusMutation.mutate({ id, status: STAGES[nextIndex] });
        }
    };

    return (
        <StandardPage
            title="Recruitment Pipeline"
            description="Manage candidate flow and hiring stages"
            actions={
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md border">
                        <Briefcase className="h-4 w-4 text-slate-500" />
                        <Select value={selectedJobId || ""} onValueChange={setSelectedJobId}>
                            <SelectTrigger className="w-72 border-none bg-transparent h-7 focus:ring-0">
                                <SelectValue placeholder="Select Job Requisition" />
                            </SelectTrigger>
                            <SelectContent>
                                {jobs.map((job: any) => (
                                    <SelectItem key={job.id} value={job.id}>
                                        {job.requisitionNumber}: {job.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" size="sm" className="h-9">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                    <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Candidate
                    </Button>
                </div>
            }
        >
            <div className="flex-1 overflow-x-auto pb-4">
                {!selectedJobId ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <div className="bg-slate-100 p-6 rounded-full">
                            <Users2 className="h-12 w-12 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">No Job Selected</h2>
                            <p className="text-sm text-muted-foreground w-64 mx-auto">Select a job requisition from the header to view the hiring pipeline</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-6 h-full min-w-max pb-4">
                        {STAGES.map((stage) => {
                            const candidates = pipeline[stage] || [];
                            return (
                                <div key={stage} className="w-80 flex flex-col h-full rounded-xl bg-slate-100/50 border border-slate-200 shadow-sm">
                                    {/* Column Header */}
                                    <div className="p-4 flex items-center justify-between border-b bg-white rounded-t-xl">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(`w-2 h-2 rounded-full ${stageColors[stage].split(' ')[0]}`)} />
                                            <h3 className="font-bold text-sm tracking-wide text-slate-700">{stage}</h3>
                                        </div>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-md font-medium">
                                            {candidates.length}
                                        </Badge>
                                    </div>

                                    {/* Column Content */}
                                    <ScrollArea className="flex-1 p-3">
                                        <div className="space-y-4">
                                            {candidates.map((app: any) => (
                                                <Card key={app.id} className="group hover:shadow-md transition-all border-none shadow-sm ring-1 ring-slate-200">
                                                    <CardContent className="p-4 space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex gap-3">
                                                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                                    <AvatarFallback className="bg-blue-500/10 text-blue-700 font-bold text-xs">
                                                                        {app.candidate.firstName[0]}{app.candidate.lastName[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                                                                        {app.candidate.firstName} {app.candidate.lastName}
                                                                    </p>
                                                                    <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                                        <Clock className="w-3 h-3" />
                                                                        Applied 2d ago
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Next">
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        {app.score && (
                                                            <div className="space-y-1.5">
                                                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                                                                    <span>Fit Score</span>
                                                                    <span className="text-blue-600">{app.score}%</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000 w-[var(--tw-progress-width)]"
                                                                        style={{ "--tw-progress-width": `${app.score}%` } as React.CSSProperties}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                                            <div className="flex gap-1.5">
                                                                <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-slate-200" aria-label="Email">
                                                                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                                                                </Button>
                                                                <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-slate-200" aria-label="Calendar">
                                                                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                                                </Button>
                                                            </div>
                                                            {stage !== "HIRED" && stage !== "REJECTED" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-7 px-2 text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 gap-1.5"
                                                                    onClick={() => handleMove(app.id, stage)}
                                                                >
                                                                    Move Forward
                                                                    <ArrowRightCircle className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                            {stage === "HIRED" && (
                                                                <div className="flex items-center gap-1 h-7 px-2">
                                                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                                    <StatusBadge status="Hired" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            {candidates.length === 0 && (
                                                <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center space-y-2 opacity-50">
                                                    <LayoutGrid className="h-8 w-8 text-slate-300" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Empty</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
