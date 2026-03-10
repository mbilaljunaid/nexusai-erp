import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ArrowLeft, User, Mail, Phone, Star, FileText, Calendar, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";

const SEED_CANDIDATE = {
    id: "CAND-001",
    firstName: "Maya", lastName: "Thompson",
    email: "maya.thompson@email.com", phone: "+1 512-555-0182",
    currentTitle: "Senior Software Engineer", currentCompany: "TechCorp Ltd",
    location: "Austin, TX", yearsExperience: 7,
    source: "LinkedIn", appliedDate: "2026-02-20", status: "Interview",
    resumeSummary: "Results-driven senior software engineer with 7 years of experience in full-stack development, cloud architecture, and agile delivery. Proven track record of leading cross-functional teams and delivering scalable products.",
    skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "System Design"],
    applications: [
        { id: "APP-001", jobRequisitionId: "REQ-2026-042", jobTitle: "Lead Frontend Engineer", stage: "Technical Interview", stageDate: "2026-03-01", interviewer: "James Chen" },
    ],
    interviewScores: [
        { id: "SCR-001", round: "Phone Screen", score: 4.2, maxScore: 5, interviewer: "HR Team", date: "2026-02-25", notes: "Strong communication, good product thinking" },
        { id: "SCR-002", round: "Technical", score: 4.5, maxScore: 5, interviewer: "James Chen", date: "2026-03-01", notes: "Excellent React depth, strong system design" },
    ],
    education: [
        { degree: "B.Sc. Computer Science", institution: "UT Austin", year: 2019 },
    ]
};

export default function CandidateProfile() {
    const [, params] = useRoute("/hr/recruitment/candidates/:id");
    const candidateId = (params as any)?.id;
    const [, setLocation] = useLocation();

    const { data: candidateData, isLoading } = useQuery<any>({
        queryKey: [`/api/recruitment/candidates/${candidateId}`],
        queryFn: () => fetch(`/api/recruitment/candidates/${candidateId}`).then(r => r.json()),
        enabled: !!candidateId,
    });
    const candidate = candidateData || SEED_CANDIDATE;

    if (isLoading) return <PageSkeleton />;

    const overallScore = candidate.interviewScores?.length
        ? (candidate.interviewScores.reduce((s: number, sc: any) => s + sc.score, 0) / candidate.interviewScores.length).toFixed(1) : "N/A";

    return (
        <StandardPage
            title={`${candidate.firstName} ${candidate.lastName}`}
            description={`${candidate.currentTitle} at ${candidate.currentCompany} · ${candidate.location}`}
            breadcrumbs={[
                { label: "HR", href: "/hr" },
                { label: "Recruitment", href: "/hr/recruitment" },
                { label: "Candidates" },
                { label: `${candidate.firstName} ${candidate.lastName}` }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setLocation("/hr/recruitment")}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">Advance to Next Stage</Button>
                    <Button variant="outline" className="text-red-600 border-red-200">Reject</Button>
                </div>
            }
        >
            {/* Header Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                                {candidate.firstName[0]}{candidate.lastName[0]}
                            </div>
                            <div>
                                <CardTitle className="text-lg">{candidate.firstName} {candidate.lastName}</CardTitle>
                                <p className="text-sm text-muted-foreground">{candidate.currentTitle}</p>
                                <StatusBadge status={candidate.status} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{candidate.email}</div>
                        <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{candidate.phone}</div>
                        <div className="flex items-center gap-2 text-sm"><Briefcase className="h-4 w-4 text-muted-foreground" />{candidate.yearsExperience} years experience</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex gap-2 items-center"><Star className="h-4 w-4 text-amber-500" />Overall Score</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{overallScore}<span className="text-base text-muted-foreground">/5</span></div>
                        <p className="text-xs text-muted-foreground">{candidate.interviewScores?.length} rounds completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Source</CardTitle></CardHeader>
                    <CardContent>
                        <Badge variant="outline" className="font-medium">{candidate.source}</Badge>
                        <p className="text-xs text-muted-foreground mt-2">Applied {formatDate(candidate.appliedDate)}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="profile">
                <TabsList>
                    <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Profile</TabsTrigger>
                    <TabsTrigger value="interviews"><Star className="h-4 w-4 mr-2" />Interview Scores</TabsTrigger>
                    <TabsTrigger value="applications"><FileText className="h-4 w-4 mr-2" />Applications</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                        <CardContent><p className="text-sm leading-relaxed">{candidate.resumeSummary}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {candidate.skills?.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Education</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {candidate.education?.map((e: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="font-medium">{e.degree}</span>
                                    <span className="text-muted-foreground">{e.institution} · {e.year}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="interviews" className="mt-4 space-y-4">
                    {candidate.interviewScores?.map((sc: any) => (
                        <Card key={sc.id}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">{sc.round}</CardTitle>
                                        <CardDescription>{sc.interviewer} · {formatDate(sc.date)}</CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-amber-600">{sc.score}<span className="text-sm text-muted-foreground">/{sc.maxScore}</span></div>
                                        <div className="flex gap-0.5 mt-1">
                                            {[1, 2, 3, 4, 5].map(n => <Star key={n} className={`h-4 w-4 ${n <= Math.round(sc.score) ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />)}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent><p className="text-sm text-muted-foreground">{sc.notes}</p></CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="applications" className="mt-4 space-y-4">
                    {candidate.applications?.map((app: any) => (
                        <Card key={app.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">{app.jobTitle}</CardTitle>
                                        <CardDescription>Req #{app.jobRequisitionId} · Interviewer: {app.interviewer}</CardDescription>
                                    </div>
                                    <StatusBadge status={app.stage} />
                                </div>
                            </CardHeader>
                            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" /> Stage updated {formatDate(app.stageDate)}
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
