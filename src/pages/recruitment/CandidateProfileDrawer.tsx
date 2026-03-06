import { formatDate } from "@/lib/dateUtils";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, XCircle, FileText, User, Mail, Phone } from "lucide-react";

interface CandidateProfileDrawerProps {
    open: boolean;
    onClose: () => void;
    candidate: any;
    applicationId: string;
}

export function CandidateProfileDrawer({ open, onClose, candidate, applicationId }: CandidateProfileDrawerProps) {
    const { toast } = useToast();

    // Fetch Interviews
    const { data: interviews = [], isLoading } = useQuery<any>({
        queryKey: [`/api/recruitment/applications/${applicationId}/interviews`],
        queryFn: () => fetch(`/api/recruitment/applications/${applicationId}/interviews`).then(r => r.json()).catch(() => []),
        enabled: !!applicationId
    });

    // Schedule Interview Mutation
    const scheduleMutation = useMutation({
        mutationFn: async () => {
            // Mock schedule for V1
            const res = await fetch("/api/recruitment/interviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicationId,
                    interviewerId: "admin", // Mock current user
                    scheduledTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                    location: "Zoom",
                    status: "SCHEDULED"
                })
            });
            if (!res.ok) throw new Error("Failed to schedule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/recruitment/applications/${applicationId}/interviews`] });
            toast({ title: "Interview Scheduled", description: "Tomorrow at 10:00 AM (Mock)" });
        }
    });

    if (!candidate) return null;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-[600px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        {candidate.firstName} {candidate.lastName}
                    </SheetTitle>
                    <SheetDescription>
                        {candidate.email} • {candidate.phone}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6">
                    <Tabs defaultValue="overview">
                        <TabsList className="w-full">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="resume">Resume</TabsTrigger>
                            <TabsTrigger value="interviews">Interviews ({interviews.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4 mt-4">
                            <div className="flex gap-4">
                                <Button variant="outline" className="w-full" onClick={() => window.open(candidate.linkedinUrl, '_blank')}>
                                    LinkedIn
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => window.open(candidate.portfolioUrl, '_blank')}>
                                    Portfolio
                                </Button>
                            </div>

                            <div className="border rounded-md p-4">
                                <h4 className="font-semibold mb-2">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(candidate.skills || []).map((skill: string) => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="border rounded-md p-4 bg-muted/20">
                                <h4 className="font-semibold mb-2">AI Score</h4>
                                <div className="flex items-center gap-2">
                                    <div className="text-2xl font-bold text-blue-600">85/100</div>
                                    <p className="text-xs text-muted-foreground">Match for this role based on skills overlap.</p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="interviews" className="space-y-4 mt-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold">Interview History</h4>
                                <Button size="sm" onClick={() => scheduleMutation.mutate()}>Schedule New</Button>
                            </div>

                            {interviews.map((int: any) => (
                                <div key={int.id} className="border p-3 rounded-md flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-sm flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(int.scheduledTime)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">Location: {int.location}</p>
                                        {int.feedback && (
                                            <div className="mt-2 bg-muted p-2 rounded text-xs">
                                                "{int.feedback}" - Rating: {int.rating}/5
                                            </div>
                                        )}
                                    </div>
                                    <Badge variant={int.status === 'COMPLETED' ? 'default' : 'outline'}>{int.status}</Badge>
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>
                </div>

                <SheetFooter className="mt-8 flex gap-2">
                    <Button variant="destructive">Reject</Button>
                    <Button className="w-full bg-blue-600">Move to Offer</Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    );
}
