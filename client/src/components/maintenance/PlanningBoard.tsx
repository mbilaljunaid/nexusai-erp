
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { addDays, format, startOfWeek, endOfWeek } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function PlanningBoard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<"week" | "month">("week");

    // Calculate Range
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate); // For now, fixed to week view logic basically
    // Ideally use viewMode to switch logic (addDays(start, 30))

    const { data: schedule, isLoading } = useQuery({
        queryKey: ["/api/maintenance/planning/schedule", startDate.toISOString(), endDate.toISOString()],
        queryFn: () => fetch(`/api/maintenance/planning/schedule?start=${startDate.toISOString()}&end=${endDate.toISOString()}`).then(r => r.json())
    });

    const { data: workCenters } = useQuery({
        queryKey: ["/api/maintenance/work-centers"],
        queryFn: () => fetch("/api/maintenance/work-centers").then(r => r.json())
    });

    const scheduleMutation = useMutation({
        mutationFn: ({ opId, date, wcId }: any) => fetch(`/api/maintenance/operations/${opId}/schedule`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scheduledDate: date, workCenterId: wcId })
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/planning/schedule"] });
            toast({ title: "Schedule Updated" });
        }
    });

    // Helper to generate days
    const days = [];
    let d = new Date(startDate);
    while (d <= endDate) {
        days.push(new Date(d));
        d = addDays(d, 1);
    }

    if (isLoading) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;

    const getOpsForDay = (date: Date) => {
        return schedule?.scheduled.filter((op: any) =>
            new Date(op.scheduledDate).toDateString() === date.toDateString()
        ) || [];
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Planning Board</h2>
                    <p className="text-muted-foreground">Schedule operations and manage work center capacity.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(addDays(currentDate, -7))}><ChevronLeft className="h-4 w-4" /></Button>
                    <div className="flex items-center gap-2 border px-3 py-1 rounded-md bg-card">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(addDays(currentDate, 7))}><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4">
                {days.map((day, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <div className={`text-center p-2 rounded-t-lg border-b-2 font-medium ${day.toDateString() === new Date().toDateString() ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-transparent'}`}>
                            {format(day, "EEE d")}
                        </div>
                        <div className="bg-muted/20 min-h-[400px] rounded-b-lg p-2 space-y-2 border border-t-0">
                            {/* Render Cards */}
                            {getOpsForDay(day).map((op: any) => (
                                <Card key={op.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                                    <CardContent className="p-3">
                                        <div className="text-xs font-bold text-muted-foreground mb-1">{op.workOrder?.workOrderNumber}</div>
                                        <div className="text-sm font-medium leading-tight mb-2">{op.description}</div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 w-fit">
                                                {op.workCenterId ? workCenters?.find((wc: any) => wc.id === op.workCenterId)?.code : "No WC"}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {getOpsForDay(day).length === 0 && (
                                <div className="text-center text-xs text-muted-foreground py-8">No ops</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Backlog Section */}
            <Card>
                <CardHeader><CardTitle className="text-sm">Unscheduled Backlog</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {schedule?.backlog.map((op: any) => (
                            <div key={op.id} className="min-w-[200px] p-3 border rounded-md bg-card hover:bg-accent cursor-pointer group relative">
                                <div className="text-xs font-bold text-muted-foreground">{op.workOrder?.workOrderNumber}</div>
                                <div className="text-sm font-medium">{op.description}</div>

                                {/* Quick Schedule Actions (Mock Drag Drop) */}
                                <div className="hidden group-hover:flex absolute top-0 right-0 bg-white shadow-sm border rounded-bl-md">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Schedule Today"
                                        onClick={() => scheduleMutation.mutate({ opId: op.id, date: new Date().toISOString() })}
                                    >
                                        <CalendarIcon className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {schedule?.backlog.length === 0 && <div className="text-sm text-muted-foreground">No backlog items found.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
