// @ts-nocheck
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; 
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { CandidateProfileDrawer } from "./CandidateProfileDrawer";
import { User, MoreHorizontal, Briefcase } from "lucide-react";

const STAGES = ["NEW", "SCREENING", "INTERVIEW", "OFFER", "HIRED"];

export default function JobRequisitionDetail() {
    const { id } = useParams();
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

    // Fetch Pipeline
    const { data: pipeline = {}, isLoading } = useQuery({
        queryKey: [`/api/recruitment/requisitions/${id}/pipeline`],
        queryFn: () => fetch(`/api/recruitment/requisitions/${id}/pipeline`).then(r => r.json())
    });

    const onCandidateClick = (app: any) => {
        setSelectedCandidate(app); // Contains candidate info nested? No, service returns { ...app, candidate }
    };

    if (isLoading) return <div className="p-8">Loading Pipeline...</div>;

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6" /> Requisition {id?.substring(0, 8)}...
                    </h1>
                    <p className="text-muted-foreground">Pipeline View</p>
                </div>
                <Button>Add Candidate</Button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-4 h-full min-w-[1000px]">
                    {STAGES.map(stage => {
                        const candidates = pipeline[stage] || [];
                        return (
                            <div key={stage} className="w-72 bg-muted/30 rounded-lg p-3 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-sm">{stage}</h3>
                                    <Badge variant="secondary">{candidates.length}</Badge>
                                </div>
                                <div className="space-y-3 overflow-y-auto flex-1">
                                    {candidates.map((app: any) => (
                                        <Card key={app.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => onCandidateClick(app)}>
                                            <CardContent className="p-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-sm">{app.candidate.firstName} {app.candidate.lastName}</p>
                                                        <p className="text-xs text-muted-foreground">{app.candidate.email}</p>
                                                    </div>
                                                    {app.score && <Badge variant="outline" className="text-[10px]">{app.score}%</Badge>}
                                                </div>
                                                <div className="mt-2 text-xs text-muted-foreground flex gap-2">
                                                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedCandidate && (
                <CandidateProfileDrawer
                    open={!!selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    candidate={selectedCandidate.candidate}
                    applicationId={selectedCandidate.id}
                />
            )}
        </div>
    );
}
