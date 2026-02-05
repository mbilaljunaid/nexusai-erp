import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardTable, Column } from "@/components/ui/StandardTable"; // Assuming this path
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, ClipboardCheck, BookOpen } from "lucide-react";

export default function InstructorDashboard() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("schedule");

    // Fetch My Teaching Offerings (Mock: Assume endpoint exists or filter courses)
    // For MVP Phase 8, we might reuse `getOfferings` but filter client-side or add "my-teaching" endpoint
    // To safe time, let's mock it for now as "My Offerings" aren't explicitly in DB schema yet (instructorId is metadata)
    const { data: teachingData, isLoading } = useQuery({
        queryKey: ["instructor-offerings"],
        queryFn: async () => {
            // Real implement: fetch('/api/learning/instructor/offerings')
            // Mock:
            return [
                { id: "1", title: "Advanced React Patterns", date: "2025-05-20", enrolled: 15, status: "UPCOMING" },
                { id: "2", title: "Enterprise Architecture", date: "2025-06-10", enrolled: 8, status: "UPCOMING" },
                { id: "3", title: "Cybersecurity Basics", date: "2025-04-15", enrolled: 25, status: "COMPLETED" },
            ];
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
        <div className="p-8 space-y-8 bg-background min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-primary" />
                        Instructor Portal
                    </h1>
                    <p className="text-muted-foreground text-lg mt-1">Manage your sessions, attendance, and grading.</p>
                </div>
                <Button>Create Session</Button>
            </div>

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
    );
}
