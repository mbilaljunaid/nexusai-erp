import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { User, MoreHorizontal, Briefcase } from "lucide-react";
import { KanbanBoard } from "@/components/ui/KanbanBoard";
import { CandidateProfileDrawer } from "./CandidateProfileDrawer";
import { StandardPage } from "@/components/layout/StandardPage";


const STAGES = ["NEW", "SCREENING", "INTERVIEW", "OFFER", "HIRED"];

export default function JobRequisitionDetail() {
    const params = useParams() as { id?: string };
    const id = params.id;
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
        <StandardPage title="Requisition {id?.substring(0, 8)}...">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground">Pipeline View</p>
                </div>
                <Button>Add Candidate</Button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 min-h-0 bg-background/50 rounded-lg">
                <KanbanBoard<any>
                    className="h-full"
                    columns={STAGES.map(s => ({
                        id: s,
                        title: s,
                        bgColor: "bg-muted/30"
                    }))}
                    items={Object.entries(pipeline || {}).flatMap(([stage, candidates]: [string, any]) =>
                        candidates.map((c: any) => ({ ...c, stage }))
                    )}
                    getColumnId={(item) => item.stage}
                    onCardClick={(item) => onCandidateClick(item)}
                    renderCard={(app) => (
                        <Card className="cursor-pointer hover-elevate">
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
                    )}
                />
            </div>

            {selectedCandidate && (
                <CandidateProfileDrawer
                    open={!!selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    candidate={selectedCandidate.candidate}
                    applicationId={selectedCandidate.id}
                />
            )}
        </StandardPage>
    );
}
