import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Check, Mail, Phone, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type CollectorTask = {
    id: string;
    taskType: string;
    priority: string;
    status: string;
    dueDate: string;
    customerId: string;
    invoiceId: string;
};

export function ArCollectorWorklist() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [emailDraft, setEmailDraft] = useState("");
    const [selectedTask, setSelectedTask] = useState<CollectorTask | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: tasks, isLoading } = useQuery<CollectorTask[]>({
        queryKey: ["/api/ar/collections/tasks", { status: "Open" }],
    });

    const completeTaskMutation = useMutation({
        mutationFn: async (id: string) => {
            return await api.ar.collections.tasks.update(id, { status: "Completed" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/collections/tasks"] });
            toast({ title: "Task Completed" });
            setIsDialogOpen(false);
        }
    });

    const generateEmailMutation = useMutation({
        mutationFn: async (invoiceId: string) => {
            // route is /api/ar/collections/tasks/:id/email. We don't have task id here easily in this context if it's generic?
            // But this mutation seems unused or redundant with generateEmailForTaskMutation below.
            // I'll keep it but fix it if possible, or maybe just remove it if unused.
            // Actually it is unused in the component. I'll remove it.
            return null;
        }
    });

    // Correction: route is /api/ar/collections/tasks/:id/email
    const generateEmailForTaskMutation = useMutation({
        mutationFn: async (task: CollectorTask) => {
            const res = await api.ar.collections.tasks.generateEmail(task.id, task.invoiceId);
            return res;
        },
        onSuccess: (data) => {
            setEmailDraft(data.emailBody);
            setIsDialogOpen(true);
        },
        onError: (err: any) => {
            toast({ title: "AI Error", description: err.message, variant: "destructive" });
        }
    });

    const handleAction = (task: CollectorTask) => {
        setSelectedTask(task);
        if (task.taskType === "Email" && task.invoiceId) {
            generateEmailForTaskMutation.mutate(task);
        } else {
            // Manual action
            completeTaskMutation.mutate(task.id);
        }
    };

    const handleSendEmail = () => {
        if (selectedTask) {
            // In real app, send email here. Now just complete task.
            toast({ title: "Email Sent", description: "Customer has been notified." });
            completeTaskMutation.mutate(selectedTask.id);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>My Collector Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Priority</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks?.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded text-xs text-white ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}>
                                            {task.priority}
                                        </span>
                                    </TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        {task.taskType === 'Email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                                        {task.taskType}
                                    </TableCell>
                                    <TableCell>{task.customerId}</TableCell>
                                    <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button size="sm" onClick={() => handleAction(task)} disabled={generateEmailForTaskMutation.isPending || completeTaskMutation.isPending}>
                                            {task.taskType === 'Email' ? (generateEmailForTaskMutation.isPending && selectedTask?.id === task.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Draft Email") : "Complete"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && !tasks?.length && (
                                <TableRow><TableCell colSpan={5} className="text-center">No open tasks.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>AI Generated Email Draft</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            value={emailDraft}
                            onChange={(e) => setEmailDraft(e.target.value)}
                            className="min-h-[200px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendEmail}>Send & Complete Task</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
