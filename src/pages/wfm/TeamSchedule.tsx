
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { AIScheduleOptimizer } from "@/components/wfm/AIScheduleOptimizer";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";


// MOCK CONSTANTS
const MOCK_TENANT_ID = "test-tenant-wfm-001";

export default function TeamSchedule() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [selectedCell, setSelectedCell] = useState<{ personId: string, date: Date } | null>(null);
    const [selectedShiftId, setSelectedShiftId] = useState<string>("");
    const [showAIOptimizer, setShowAIOptimizer] = useState(false);

    // 1. Fetch Shifts (Definitions)
    const { data: shifts } = useQuery<any>({
        queryKey: ["wfm-shifts"],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/shifts?tenantId=${MOCK_TENANT_ID}`);
            if (!res.ok) throw new Error("Failed to fetch shifts");
            return res.json();
        }
    });

    // 2. Fetch Assignments (Schedule) - In real app, filter by Manager's Team
    const { data: scheduleData, isLoading } = useQuery<any>({
        queryKey: ["wfm-team-schedule", weekStart],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/schedule/team?tenantId=${MOCK_TENANT_ID}`);
            if (!res.ok) throw new Error("Failed to fetch schedule");
            return res.json();
        }
    });

    // Helper: Build Grid Data
    // We need list of Unique Employees from schedule (or fetch team members separate)
    // V1: Extract unique persons from schedule or fallback to empty
    const uniquePersons = Array.from(new Set(scheduleData?.map((s: any) => JSON.stringify(s.person)))).map((s: any) => JSON.parse(s));

    // Day Headers
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const assignMutation = useMutation({
        mutationFn: async () => {
            if (!selectedCell || !selectedShiftId) return;
            const res = await fetch("/api/wfm/schedule/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId: MOCK_TENANT_ID,
                    personId: selectedCell.personId,
                    date: format(selectedCell.date, "yyyy-MM-dd"),
                    shiftId: selectedShiftId
                })
            });
            if (!res.ok) throw new Error("Failed to assign shift");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wfm-team-schedule"] });
            setSelectedCell(null);
            toast({ title: "Assigned", description: "Shift updated." });
        }
    });

    const getShiftForCell = (personId: string, date: Date) => {
        return scheduleData?.find((s: any) =>
            s.assignment.personId === personId &&
            isSameDay(parseISO(s.assignment.date), date)
        );
    };

    const columns: SpreadsheetColumn<any>[] = [
        {
            id: "employee",
            header: "Employee",
            width: "250px",
            cell: (person: any) => (
                <div className="font-medium p-2">
                    {person.firstName} {person.lastName}
                    <div className="text-xs text-muted-foreground">{person.personNumber}</div>
                </div>
            )
        },
        ...days.map(day => ({
            id: day.toString(),
            header: (
                <div className="text-center py-2">
                    <div className="text-sm font-medium">{format(day, "EEE")}</div>
                    <div className="text-xs text-muted-foreground">{format(day, "d")}</div>
                </div>
            ) as any,
            width: "120px",
            cell: (person: any) => {
                const assignment = getShiftForCell(person.id, day);
                return (
                    <div className="cursor-pointer h-full w-full flex items-center justify-center p-1" onClick={() => setSelectedCell({ personId: person.id, date: day })}>
                        {assignment ? (
                            <div
                                className={`text-xs font-medium px-2 py-1 rounded text-white truncate w-full text-center ts-bg-${assignment.shift.id}`}
                                title={`${assignment.shift.name} (${assignment.shift.startTime}-${assignment.shift.endTime})`}
                            >
                                {assignment.shift.code}
                            </div>
                        ) : (
                            <div className="h-full w-full rounded hover:bg-slate-100 min-h-[24px]"></div>
                        )}
                    </div>
                );
            }
        }))
    ];

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-6">
            <div className="flex justify-between items-center">
                <div>

                    <p className="text-muted-foreground">Manage shift assignments ({format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d")})</p>
                </div>
                <style>{
                    shifts?.map((s: any) => `.ts-bg-${s.id} { background-color: ${s.color}; }`).join('\n')
                }</style>
                <Button
                    onClick={() => setShowAIOptimizer(true)}
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                >
                    <Sparkles className="h-4 w-4" />
                    AI Optimize
                </Button>
            </div>

            <Card>
                <CardContent className="p-0 overflow-hidden">
                    {isLoading ? (
                        <TableSkeleton rows={6} />
                    ) : uniquePersons.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No employees found locally. Run Seed/Verification.</div>
                    ) : (
                        <InteractiveSpreadsheet
                            data={uniquePersons}
                            columns={columns}
                            virtualized={true}
                            containerHeight="500px"
                            onChange={() => { }}
                        />
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedCell} onOpenChange={(open) => !open && setSelectedCell(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Shift</DialogTitle>
                    </DialogHeader>
                    {selectedCell && (
                        <div className="space-y-4 py-4">
                            <div className="text-sm text-muted-foreground">
                                Assigning for <span className="font-medium">{format(selectedCell.date, "PPP")}</span>
                            </div>
                            <Select onValueChange={setSelectedShiftId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Shift" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shifts?.map((s: any) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ts-bg-${s.id}`}></span>
                                            {s.name} ({s.startTime}-{s.endTime})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => assignMutation.mutate()} disabled={!selectedShiftId}>Assign</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Optimizer Modal */}
            <AIScheduleOptimizer
                isOpen={showAIOptimizer}
                onClose={() => setShowAIOptimizer(false)}
                onSuccess={() => {
                    setShowAIOptimizer(false);
                    queryClient.invalidateQueries({ queryKey: ["wfm-team-schedule"] });
                }}
                tenantId={MOCK_TENANT_ID}
            />
        </div>
    );
}
