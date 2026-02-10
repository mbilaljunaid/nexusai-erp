import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { i18n } from "@/lib/i18n";
import {
    Clock,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Save,
    Send,
    AlertCircle,
    Info,
    Plus,
    History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TimeEntry {
    id?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    durationMinutes: number;
    timeType: string;
    notes?: string;
}

interface Timesheet {
    id: string;
    status: string;
    totalHours: string;
    totalOvertime: string;
    entries: TimeEntry[];
}

interface Period {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
}

interface LeaveBalance {
    leaveType: string;
    balanceHours: string;
}

export default function MyTimeCard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

    // Queries
    const { data: periods, isLoading: periodsLoading } = useQuery<Period[]>({
        queryKey: ["/api/hr-self-service/me/time-periods"],
    });

    // Set initial period
    React.useEffect(() => {
        if (periods && periods.length > 0 && !selectedPeriodId) {
            setSelectedPeriodId(periods[0].id);
        }
    }, [periods, selectedPeriodId]);

    const { data: timesheet, isLoading: sheetLoading } = useQuery<Timesheet>({
        queryKey: [`/api/hr-self-service/me/timesheets`, { periodId: selectedPeriodId }],
        enabled: !!selectedPeriodId,
    });

    const { data: balances } = useQuery<LeaveBalance[]>({
        queryKey: ["/api/hr-self-service/me/absences/balances"],
    });

    const { data: history } = useQuery<any[]>({
        queryKey: ["/api/hr-self-service/me/absences/history"],
    });

    // Mutations
    const logTimeMutation = useMutation({
        mutationFn: async (entry: Partial<TimeEntry>) => {
            const res = await fetch(`/api/hr-self-service/me/timesheets/${timesheet?.id}/entries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry),
            });
            if (!res.ok) throw new Error("Failed to log time");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/hr-self-service/me/timesheets`] });
            toast({ title: "Success", description: "Time entry saved successfully." });
        },
    });

    // Columns for Time Grid
    const columns: Column<TimeEntry>[] = [
        {
            header: "Date",
            accessorKey: "date",
            cell: (item) => (
                <div className="font-medium">
                    {new Date(item.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
            )
        },
        {
            header: "Type",
            accessorKey: "timeType",
            cell: (item) => (
                <Badge variant={item.timeType === 'REGULAR' ? 'outline' : 'secondary'}>
                    {item.timeType}
                </Badge>
            )
        },
        {
            header: "Start",
            accessorKey: "startTime",
            cell: (item) => item.startTime ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"
        },
        {
            header: "End",
            accessorKey: "endTime",
            cell: (item) => item.endTime ? new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"
        },
        {
            header: "Hours",
            cell: (item) => (
                <div className="font-semibold text-primary">
                    {(item.durationMinutes / 60).toFixed(2)}h
                </div>
            )
        },
        {
            header: "Notes",
            accessorKey: "notes",
            className: "text-muted-foreground truncate max-w-[200px]"
        }
    ];

    const currentPeriod = periods?.find(p => p.id === selectedPeriodId);

    return (
        <StandardPage
            title={i18n.t('hr.time.card')}
            description="Manage your time entries, attendance, and leave requests."
            breadcrumbs={[
                { label: "Self-Service", href: "/hr/self-service/me" },
                { label: "Time Card" }
            ]}
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar: Summary & Balances */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Total Hours</span>
                                <span className="font-bold text-lg">{timesheet?.totalHours || "0.00"}h</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Overtime</span>
                                <span className="font-bold text-amber-600">{timesheet?.totalOvertime || "0.00"}h</span>
                            </div>
                            <div className="pt-2">
                                <Badge variant={timesheet?.status === 'APPROVED' ? 'default' : 'secondary'} className="w-full justify-center">
                                    {timesheet?.status || "DRAFT"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{i18n.t('hr.absence.balance')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {balances?.map((bal) => (
                                <div key={bal.leaveType} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="capitalize">{bal.leaveType.toLowerCase()}</span>
                                        <span className="font-semibold">{bal.balanceHours}h</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2 relative overflow-hidden">
                                        <div
                                            className="bg-primary h-full rounded-full transition-all duration-500"
                                            style={{ width: "var(--tw-progress-width)", "--tw-progress-width": `${Math.min(100, (Number(bal.balanceHours) / 160) * 100)}%` } as React.CSSProperties}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content: Time Grid */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-primary/20 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="space-y-1">
                                <CardTitle>Weekly Entries</CardTitle>
                                <CardDescription>
                                    Period: {currentPeriod?.name || "Loading..."}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                                    <SelectTrigger className="w-[180px]">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Select Period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periods?.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {timesheet?.status === 'DRAFT' && (
                                    <Button className="gap-2">
                                        <Send className="h-4 w-4" /> Submit
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <StandardTable
                                data={timesheet?.entries || []}
                                columns={columns}
                                isLoading={sheetLoading}
                                className="border-t pt-2"
                            />

                            {timesheet?.status === 'DRAFT' && (
                                <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-full">
                                            <Plus className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium">Add time entry for today?</span>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => logTimeMutation.mutate({
                                        date: new Date().toISOString().split('T')[0],
                                        durationMinutes: 480, // 8 hours default
                                        timeType: 'REGULAR'
                                    })}>
                                        Quick Log (8h)
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <History className="h-5 w-5 text-muted-foreground" />
                                Quick Absence History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {history?.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-1 h-8 rounded",
                                                item.hrm_time_entries.timeType === 'SICK' ? "bg-red-500" : "bg-sky-500"
                                            )} />
                                            <div>
                                                <p className="text-sm font-medium">{item.hrm_time_entries.timeType}</p>
                                                <p className="text-xs text-muted-foreground">{item.hrm_time_entries.date}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline">{(item.hrm_time_entries.durationMinutes / 60).toFixed(1)}h</Badge>
                                    </div>
                                ))}
                                {(!history || history.length === 0) && (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <Info className="h-8 w-8 mx-auto opacity-20 mb-2" />
                                        <p className="text-sm">No recent absence records found.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
