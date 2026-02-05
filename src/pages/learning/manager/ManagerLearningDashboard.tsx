import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, BookPlus, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ManagerLearningDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    // MOCK MANAGER ID (In real app, comes from Auth Context)
    const MANAGER_ID = "Alice";

    // Fetch Team
    const { data: team, isLoading: isTeamLoading } = useQuery({
        queryKey: ["manager-team", MANAGER_ID],
        queryFn: async () => {
            const res = await fetch(`/api/learning/manager/team?managerId=${MANAGER_ID}`);
            if (!res.ok) throw new Error("Failed to fetch team");
            return res.json();
        }
    });

    // Fetch Courses for Assignment Dropdown
    const { data: courses } = useQuery({
        queryKey: ["learning-courses"],
        queryFn: async () => {
            const res = await fetch(`/api/learning/courses`);
            if (!res.ok) throw new Error("Failed to fetch courses");
            return res.json();
        }
    });

    // Assign Mutation
    const assignMutation = useMutation({
        mutationFn: async () => {
            // 1. Get/Create Offering for "Manager Assignment" - simplifying flow
            // Fetch "Self Paced" or create new one
            const offeringRes = await fetch("/api/learning/offerings", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: selectedCourse,
                    title: "Manager Assigned",
                    startDate: new Date().toISOString()
                })
            });
            const offering = await offeringRes.json();

            const res = await fetch("/api/learning/manager/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    managerId: MANAGER_ID,
                    personId: selectedPerson,
                    offeringId: offering.id
                }),
            });
            if (!res.ok) throw new Error("Failed to assign");
            return res.json();
        },
        onSuccess: () => {
            setIsAssignOpen(false);
            toast({ title: "Learning Assigned Successfully" });
            setSelectedPerson(null);
            setSelectedCourse(null);
        },
    });

    if (isTeamLoading) return <div className="p-8">Loading Team...</div>;

    return (
        <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Team's Learning</h1>
                    <p className="text-muted-foreground mt-1">Monitor progress and assign mandatory training.</p>
                </div>
                <Button onClick={() => setIsAssignOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                    <BookPlus className="mr-2 h-4 w-4" /> Assign Learning
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {team?.map((member: any) => (
                    <Card key={member.personId} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                                <Users className="h-6 w-6 text-slate-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{member.firstName} {member.lastName}</CardTitle>
                                <CardDescription>{member.jobTitle || "Team Member"}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Worker Type:</span>
                                    <Badge variant="outline">{member.workerType}</Badge>
                                </div>
                                <Button variant="ghost" size="sm" className="w-full mt-2 border">View Learning History</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {team?.length === 0 && (
                    <div className="col-span-3 text-center p-12 text-muted-foreground">
                        No direct reports found. Ensure hierarchy is set up in Core HR.
                    </div>
                )}
            </div>

            {/* ASSIGNMENT DIALOG */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Learning to Team Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Team Member</label>
                            <Select onValueChange={setSelectedPerson}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a person..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {team?.map((m: any) => (
                                        <SelectItem key={m.personId} value={m.personId}>
                                            {m.firstName} {m.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Course</label>
                            <Select onValueChange={setSelectedCourse}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses?.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="w-full"
                            disabled={!selectedPerson || !selectedCourse}
                            onClick={() => assignMutation.mutate()}
                        >
                            Confirm Assignment
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
