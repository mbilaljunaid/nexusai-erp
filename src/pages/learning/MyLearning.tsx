import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Award, Clock, CheckCircle, PlayCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";


interface Enrollment {
    id: string;
    courseId: string;
    courseTitle: string;
    progress: number;
    status: "IN_PROGRESS" | "COMPLETED" | "NOT_STARTED";
    enrolledAt: string;
    completedAt?: string;
    dueDate?: string;
    category: string;
}

export default function MyLearning() {
    const { data: enrollments = [] } = useQuery<any>({
        queryKey: ["/api/learning/my-learning"],
    });

    const { data: certificates = [] } = useQuery<any>({
        queryKey: ["/api/learning/my-certificates"],
    });

    const inProgress = enrollments.filter((e: Enrollment) => e.status === "IN_PROGRESS");
    const completed = enrollments.filter((e: Enrollment) => e.status === "COMPLETED");
    const notStarted = enrollments.filter((e: Enrollment) => e.status === "NOT_STARTED");

    return (
        <StandardPage title="My Learning">
            {/* Header */}
            <div>
                
                <p className="text-muted-foreground">
                    Track your learning progress and achievements
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>In Progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{inProgress.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Completed</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{completed.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Certificates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{certificates.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Hours Learned</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {enrollments.reduce((acc: number, e: Enrollment) => acc + (e.progress / 100) * 10, 0).toFixed(1)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Learning Tabs */}
            <Tabs defaultValue="in-progress">
                <TabsList>
                    <TabsTrigger value="in-progress">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        In Progress ({inProgress.length})
                    </TabsTrigger>
                    <TabsTrigger value="not-started">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Not Started ({notStarted.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed ({completed.length})
                    </TabsTrigger>
                </TabsList>

                {/* In Progress */}
                <TabsContent value="in-progress" className="space-y-4">
                    {inProgress.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <PlayCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No courses in progress</p>
                            </CardContent>
                        </Card>
                    ) : (
                        inProgress.map((enrollment: Enrollment) => (
                            <Card key={enrollment.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle>{enrollment.courseTitle}</CardTitle>
                                            <CardDescription>
                                                Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline">{enrollment.category}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-medium">{enrollment.progress}%</span>
                                        </div>
                                        <Progress value={enrollment.progress} />
                                    </div>

                                    {enrollment.dueDate && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            Due: {new Date(enrollment.dueDate).toLocaleDateString()}
                                        </div>
                                    )}

                                    <Button className="w-full">
                                        <PlayCircle className="w-4 h-4 mr-2" />
                                        Continue Learning
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Not Started */}
                <TabsContent value="not-started" className="space-y-4">
                    {notStarted.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No courses waiting to start</p>
                            </CardContent>
                        </Card>
                    ) : (
                        notStarted.map((enrollment: Enrollment) => (
                            <Card key={enrollment.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle>{enrollment.courseTitle}</CardTitle>
                                            <CardDescription>
                                                Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary">{enrollment.category}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full">
                                        <PlayCircle className="w-4 h-4 mr-2" />
                                        Start Learning
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Completed */}
                <TabsContent value="completed" className="space-y-4">
                    {completed.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No completed courses yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        completed.map((enrollment: Enrollment) => (
                            <Card key={enrollment.id} className="border-green-200 bg-green-50/50">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle>{enrollment.courseTitle}</CardTitle>
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <CardDescription>
                                                Completed {enrollment.completedAt && new Date(enrollment.completedAt).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <Badge className="bg-green-600">{enrollment.category}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex gap-2">
                                    <Button variant="outline" className="flex-1">
                                        Review Course
                                    </Button>
                                    <Button variant="outline">
                                        <Award className="w-4 h-4 mr-2" />
                                        Certificate
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
