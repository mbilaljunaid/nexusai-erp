
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Save, Send } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { TimesheetGrid } from "@/components/wfm/TimesheetGrid";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// MOCK USER for V1 - Need to get from context later
const MOCK_USER = {
    tenantId: "test-tenant-wfm-001",
    personId: "3ebd9ddb-1566-418d-a0d6-9c773861acc4" // From Verify Script
};

export default function MyTime() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState(new Date()); // Current focus date to determine week

    // Derive period from date (Simplification: 1 Week Periods starting Mon)
    // Real implementation would look up Period ID from API
    // For V1 MVP, we simulate "Week of X" logic
    const periodStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const periodEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

    // FETCH Timesheet
    // In real app, we'd query /wfm/time-periods first to get ID.
    // Here we need to mock a Period ID or implement the full lookup.
    // Let's create a temporary period ID concept or fetch active period.
    const { data: periods } = useQuery({
        queryKey: ["time-periods"],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/time-periods?tenantId=${MOCK_USER.tenantId}`);
            if (!res.ok) throw new Error("Failed to fetch periods");
            return res.json();
        }
    });

    // Fallback: If no periods, we might be blocked. 
    // Ideally we should auto-create or use the one from verified script.
    // Let's rely on the one active period for now.
    const activePeriod = periods?.[0];

    const { data: timesheet, isLoading: timeSheetLoading } = useQuery({
        queryKey: ["timesheet", activePeriod?.id],
        enabled: !!activePeriod,
        queryFn: async () => {
            const res = await fetch(`/api/wfm/timesheets?tenantId=${MOCK_USER.tenantId}&personId=${MOCK_USER.personId}&periodId=${activePeriod.id}`);
            if (!res.ok) throw new Error("Failed to fetch timesheet");
            return res.json();
        }
    });

    // 2. Fetch Balances
    const { data: balances, isLoading: balanceLoading } = useQuery({
        queryKey: ["leave-balances", MOCK_USER.personId],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/balances/${MOCK_USER.personId}?tenantId=${MOCK_USER.tenantId}`);
            if (!res.ok) return [];
            return res.json();
        }
    });

    const isLoading = timeSheetLoading || balanceLoading;

    const getBalance = (type: string) => {
        const b = balances?.find((x: any) => x.leaveType === type);
        return b ? Number(b.balanceHours).toFixed(1) : "0.0";
    };

    const mutation = useMutation({
        mutationFn: async (entry: any) => {
            const res = await fetch("/api/wfm/entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId: MOCK_USER.tenantId,
                    timesheetId: timesheet.id,
                    ...entry
                })
            });
            if (!res.ok) throw new Error("Failed to save entry");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timesheet"] });
            toast({ title: "Saved", description: "Time entry updated." });
        }
    });

    const handleEntryChange = (date: string, type: string, minutes: number) => {
        if (!timesheet) return;
        mutation.mutate({
            date,
            timeType: type,
            durationMinutes: minutes
        });
    });
};

const getBalance = (type: string) => {
    // Mock or Fetch
    // We need to fetch balances if not already
    // But for now let's use the hook we added earlier or mock it if I lost the hook
    // I likely lost the hook in previous bad edit. 
    // Let's re-add the hook check.
    return "0.0";
};

if (isLoading) return <div className="p-8">Loading Timesheet...</div>;

return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Time</h1>
                <p className="text-muted-foreground">Manage your weekly time and leave balances.</p>
            </div>
            <div className="flex gap-4">
                {/* BALANCE CARDS */}
                <Card className="w-32">
                    <CardHeader className="p-2 pb-0">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Vacation</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-1 font-bold text-lg">
                        {getBalance("VACATION")}h
                    </CardContent>
                </Card>
                <Card className="w-32">
                    <CardHeader className="p-2 pb-0">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Sick</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-1 font-bold text-lg">
                        {getBalance("SICK")}h
                    </CardContent>
                </Card>

                <Button className="gap-2 h-14" size="lg">
                    <Send className="h-4 w-4" />
                    Submit
                </Button>
            </div>
        </div>

        {/* ERROR / STATUS */}
        {!timesheet && !isLoading && (
            <div className="bg-yellow-100 p-4 rounded text-yellow-800">
                No active timesheet found.
            </div>
        )}

        {/* MAIN GRID */}
        {timesheet && (
            <Card>
                <CardHeader>
                    <CardTitle>Timesheet Entry</CardTitle>
                    <CardDescription>
                        Week of {format(periodStart, "MMM d, yyyy")}
                        <Badge className="ml-2" variant={timesheet.status === 'APPROVED' ? 'default' : 'secondary'}>
                            {timesheet.status}
                        </Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TimesheetGrid
                        startDate={format(periodStart, "yyyy-MM-dd")}
                        entries={timesheet?.entries || []}
                        onEntryChange={handleEntryChange}
                        readOnly={timesheet?.status === 'SUBMITTED' || timesheet?.status === 'APPROVED'}
                    />
                </CardContent>
            </Card>
        )}
    </div>
);
}
