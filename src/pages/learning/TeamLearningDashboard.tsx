import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Award, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";


interface TeamMember {
    id: string;
    name: string;
    enrollments: number;
    completedCourses: number;
    inProgressCourses: number;
    complianceScore: number;
}

export default function TeamLearningDashboard() {
    const { data: teamStats } = useQuery<any>({
        queryKey: ["/api/learning/team/stats"],
    });

    const { data: teamMembers = [] } = useQuery<any>({
        queryKey: ["/api/learning/team/members"],
    });

    const { data: complianceAlerts = [] } = useQuery<any>({
        queryKey: ["/api/learning/team/compliance-alerts"],
    });

    return (
        <StandardPage title="Team Learning Dashboard">
            {/* Header */}
            <div>
                
                <p className="text-muted-foreground">
                    Monitor your team's learning progress
                </p>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Team Members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{teamStats?.totalMembers || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Active Enrollments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{teamStats?.activeEnrollments || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Completed This Month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="text-3xl font-bold text-green-600">{teamStats?.completedThisMonth || 0}</div>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Avg Compliance Score</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{teamStats?.avgComplianceScore || 0}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Compliance Alerts */}
            {complianceAlerts.length > 0 && (
                <Card className="border-red-200 bg-red-500/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <CardTitle>Compliance Alerts</CardTitle>
                        </div>
                        <CardDescription>Team members requiring attention</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {complianceAlerts.map((alert: any, idx: number) => (
                            <div key={idx} className="p-3 border rounded-lg bg-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{alert.memberName}</p>
                                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                                    </div>
                                    <Badge variant="destructive">{alert.daysOverdue} days</Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Team Members */}
            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Individual learning progress</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {teamMembers.map((member: TeamMember) => (
                            <div key={member.id} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{member.name}</h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <span>{member.enrollments} enrollments</span>
                                            <span>{member.completedCourses} completed</span>
                                            <span>{member.inProgressCourses} in progress</span>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={member.complianceScore >= 80 ? "default" : "destructive"}
                                        className={member.complianceScore >= 80 ? "bg-green-600" : ""}
                                    >
                                        {member.complianceScore}% compliant
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Compliance Progress</span>
                                        <span className="font-medium">{member.complianceScore}%</span>
                                    </div>
                                    <Progress value={member.complianceScore} />
                                </div>
                            </div>
                        ))}

                        {teamMembers.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No team members found</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
