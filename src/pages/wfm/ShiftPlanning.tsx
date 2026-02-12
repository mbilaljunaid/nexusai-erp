import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Users, Save, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ShiftPlanning() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedWeek, setSelectedWeek] = useState("2026-W07");
    const [department, setDepartment] = useState("");

    const { data: schedule } = useQuery({
        queryKey: ["/api/wfm/shift-schedule", selectedWeek, department],
        queryFn: () => apiRequest(`/api/wfm/shift-schedule?week=${selectedWeek}&department=${department}`),
        enabled: !!department,
    });

    const autoScheduleMutation = useMutation({
        mutationFn: (params: any) =>
            apiRequest("/api/wfm/auto-schedule", {
                method: "POST",
                body: JSON.stringify(params),
            }),
        onSuccess: () => {
            toast({ title: "Success", description: "Shifts auto-scheduled based on demand" });
            queryClient.invalidateQueries({ queryKey: ["/api/wfm/shift-schedule"] });
        },
    });

    const publishMutation = useMutation({
        mutationFn: (week: string) =>
            apiRequest(`/api/wfm/shift-schedule/${week}/publish`, { method: "POST" }),
        onSuccess: () => {
            toast({ title: "Success", description: "Schedule published to employees" });
            queryClient.invalidateQueries({ queryKey: ["/api/wfm/shift-schedule"] });
        },
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Shift Planning & Scheduling</h1>
                    <p className="text-muted-foreground">AI-powered workforce scheduling and optimization</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => autoScheduleMutation.mutate({ week: selectedWeek, department })}>
                        Auto-Schedule
                    </Button>
                    <Button onClick={() => publishMutation.mutate(selectedWeek)}>
                        Publish Schedule
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Week</label>
                    <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2026-W06">Week 6 (Feb 9-15)</SelectItem>
                            <SelectItem value="2026-W07">Week 7 (Feb 16-22)</SelectItem>
                            <SelectItem value="2026-W08">Week 8 (Feb 23-Mar 1)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium">Department</label>
                    <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SALES">Sales</SelectItem>
                            <SelectItem value="OPERATIONS">Operations</SelectItem>
                            <SelectItem value="CUSTOMER_SERVICE">Customer Service</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {schedule && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Total Employees</div>
                                <div className="text-3xl font-bold mt-1">{schedule.totalEmployees}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Scheduled Hours</div>
                                <div className="text-3xl font-bold mt-1">{schedule.scheduledHours}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Coverage %</div>
                                <div className="text-3xl font-bold mt-1">{schedule.coveragePercent}%</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Open Shifts</div>
                                <div className="text-3xl font-bold mt-1 text-orange-600">{schedule.openShifts}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-3 sticky left-0 bg-muted">Employee</th>
                                            <th className="text-center p-3">Mon</th>
                                            <th className="text-center p-3">Tue</th>
                                            <th className="text-center p-3">Wed</th>
                                            <th className="text-center p-3">Thu</th>
                                            <th className="text-center p-3">Fri</th>
                                            <th className="text-center p-3">Sat</th>
                                            <th className="text-center p-3">Sun</th>
                                            <th className="text-right p-3">Total Hours</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedule.employees?.map((emp: any) => (
                                            <tr key={emp.id} className="border-t">
                                                <td className="p-3 sticky left-0 bg-background font-medium">{emp.name}</td>
                                                {emp.shifts.map((shift: any, i: number) => (
                                                    <td key={i} className="p-2 text-center">
                                                        {shift ? (
                                                            <Badge variant={shift.confirmed ? "default" : "outline"}>
                                                                {shift.startTime}-{shift.endTime}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="p-3 text-right font-medium">{emp.totalHours}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
