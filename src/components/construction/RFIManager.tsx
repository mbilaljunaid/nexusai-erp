import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { StandardTable } from "../tables/StandardTable";
import { MessageSquare, Plus, AlertCircle, CheckCircle, Clock, Send } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DatePicker } from '@/components/ui/DatePicker';

interface RFI {
    id: string;
    rfiNumber: string;
    subject: string;
    question: string;
    status: "OPEN" | "RESPONDED" | "CLOSED";
    importance: "NORMAL" | "URGENT" | "CRITICAL";
    assignedTo?: string;
    response?: string;
    createdAt: string;
    respondedAt?: string;
    dueDate?: string;
}

interface RFIManagerProps {
    projectId: string;
}

export function RFIManager({ projectId }: RFIManagerProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedRFI, setSelectedRFI] = useState<RFI | null>(null);
    const [isResponseOpen, setIsResponseOpen] = useState(false);

    const { data: rfis = [], isLoading } = useQuery<RFI[]>({
        queryKey: ["construction-rfis", projectId],
        enabled: !!projectId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/projects/${projectId}/rfis`);
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/construction/projects/${projectId}/rfis`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create RFI");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-rfis", projectId] });
            toast({ title: "RFI Created", description: "Request for Information has been submitted." });
            setIsCreateOpen(false);
        }
    });

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createMutation.mutate({
            subject: formData.get("subject"),
            question: formData.get("question"),
            importance: formData.get("importance"),
            assignedTo: formData.get("assignedTo"),
            dueDate: formData.get("dueDate")
        });
    };

    const statusConfig = {
        "OPEN": { color: "bg-blue-100 text-blue-800 border-blue-200", icon: AlertCircle },
        "RESPONDED": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
        "CLOSED": { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle }
    };

    const importanceConfig = {
        "NORMAL": { variant: "outline" as const, color: "" },
        "URGENT": { variant: "secondary" as const, color: "border-orange-500 text-orange-700" },
        "CRITICAL": { variant: "destructive" as const, color: "" }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Requests for Information</h2>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    New RFI
                </Button>
            </div>

            <StandardTable
                data={rfis}
                isLoading={isLoading}
                columns={[
                    {
                        header: "RFI #",
                        accessorKey: "rfiNumber",
                        sortable: true,
                        cell: (item: RFI) => (
                            <span className="font-mono font-semibold">{item.rfiNumber}</span>
                        )
                    },
                    {
                        header: "Subject",
                        accessorKey: "subject",
                        cell: (item: RFI) => (
                            <div>
                                <div className="font-medium">{item.subject}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                    {item.question}
                                </div>
                            </div>
                        )
                    },
                    {
                        header: "Status",
                        accessorKey: "status",
                        cell: (item: RFI) => {
                            const config = statusConfig[item.status];
                            const Icon = config.icon;
                            return (
                                <Badge variant="outline" className={cn("gap-1", config.color)}>
                                    <Icon className="h-3 w-3" />
                                    {item.status}
                                </Badge>
                            );
                        }
                    },
                    {
                        header: "Importance",
                        accessorKey: "importance",
                        cell: (item: RFI) => {
                            const config = importanceConfig[item.importance];
                            return (
                                <Badge variant={config.variant} className={config.color}>
                                    {item.importance}
                                </Badge>
                            );
                        }
                    },
                    {
                        header: "Assigned To",
                        accessorKey: "assignedTo",
                        cell: (item: RFI) => item.assignedTo || "-"
                    },
                    {
                        header: "Due Date",
                        accessorKey: "dueDate",
                        sortable: true,
                        cell: (item: RFI) => {
                            if (!item.dueDate) return "-";
                            const isOverdue = new Date(item.dueDate) < new Date() && item.status === "OPEN";
                            return (
                                <span className={cn(isOverdue && "text-red-600 font-semibold")}>
                                    {format(new Date(item.dueDate), "MMM d, yyyy")}
                                </span>
                            );
                        }
                    },
                    {
                        header: "Created",
                        accessorKey: "createdAt",
                        cell: (item: RFI) => format(new Date(item.createdAt), "MMM d, yyyy")
                    },
                    {
                        header: "",
                        accessorKey: "actions",
                        cell: (item: RFI) => (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setSelectedRFI(item);
                                    setIsResponseOpen(true);
                                }}
                            >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {item.status === "OPEN" ? "Respond" : "View"}
                            </Button>
                        )
                    }
                ]}
            />

            {/* Create RFI Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Create Request for Information
                        </DialogTitle>
                        <DialogDescription>
                            Submit a question or clarification request to the project team.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreate} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject *</Label>
                            <Input
                                id="subject"
                                name="subject"
                                placeholder="Brief description of the issue or question"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="question">Question / Details *</Label>
                            <Textarea
                                id="question"
                                name="question"
                                placeholder="Provide detailed information about the RFI..."
                                rows={5}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="importance">Importance *</Label>
                                <Select name="importance" defaultValue="NORMAL" required>
                                    <SelectTrigger id="importance">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NORMAL">Normal</SelectItem>
                                        <SelectItem value="URGENT">Urgent</SelectItem>
                                        <SelectItem value="CRITICAL">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assignedTo">Assigned To</Label>
                                <Input
                                    id="assignedTo"
                                    name="assignedTo"
                                    placeholder="Name or role"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <DatePicker onChange={() => {}} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                <Send className="h-4 w-4 mr-2" />
                                {createMutation.isPending ? "Submitting..." : "Submit RFI"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* RFI Detail/Response Dialog */}
            {selectedRFI && (
                <Dialog open={isResponseOpen} onOpenChange={setIsResponseOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                RFI #{selectedRFI.rfiNumber}
                            </DialogTitle>
                            <div className="flex gap-2 mt-2">
                                <Badge variant={importanceConfig[selectedRFI.importance].variant}>
                                    {selectedRFI.importance}
                                </Badge>
                                <Badge variant="outline" className={statusConfig[selectedRFI.status].color}>
                                    {selectedRFI.status}
                                </Badge>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Subject</div>
                                <div className="font-semibold">{selectedRFI.subject}</div>
                            </div>

                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Question</div>
                                <div className="text-sm bg-muted p-3 rounded-lg">{selectedRFI.question}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground mb-1">Created</div>
                                    <div className="font-medium">{format(new Date(selectedRFI.createdAt), "PPpp")}</div>
                                </div>
                                {selectedRFI.dueDate && (
                                    <div>
                                        <div className="text-muted-foreground mb-1">Due Date</div>
                                        <div className="font-medium">{format(new Date(selectedRFI.dueDate), "PPP")}</div>
                                    </div>
                                )}
                            </div>

                            {selectedRFI.response && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Response</div>
                                    <div className="text-sm bg-green-50 border border-green-200 p-3 rounded-lg">
                                        {selectedRFI.response}
                                    </div>
                                    {selectedRFI.respondedAt && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Responded on {format(new Date(selectedRFI.respondedAt), "PPP")}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsResponseOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
