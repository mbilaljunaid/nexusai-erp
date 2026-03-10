
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StandardPage } from "@/components/layout/StandardPage";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { format, parseISO, startOfToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Save, Calendar, Check, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DatePicker } from '@/components/ui/DatePicker';
import { useNexusAI } from "@/contexts/NexusAIContext";

export default function TimekeeperConsole() {
    const { toast } = useToast();
    const { tenantId } = useNexusAI();
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState<string>(format(startOfToday(), "yyyy-MM-dd"));

    // Local State for Edited Entries
    // Map<personId, { startTime, endTime, hours, status }>
    const [edits, setEdits] = useState<Record<string, any>>({});

    // 1. Fetch Daily Status
    const { data: dailyStatus, isLoading } = useQuery<any>({
        queryKey: ["wfm-daily-status", selectedDate, tenantId],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/daily-status?tenantId=${tenantId}&date=${selectedDate}`);
            if (!res.ok) throw new Error("Failed to fetch daily status");
            return res.json();
        }
    });

    const handleEdit = (personId: string, field: string, value: string) => {
        setEdits(prev => ({
            ...prev,
            [personId]: {
                ...prev[personId],
                [field]: value
            }
        }));
    };

    const getValue = (personId: string, field: string, defaultValue: string) => {
        return edits[personId]?.[field] ?? defaultValue;
    };

    // 2. Bulk Save Mutation
    const saveMutation = useMutation({
        mutationFn: async () => {
            // Transform edits to payload
            const entries = Object.keys(edits).map(personId => ({
                personId,
                startTime: edits[personId].startTime,
                endTime: edits[personId].endTime
            })).filter(e => e.startTime && e.endTime); // Only send complete pairs

            if (entries.length === 0) return;

            const res = await fetch("/api/wfm/bulk-entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId,
                    date: selectedDate,
                    entries
                })
            });
            if (!res.ok) throw new Error("Failed to save entries");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["wfm-daily-status"] });
            setEdits({});
            toast({ title: "Saved", description: `${data?.length || 0} entries updated.` });
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    });

    return (
        <StandardPage
            title="Timekeeper Console"
            description="High-volume daily time entry."
            actions={
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 border rounded p-2 bg-background">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DatePicker className="bg-transparent text-sm focus:outline-none" value={selectedDate} onChange={v => setSelectedDate(v)} aria-label="Select Date" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Select Date</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Button onClick={() => saveMutation.mutate()} disabled={Object.keys(edits).length === 0 || saveMutation.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        {saveMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            }
        >
            <Card>
                <CardHeader>
                    <CardTitle>{format(parseISO(selectedDate), "EEEE, MMMM do, yyyy")}</CardTitle>
                    <CardDescription>
                        {dailyStatus ? `${dailyStatus.length} Employees` : "Loading..."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-48">Employee</TableHead>
                                    <TableHead className="min-w-28">Shift</TableHead>
                                    <TableHead className="w-36">In Time</TableHead>
                                    <TableHead className="w-36">Out Time</TableHead>
                                    <TableHead className="w-24 text-right">Hours</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6}><TableSkeleton rows={5} /></TableCell></TableRow>
                                ) : (
                                    dailyStatus?.map((row: any) => {
                                        const isEdited = !!edits[row.person.id];
                                        const currentStart = getValue(row.person.id, 'startTime', row.startTime);
                                        const currentEnd = getValue(row.person.id, 'endTime', row.endTime);

                                        return (
                                            <TableRow key={row.person.id} className={isEdited ? "bg-muted/10" : ""}>
                                                <TableCell className="font-medium">
                                                    {row.person.firstName} {row.person.lastName}
                                                    <div className="text-xs text-muted-foreground">{row.person.personNumber}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {row.shiftId ? (
                                                        <Badge variant="outline">{row.shiftId}</Badge> // Should check shift code if joined
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Input
                                                                    type="time"
                                                                    value={currentStart}
                                                                    onChange={e => handleEdit(row.person.id, 'startTime', e.target.value)}
                                                                    aria-label="Shift Start Time"
                                                                />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Shift Start Time</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Input
                                                                    type="time"
                                                                    value={currentEnd}
                                                                    onChange={e => handleEdit(row.person.id, 'endTime', e.target.value)}
                                                                    aria-label="Shift End Time"
                                                                />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Shift End Time</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {row.hours > 0 ? row.hours : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {isEdited && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="w-2 h-2 rounded-full bg-blue-500 mx-auto" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Unsaved changes</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
