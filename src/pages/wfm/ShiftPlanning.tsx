import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Users, Save, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";


export default function ShiftPlanning() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedWeek, setSelectedWeek] = useState("2026-W07");
    const [department, setDepartment] = useState("");

    const { data: schedule } = useQuery<any>({
        queryKey: ["/api/wfm/shift-schedule", selectedWeek, department],
        queryFn: () => apiRequest("GET", `/api/wfm/shift-schedule?week=${selectedWeek}&department=${department}`).then(res => res.json()),
        enabled: !!department,
    });

    const autoScheduleMutation = useMutation({
        mutationFn: (params: any) =>
            apiRequest("POST", "/api/wfm/auto-schedule", params),
        onSuccess: () => {
            toast({ title: "Success", description: "Shifts auto-scheduled based on demand" });
            queryClient.invalidateQueries({ queryKey: ["/api/wfm/shift-schedule"] });
        },
    });

    const publishMutation = useMutation({
        mutationFn: (week: string) =>
            apiRequest("POST", `/api/wfm/shift-schedule/${week}/publish`),
        onSuccess: () => {
            toast({ title: "Success", description: "Schedule published to employees" });
            queryClient.invalidateQueries({ queryKey: ["/api/wfm/shift-schedule"] });
        },
    });

    const renderShift = (shift: any) => shift ? (
        <Badge variant={shift.confirmed ? "default" : "outline"}>
            {shift.startTime}-{shift.endTime}
        </Badge>
    ) : <span className="text-muted-foreground">-</span>;

    const columns: SpreadsheetColumn<any>[] = [
        { id: "employee", header: "Employee", width: "200px", cell: (emp: any) => <span className="font-medium">{emp.name}</span> },
        { id: "mon", header: "Mon", width: "120px", cell: (emp: any) => renderShift(emp.shifts[0]) },
        { id: "tue", header: "Tue", width: "120px", cell: (emp: any) => renderShift(emp.shifts[1]) },
        { id: "wed", header: "Wed", width: "120px", cell: (emp: any) => renderShift(emp.shifts[2]) },
        { id: "thu", header: "Thu", width: "120px", cell: (emp: any) => renderShift(emp.shifts[3]) },
        { id: "fri", header: "Fri", width: "120px", cell: (emp: any) => renderShift(emp.shifts[4]) },
        { id: "sat", header: "Sat", width: "120px", cell: (emp: any) => renderShift(emp.shifts[5]) },
        { id: "sun", header: "Sun", width: "120px", cell: (emp: any) => renderShift(emp.shifts[6]) },
        { id: "total", header: "Total", width: "100px", cell: (emp: any) => <span className="font-bold">{emp.totalHours}</span> }
    ];

    return (
        <StandardPage title="Shift Planning & Scheduling">
            <div className="flex justify-between items-center">
                <div>
                    
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
                            <div className="border rounded-lg overflow-hidden">
                                <InteractiveSpreadsheet
                                    data={schedule.employees || []}
                                    columns={columns}
                                    virtualized={true}
                                    containerHeight="500px"
                                    onChange={() => { }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </StandardPage>
    );
}
