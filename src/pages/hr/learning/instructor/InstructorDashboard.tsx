import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardTable, Column } from "@/components/ui/StandardTable"; // Assuming this path
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, ClipboardCheck, BookOpen } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";

export default function InstructorDashboard() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("schedule");

    // Fetch My Teaching Offerings (Mock: Assume endpoint exists or filter courses)
    // For MVP Phase 8, we might reuse `getOfferings` but filter client-side or add "my-teaching" endpoint
    // To safe time, let's mock it for now as "My Offerings" aren't explicitly in DB schema yet (instructorId is metadata)
    const { data: teachingData, isLoading } = useQuery({
        queryKey: ["/api/hr/learning/instructor/offerings"],
        queryFn: async () => {
            const res = await fetch('/api/hr-self-service/learning/instructor/offerings');
            if (!res.ok) return [];
            return res.json();
        }
    });

    const columns: Column<any>[] = [
        { header: "Session Title", accessorKey: "title", className: "font-medium" },
        { header: "Date", accessorKey: "date", cell: (item) => <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />{item.date}</div> },
        { header: "Enrolled", accessorKey: "enrolled", cell: (item) => <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />{item.enrolled} Students</div> },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge variant={item.status === 'COMPLETED' ? "secondary" : "default"}>
                    {item.status}
                </Badge>
            )
        },
        {
            header: "Actions",
            cell: (item) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast({ title: "Opening Roster", description: `Viewing students for ${item.title}` })}>
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        Attendance
                    </Button>
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title="Instructor Portal"
            description="Manage your sessions, attendance, and grading."
            breadcrumbs={[
                { label: "Learning", href: "/hr/learning/me" },
                { label: "Instructor Portal" }
            ]}
            actions={<Button>Create Session</Button>}
        >
            <div className="space-y-6">

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2</div>
                            <p className="text-xs text-muted-foreground">Next 30 days</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">23</div>
                            <p className="text-xs text-muted-foreground">Active enrollments</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">All caught up</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="schedule" className="w-full">
                    <TabsList>
                        <TabsTrigger value="schedule">My Schedule</TabsTrigger>
                        <TabsTrigger value="grading">Grading</TabsTrigger>
                    </TabsList>

                    <TabsContent value="schedule" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming & Recent Sessions</CardTitle>
                                <CardDescription>Manage attendance and view rosters for your assigned courses.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <StandardTable
                                    data={teachingData || []}
                                    columns={columns}
                                    isLoading={isLoading}
                                    filterColumn="title"
                                    filterPlaceholder="Search sessions..."
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="grading">
                        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed">
                            <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">No Pending Grading</h3>
                            <p className="text-muted-foreground">You have no assessments pending review.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPage>
    );
}
