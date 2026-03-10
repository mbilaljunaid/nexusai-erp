import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Video, Phone, MapPin, User, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { InterviewFeedbackModal } from "@/components/recruitment/InterviewFeedbackModal";
import { format } from "date-fns";
import { StandardPage } from "@/components/layout/StandardPage";


interface Interview {
    id: string;
    applicationId: string;
    candidateName: string;
    jobTitle: string;
    interviewType: string;
    scheduledAt: string;
    duration: number;
    location?: string;
    meetingLink?: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    feedbackSubmitted: boolean;
}

export default function MyInterviews() {
    const [feedbackModal, setFeedbackModal] = useState<{
        isOpen: boolean;
        interviewId?: string;
        candidateName?: string;
        jobTitle?: string;
        interviewType?: string;
    }>({
        isOpen: false
    });

    const { data: interviews = [], isLoading } = useQuery<Interview[]>({
        queryKey: ['/api/recruitment/my-interviews'],
        queryFn: async () => {
            const res = await fetch('/api/recruitment/my-interviews');
            if (!res.ok) {
                // Mock data fallback for development
                return [
                    {
                        id: 'int-1',
                        applicationId: 'app-1',
                        candidateName: 'Alice Johnson',
                        jobTitle: 'Senior Software Engineer',
                        interviewType: 'VIDEO',
                        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                        duration: 60,
                        meetingLink: 'https://zoom.us/j/123456',
                        status: 'SCHEDULED' as const,
                        feedbackSubmitted: false
                    },
                    {
                        id: 'int-2',
                        applicationId: 'app-2',
                        candidateName: 'Bob Smith',
                        jobTitle: 'Product Manager',
                        interviewType: 'IN_PERSON',
                        scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        duration: 45,
                        location: 'Conference Room A',
                        status: 'COMPLETED' as const,
                        feedbackSubmitted: true
                    },
                    {
                        id: 'int-3',
                        applicationId: 'app-3',
                        candidateName: 'Carol Martinez',
                        jobTitle: 'UX Designer',
                        interviewType: 'PHONE',
                        scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        duration: 30,
                        status: 'COMPLETED' as const,
                        feedbackSubmitted: false
                    }
                ];
            }
            return res.json();
        }
    });

    const upcomingInterviews = interviews.filter(i => i.status === 'SCHEDULED');
    const pastInterviews = interviews.filter(i => i.status === 'COMPLETED' || i.status === 'CANCELLED');
    const pendingFeedback = pastInterviews.filter(i => !i.feedbackSubmitted);

    const getInterviewIcon = (type: string) => {
        switch (type) {
            case 'VIDEO': return <Video className="h-4 w-4" />;
            case 'PHONE': return <Phone className="h-4 w-4" />;
            case 'IN_PERSON': return <MapPin className="h-4 w-4" />;
            case 'PANEL': return <User className="h-4 w-4" />;
            default: return <Calendar className="h-4 w-4" />;
        }
    };

    const InterviewCard = ({ interview }: { interview: Interview }) => {
        const scheduledDate = new Date(interview.scheduledAt);
        const isPast = interview.status !== 'SCHEDULED';

        return (
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                {getInterviewIcon(interview.interviewType)}
                                <h3 className="font-semibold">{interview.candidateName}</h3>
                                <Badge variant="outline">{interview.interviewType.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{interview.jobTitle}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(scheduledDate, 'MMM d, yyyy')}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {format(scheduledDate, 'h:mm a')} ({interview.duration} min)
                                </div>
                            </div>
                            {interview.meetingLink && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto"
                                    asChild
                                >
                                    <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                                        Join Meeting →
                                    </a>
                                </Button>
                            )}
                            {interview.location && (
                                <p className="text-sm flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {interview.location}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {isPast && (
                                <>
                                    {interview.feedbackSubmitted ? (
                                        <StatusBadge status="active" label="Feedback Submitted" />
                                    ) : (
                                        <>
                                            <Badge variant="destructive">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                Feedback Pending
                                            </Badge>
                                            <Button
                                                size="sm"
                                                onClick={() => setFeedbackModal({
                                                    isOpen: true,
                                                    interviewId: interview.id,
                                                    candidateName: interview.candidateName,
                                                    jobTitle: interview.jobTitle,
                                                    interviewType: interview.interviewType
                                                })}
                                            >
                                                Provide Feedback
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}
                            {interview.status === 'SCHEDULED' && (
                                <Badge variant="outline">Scheduled</Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <StandardPage title="My Interviews">
            <div>

                <p className="text-muted-foreground mt-2">
                    Your scheduled and past interviews
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold">{upcomingInterviews.length}</p>
                                <p className="text-sm text-muted-foreground">Upcoming</p>
                            </div>
                            <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold">{pendingFeedback.length}</p>
                                <p className="text-sm text-muted-foreground">Feedback Pending</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold">{pastInterviews.length}</p>
                                <p className="text-sm text-muted-foreground">Completed</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Interviews Tabs */}
            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full md:w-auto grid-cols-3">
                    <TabsTrigger value="upcoming">
                        Upcoming ({upcomingInterviews.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                        Pending Feedback ({pendingFeedback.length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                        Past ({pastInterviews.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-3 mt-4">
                    {isLoading ? (
                        <TableSkeleton rows={4} />
                    ) : upcomingInterviews.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No upcoming interviews</p>
                            </CardContent>
                        </Card>
                    ) : (
                        upcomingInterviews.map(interview => (
                            <InterviewCard key={interview.id} interview={interview} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-3 mt-4">
                    {pendingFeedback.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>All feedback submitted!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        pendingFeedback.map(interview => (
                            <InterviewCard key={interview.id} interview={interview} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="past" className="space-y-3 mt-4">
                    {pastInterviews.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No past interviews</p>
                            </CardContent>
                        </Card>
                    ) : (
                        pastInterviews.map(interview => (
                            <InterviewCard key={interview.id} interview={interview} />
                        ))
                    )}
                </TabsContent>
            </Tabs>

            {/* Feedback Modal */}
            <InterviewFeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ isOpen: false })}
                interviewId={feedbackModal.interviewId || ''}
                candidateName={feedbackModal.candidateName}
                jobTitle={feedbackModal.jobTitle}
                interviewType={feedbackModal.interviewType}
            />
        </StandardPage>
    );
}
