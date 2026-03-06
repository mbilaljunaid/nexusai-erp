import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserCheck, UserX, Clock, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { Checkbox } from "@/components/ui/checkbox";

interface DailyStatusBoardProps {
    tenantId: string;
}

export function DailyStatusBoard({ tenantId }: DailyStatusBoardProps) {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [autoRefresh, setAutoRefresh] = useState(true);

    const { data: dailyStatus, isLoading, refetch } = useQuery({
        queryKey: ["wfm-daily-status", tenantId, selectedDate],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/daily-status?tenantId=${tenantId}&date=${selectedDate}`);
            if (!res.ok) throw new Error("Failed to fetch daily status");
            return res.json();
        },
        refetchInterval: autoRefresh ? 300000 : false // 5 minutes auto-refresh
    });

    const metrics = dailyStatus?.metrics || {
        totalScheduled: 0,
        present: 0,
        absent: 0,
        late: 0,
        onLeave: 0
    };

    const employees = dailyStatus?.employees || [];

    const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PRESENT':
                return <Badge className="bg-green-600">Present</Badge>;
            case 'LATE':
                return <Badge className="bg-yellow-600">Late</Badge>;
            case 'ABSENT':
                return <Badge variant="destructive">Absent</Badge>;
            case 'ON_LEAVE':
                return <Badge className="bg-blue-600">On Leave</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Header with Date Picker */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Daily Attendance</h2>
                    <p className="text-muted-foreground">
                        Real-time status for {format(new Date(selectedDate), 'MMMM d, yyyy')}
                    </p>
                </div>
                <div className="flex gap-3 items-center">
                    <DatePicker
                        value={selectedDate}
                        onChange={(v) => setSelectedDate(v)}
                        aria-label="Select date for attendance view"
                    />
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="autoRefresh"
                            checked={autoRefresh}
                            onCheckedChange={(checked: boolean) => setAutoRefresh(checked)}
                            className="h-4 w-4"
                            aria-label="Enable auto-refresh every 5 minutes"
                        />
                        <label htmlFor="autoRefresh" className="text-sm text-muted-foreground">
                            Auto-refresh (5 min)
                        </label>
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalScheduled}</div>
                        <p className="text-xs text-muted-foreground">Total expected</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{metrics.present}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.totalScheduled > 0
                                ? `${Math.round((metrics.present / metrics.totalScheduled) * 100)}%`
                                : '0%'
                            }
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Late</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{metrics.late}</div>
                        <p className="text-xs text-muted-foreground">Clocked in late</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent</CardTitle>
                        <UserX className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{metrics.absent}</div>
                        <p className="text-xs text-muted-foreground">Not clocked in</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                        <Briefcase className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{metrics.onLeave}</div>
                        <p className="text-xs text-muted-foreground">Approved leave</p>
                    </CardContent>
                </Card>
            </div>

            {/* Employee Status Grid */}
            <Card>
                <CardHeader>
                    <CardTitle>Employee Status</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Loading attendance data...
                        </div>
                    ) : employees.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No employees scheduled for this date
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Scheduled Shift</TableHead>
                                    <TableHead>Clock In</TableHead>
                                    <TableHead>Clock Out</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map((emp: any) => (
                                    <TableRow key={emp.personId}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(emp.firstName, emp.lastName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">
                                                        {emp.firstName} {emp.lastName}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {emp.personNumber}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{emp.department || 'N/A'}</TableCell>
                                        <TableCell>
                                            {emp.scheduledShift ? (
                                                <div className="text-sm">
                                                    <div className="font-medium">{emp.scheduledShift.name}</div>
                                                    <div className="text-muted-foreground">
                                                        {emp.scheduledShift.startTime} - {emp.scheduledShift.endTime}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Not scheduled</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {emp.actualClockIn ? (
                                                <span className={emp.isLate ? 'text-yellow-600 font-medium' : ''}>
                                                    {emp.actualClockIn}
                                                    {emp.isLate && ' (Late)'}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {emp.actualClockOut ? (
                                                <span>{emp.actualClockOut}</span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(emp.status)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
