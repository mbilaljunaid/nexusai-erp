import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Copy, Save, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, addDays, startOfWeek } from "date-fns";

interface BulkTimeEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    timesheetId: string;
    startDate: string; // Week start date
    tenantId: string;
}

interface TimeEntry {
    date: string;
    projectId: string;
    taskId: string;
    hours: number;
}

interface DayEntry {
    [key: string]: { // projectId-taskId as key
        hours: string;
    };
}

export function BulkTimeEntryModal({
    isOpen,
    onClose,
    onSuccess,
    timesheetId,
    startDate,
    tenantId
}: BulkTimeEntryModalProps) {
    const queryClient = useQueryClient();

    // Generate 7 days from start date
    const weekDays = useMemo(() => {
        const start = new Date(startDate);
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [startDate]);

    // State: entries[dayIndex][projectId-taskId] = { hours }
    const [entries, setEntries] = useState<DayEntry[]>(Array(7).fill(null).map(() => ({})));
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [selectedTask, setSelectedTask] = useState<string>("");

    // Mock projects - in real app, fetch from API
    const projects = [
        { id: "proj-1", name: "Project Alpha" },
        { id: "proj-2", name: "Project Beta" },
        { id: "proj-3", name: "Internal Operations" }
    ];

    const tasks = [
        { id: "task-1", projectId: "proj-1", name: "Development" },
        { id: "task-2", projectId: "proj-1", name: "Testing" },
        { id: "task-3", projectId: "proj-2", name: "Design" },
        { id: "task-4", projectId: "proj-2", name: "Documentation" },
        { id: "task-5", projectId: "proj-3", name: "Admin" }
    ];

    const filteredTasks = selectedProject
        ? tasks.filter(t => t.projectId === selectedProject)
        : [];

    const bulkSaveMutation = useMutation({
        mutationFn: async () => {
            // Convert entries to API format
            const allEntries: TimeEntry[] = [];

            entries.forEach((dayEntry, dayIndex) => {
                Object.keys(dayEntry).forEach(key => {
                    const [projectId, taskId] = key.split('-');
                    const hours = parseFloat(dayEntry[key].hours);
                    if (hours > 0) {
                        allEntries.push({
                            date: format(weekDays[dayIndex], 'yyyy-MM-dd'),
                            projectId,
                            taskId,
                            hours
                        });
                    }
                });
            });

            if (allEntries.length === 0) {
                throw new Error("No entries to save");
            }

            const res = await fetch("/api/wfm/bulk-entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId,
                    timesheetId,
                    entries: allEntries.map(e => ({
                        date: e.date,
                        timeType: "WORK",
                        durationMinutes: e.hours * 60,
                        projectId: e.projectId,
                        taskId: e.taskId
                    }))
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to save entries");
            }

            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Bulk Entries Saved",
                description: `Successfully saved time entries for the week`
            });
            queryClient.invalidateQueries({ queryKey: ["timesheet"] });
            onSuccess();
            onClose();
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: error.message
            });
        }
    });

    const handleHoursChange = (dayIndex: number, key: string, value: string) => {
        const newEntries = [...entries];
        newEntries[dayIndex] = {
            ...newEntries[dayIndex],
            [key]: { hours: value }
        };
        setEntries(newEntries);
    };

    const addRow = () => {
        if (!selectedProject || !selectedTask) {
            toast({
                variant: "destructive",
                title: "Selection Required",
                description: "Please select a project and task first"
            });
            return;
        }

        const key = `${selectedProject}-${selectedTask}`;

        // Initialize row with empty hours for all days if not exists
        const newEntries = entries.map((dayEntry, idx) => {
            if (!dayEntry[key]) {
                return { ...dayEntry, [key]: { hours: "" } };
            }
            return dayEntry;
        });

        setEntries(newEntries);
        setSelectedProject("");
        setSelectedTask("");
    };

    const copyForward = (dayIndex: number, key: string) => {
        const hours = entries[dayIndex][key]?.hours || "";
        if (!hours) return;

        const newEntries = [...entries];
        for (let i = dayIndex + 1; i < 7; i++) {
            newEntries[i] = {
                ...newEntries[i],
                [key]: { hours }
            };
        }
        setEntries(newEntries);

        toast({
            title: "Copied Forward",
            description: `${hours} hours copied to remaining days`
        });
    };

    // Get unique project-task combinations that have been added
    const activeRows = useMemo(() => {
        const keys = new Set<string>();
        entries.forEach(dayEntry => {
            Object.keys(dayEntry).forEach(key => keys.add(key));
        });
        return Array.from(keys);
    }, [entries]);

    const getRowLabel = (key: string) => {
        const [projectId, taskId] = key.split('-');
        const project = projects.find(p => p.id === projectId);
        const task = tasks.find(t => t.id === taskId);
        return `${project?.name} - ${task?.name}`;
    };

    const getTotalForDay = (dayIndex: number) => {
        return Object.values(entries[dayIndex]).reduce((sum, entry) => {
            return sum + (parseFloat(entry.hours) || 0);
        }, 0);
    };

    const getTotalForRow = (key: string) => {
        return entries.reduce((sum, dayEntry) => {
            return sum + (parseFloat(dayEntry[key]?.hours || "0") || 0);
        }, 0);
    };

    const hasValidationErrors = useMemo(() => {
        return weekDays.some((_, dayIndex) => getTotalForDay(dayIndex) > 24);
    }, [entries, weekDays]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bulk Time Entry</DialogTitle>
                    <DialogDescription>
                        Enter time for multiple projects across the week of {format(weekDays[0], 'MMM d, yyyy')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Add Row Section */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label>Project</Label>
                                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label>Task</Label>
                                    <Select value={selectedTask} onValueChange={setSelectedTask} disabled={!selectedProject}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select task" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredTasks.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={addRow} disabled={!selectedProject || !selectedTask}>
                                    Add Row
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Time Entry Grid */}
                    {activeRows.length > 0 && (
                        <div className="border rounded-lg overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-64">Project - Task</TableHead>
                                        {weekDays.map((day, idx) => (
                                            <TableHead key={idx} className="text-center min-w-28">
                                                <div>{format(day, 'EEE')}</div>
                                                <div className="text-xs font-normal text-muted-foreground">
                                                    {format(day, 'M/d')}
                                                </div>
                                            </TableHead>
                                        ))}
                                        <TableHead className="text-center">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeRows.map(key => (
                                        <TableRow key={key}>
                                            <TableCell className="font-medium text-sm">
                                                {getRowLabel(key)}
                                            </TableCell>
                                            {weekDays.map((_, dayIndex) => (
                                                <TableCell key={dayIndex} className="p-2">
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="24"
                                                            step="0.5"
                                                            value={entries[dayIndex][key]?.hours || ""}
                                                            onChange={(e) => handleHoursChange(dayIndex, key, e.target.value)}
                                                            className="w-16 text-center"
                                                            placeholder="0"
                                                        />
                                                        {dayIndex < 6 && entries[dayIndex][key]?.hours && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => copyForward(dayIndex, key)}
                                                                title="Copy forward" aria-label="Copy"
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            ))}
                                            <TableCell className="text-center font-bold">
                                                {getTotalForRow(key).toFixed(1)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-bold bg-muted/50">
                                        <TableCell>Daily Total</TableCell>
                                        {weekDays.map((_, dayIndex) => {
                                            const total = getTotalForDay(dayIndex);
                                            const isOverLimit = total > 24;
                                            return (
                                                <TableCell key={dayIndex} className={cn(`text-center ${isOverLimit ? 'text-red-600' : ''}`)}>
                                                    {total.toFixed(1)}
                                                    {isOverLimit && <AlertCircle className="inline h-3 w-3 ml-1" />}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell className="text-center">
                                            {entries.reduce((sum, dayEntry) => {
                                                return sum + Object.values(dayEntry).reduce((ds, e) => ds + (parseFloat(e.hours) || 0), 0);
                                            }, 0).toFixed(1)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {activeRows.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg">
                            <p>Add a project and task to start entering time</p>
                        </div>
                    )}

                    {hasValidationErrors && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded text-sm text-red-800 dark:text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            <span>Some days exceed 24 hours. Please adjust before saving.</span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={bulkSaveMutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => bulkSaveMutation.mutate()}
                        disabled={bulkSaveMutation.isPending || activeRows.length === 0 || hasValidationErrors}
                    >
                        {bulkSaveMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save All Entries
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
