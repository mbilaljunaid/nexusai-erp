import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";
import { format } from "date-fns";

interface OnboardingTask {
    id: string;
    taskName: string;
    assignee: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE';
    dueDate: string;
}

interface OnboardingHire {
    id: string;
    employeeName: string;
    position: string;
    department: string;
    hireDate: string;
    tasks: OnboardingTask[];
}

export default function OnboardingTracker() {
    const queryClient = useQueryClient();
    const [filterStatus, setFilterStatus] = useState('ALL');

    const { data: hires = [], isLoading } = useQuery<OnboardingHire[]>({
        queryKey: ['/api/recruitment/onboarding/progress'],
        queryFn: async () => {
            const res = await fetch('/api/recruitment/onboarding/progress');
            if (!res.ok) {
                // Mock data for development
                return [
                    {
                        id: 'hire-1',
                        employeeName: 'Alice Johnson',
                        position: 'Senior Software Engineer',
                        department: 'Engineering',
                        hireDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        tasks: [
                            { id: 'task-1', taskName: 'Complete HR paperwork', assignee: 'HR Team', status: 'COMPLETE', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
                            { id: 'task-2', taskName: 'Setup workstation', assignee: 'IT Team', status: 'COMPLETE', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
                            { id: 'task-3', taskName: 'Meet with manager', assignee: 'Manager', status: 'COMPLETE', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
                            { id: 'task-4', taskName: 'Complete security training', assignee: 'Employee', status: 'IN_PROGRESS', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
                            { id: 'task-5', taskName: 'Setup development environment', assignee: 'Employee', status: 'PENDING', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() }
                        ]
                    },
                    {
                        id: 'hire-2',
                        employeeName: 'Bob Martinez',
                        position: 'Product Manager',
                        department: 'Product',
                        hireDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        tasks: [
                            { id: 'task-6', taskName: 'Complete HR paperwork', assignee: 'HR Team', status: 'COMPLETE', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() },
                            { id: 'task-7', taskName: 'Setup workstation', assignee: 'IT Team', status: 'IN_PROGRESS', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() },
                            { id: 'task-8', taskName: 'Product roadmap review', assignee: 'Manager', status: 'PENDING', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() }
                        ]
                    }
                ];
            }
            return res.json();
        }
    });

    const updateTaskMutation = useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
            const res = await fetch(`/api/recruitment/onboarding/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Failed to update task');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/recruitment/onboarding/progress'] });
            toast({ title: 'Task Updated', description: 'Onboarding task status updated successfully' });
        },
        onError: () => {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update task' });
        }
    });

    const calculateProgress = (tasks: OnboardingTask[]) => {
        const completedCount = tasks.filter(t => t.status === 'COMPLETE').length;
        return Math.round((completedCount / tasks.length) * 100);
    };



    const isOverdue = (dueDate: string, status: string) => {
        if (status === 'COMPLETE') return false;
        return new Date(dueDate) < new Date();
    };

    const filteredHires = hires.filter(hire => {
        if (filterStatus === 'ALL') return true;
        if (filterStatus === 'IN_PROGRESS') {
            const progress = calculateProgress(hire.tasks);
            return progress > 0 && progress < 100;
        }
        if (filterStatus === 'COMPLETED') {
            return calculateProgress(hire.tasks) === 100;
        }
        if (filterStatus === 'OVERDUE') {
            return hire.tasks.some(t => isOverdue(t.dueDate, t.status));
        }
        return true;
    });

    const getTaskColumns = (): SpreadsheetColumn[] => [
        {
            id: "taskName",
            header: "Task",
            width: "300px",
            cell: (row) => <div className="px-2 text-sm text-left">{row.taskName}</div>
        },
        {
            id: "assignee",
            header: "Assignee",
            width: "150px",
            cell: (row) => <div className="px-2 text-sm text-left">{row.assignee}</div>
        },
        {
            id: "dueDate",
            header: "Due Date",
            width: "150px",
            cell: (row) => (
                <div className={`px-2 text-sm text-left ${isOverdue(row.dueDate, row.status) ? 'text-red-600 font-semibold' : ''}`}>
                    {format(new Date(row.dueDate), "MMM d, yyyy")}
                    {isOverdue(row.dueDate, row.status) && ' (Overdue)'}
                </div>
            )
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (row) => <div className="px-2"><StatusBadge status={row.status} /></div>
        },
        {
            id: "action",
            header: "Action",
            width: "150px",
            cell: (row) => (
                <div className="px-2">
                    {row.status !== 'COMPLETE' && (
                        <Select
                            value={row.status}
                            onValueChange={(value) => updateTaskMutation.mutate({ taskId: row.id, status: value })}
                        >
                            <SelectTrigger className="w-full h-8 px-2 border-0 shadow-none bg-transparent hover:bg-muted/50 transition-colors">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="COMPLETE">Complete</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            )
        }
    ];

    return (
        <StandardPage title="Onboarding Tracker">
            <div>

                <p className="text-muted-foreground mt-2">
                    Monitor new hire onboarding progress and tasks
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold">{hires.length}</p>
                                <p className="text-sm text-muted-foreground">Active Hires</p>
                            </div>
                            <User className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold">
                                    {hires.filter(h => calculateProgress(h.tasks) > 0 && calculateProgress(h.tasks) < 100).length}
                                </p>
                                <p className="text-sm text-muted-foreground">In Progress</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold">
                                    {hires.filter(h => calculateProgress(h.tasks) === 100).length}
                                </p>
                                <p className="text-sm text-muted-foreground">Completed</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold">
                                    {hires.reduce((sum, h) => sum + h.tasks.filter(t => isOverdue(t.dueDate, t.status)).length, 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <Label htmlFor="filter">Filter by Status:</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="filter" className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Hires</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="OVERDUE">With Overdue Tasks</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Onboarding Hires */}
            <div className="space-y-4">
                {isLoading ? (
                    <TableSkeleton rows={4} />
                ) : filteredHires.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No onboarding hires found</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredHires.map(hire => {
                        const progress = calculateProgress(hire.tasks);
                        const overdueCount = hire.tasks.filter(t => isOverdue(t.dueDate, t.status)).length;

                        return (
                            <Card key={hire.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{hire.employeeName}</CardTitle>
                                            <CardDescription>
                                                {hire.position} • {hire.department} • Hired {format(new Date(hire.hireDate), "MMM d, yyyy")}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold">{progress}%</span>
                                                {progress === 100 ? (
                                                    <StatusBadge status="active" label="Complete" />
                                                ) : (
                                                    <Badge variant="secondary">In Progress</Badge>
                                                )}
                                            </div>
                                            {overdueCount > 0 && (
                                                <Badge variant="destructive" className="mt-1">
                                                    {overdueCount} Overdue
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <Progress value={progress} className="mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <div className="border rounded-lg overflow-hidden h-[300px]">
                                        <InteractiveSpreadsheet
                                            data={hire.tasks}
                                            columns={getTaskColumns()}
                                            containerHeight="300px"
                                            virtualized={true}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </StandardPage>
    );
}

function Label({ htmlFor, children, className }: { htmlFor?: string; children: React.ReactNode; className?: string }) {
    return <label htmlFor={htmlFor} className={`text-sm font-medium ${className}`}>{children}</label>;
}
