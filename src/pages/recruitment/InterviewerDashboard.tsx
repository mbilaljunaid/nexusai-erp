// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function InterviewerDashboard() {
    const { user } = useAuth();
    // For V1 demo, if no user is logged in, we might default to a test ID, but useUser should handle it.
    // We'll pass user.id to the query.

    const { data: schedule = [], isLoading } = useQuery({
        queryKey: ["/api/recruitment/my-interviews", user?.id],
        queryFn: () => {
            if (!user?.id) return [];
            return fetch(`/api/recruitment/my-interviews?userId=${user.id}`).then(r => r.json())
        },
        enabled: !!user?.id
    });

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Reviews & Interviews</h1>
                    <p className="text-muted-foreground mt-2">Manage your upcoming interview schedule and feedback.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* METRICS */}
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Upcoming</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{schedule.filter((i: any) => i.status === 'SCHEDULED').length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{schedule.filter((i: any) => i.status === 'COMPLETED').length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending Feedback</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{schedule.filter((i: any) => i.status === 'COMPLETED' && !i.rating).length}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Interview Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {schedule.length === 0 ? <p className="text-muted-foreground">No interviews scheduled.</p> : null}

                        {schedule.map((interview: any) => (
                            <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{interview.candidateName}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Badge variant="outline">{interview.jobTitle}</Badge>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(interview.scheduledTime).toLocaleString()}</span>
                                            {interview.location === 'Remote' && <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Remote</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={`/api/recruitment/interviews/${interview.id}/invite.ics`} download>
                                            <Download className="w-4 h-4 mr-2" />
                                            Add to Calendar
                                        </a>
                                    </Button>
                                    {interview.status === 'SCHEDULED' && (
                                        <Button size="sm">Start Interview</Button>
                                    )}
                                    {interview.status === 'COMPLETED' && (
                                        <Button variant="secondary" size="sm">View Feedback</Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
