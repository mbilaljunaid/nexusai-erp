import { formatDateTime } from "@/lib/dateUtils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { DatePicker } from '@/components/ui/DatePicker';
import { Label } from "@/components/ui/label";



export default function InterviewScheduling() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [candidateId, setCandidateId] = useState("");

    const { data: interviews } = useQuery<any>({
        queryKey: ["/api/recruitment/interviews"],
        queryFn: () => apiRequest("GET", "/api/recruitment/interviews").then(res => res.json()),
    });

    const scheduleMutation = useMutation({
        mutationFn: (data: any) =>
            apiRequest("POST", "/api/recruitment/interviews", data),
        onSuccess: () => {
            toast({ title: "Success", description: "Interview scheduled" });
            queryClient.invalidateQueries({ queryKey: ["/api/recruitment/interviews"] });
        },
    });

    return (
        <StandardPage title="Interview Scheduling">
            <div>

                <p className="text-muted-foreground">Calendar integration and panel coordination</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Schedule Interview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium">Candidate</Label>
                        <Select value={candidateId} onValueChange={setCandidateId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select candidate" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">John Doe - Software Engineer</SelectItem>
                                <SelectItem value="2">Jane Smith - Product Manager</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">Date</Label>
                            <DatePicker className="w-full border rounded-md p-2" onChange={() => { }} />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Time</Label>
                            <Input type="time" className="w-full" />
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Interview Panel</Label>
                        <Select defaultValue="PANEL1">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PANEL1">Technical Panel</SelectItem>
                                <SelectItem value="PANEL2">Behavioral Panel</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full" onClick={() => scheduleMutation.mutate({ candidateId })}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Interview
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Interviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {interviews?.map((interview: any) => (
                        <div key={interview.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium">{interview.candidateName}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {formatDateTime(interview.scheduledTime)}
                                    </div>
                                </div>
                                <Badge>{interview.type}</Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </StandardPage>
    );
}
