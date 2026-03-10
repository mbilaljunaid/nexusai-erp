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
import { FileUp, Plus, CheckCircle, XCircle, AlertCircle, Clock, Upload } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Submittal {
    id: string;
    submittalNumber: string;
    specSection: string;
    description: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "RESUBMIT_REQUIRED";
    revision: number;
    submittedBy: string;
    reviewedBy?: string;
    createdAt: string;
    reviewedAt?: string;
    notes?: string;
}

interface SubmittalManagerProps {
    projectId: string;
}

export function SubmittalManager({ projectId }: SubmittalManagerProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedSubmittal, setSelectedSubmittal] = useState<Submittal | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const { data: submittals = [], isLoading } = useQuery<Submittal[]>({
        queryKey: ["construction-submittals", projectId],
        enabled: !!projectId,
        queryFn: async () => {
            const res = await fetch(`/api/construction/projects/${projectId}/submittals`);
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/construction/projects/${projectId}/submittals`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create submittal");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-submittals", projectId] });
            toast({ title: "Submittal Created", description: "Submittal has been submitted for review." });
            setIsCreateOpen(false);
        }
    });

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createMutation.mutate({
            specSection: formData.get("specSection"),
            description: formData.get("description"),
            submittedBy: formData.get("submittedBy")
        });
    };

    const statusConfig = {
        "PENDING": {
            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
            icon: Clock,
            label: "Pending Review"
        },
        "APPROVED": {
            color: "bg-green-100 text-green-800 border-green-200",
            icon: CheckCircle,
            label: "Approved"
        },
        "REJECTED": {
            color: "bg-red-100 text-red-800 border-red-200",
            icon: XCircle,
            label: "Rejected"
        },
        "RESUBMIT_REQUIRED": {
            color: "bg-orange-100 text-orange-800 border-orange-200",
            icon: AlertCircle,
            label: "Resubmit Required"
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Project Submittals</h2>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    New Submittal
                </Button>
            </div>

            <StandardTable
                data={submittals}
                isLoading={isLoading}
                columns={[
                    {
                        header: "Submittal #",
                        accessorKey: "submittalNumber",
                        sortable: true,
                        cell: (item: Submittal) => (
                            <div>
                                <div className="font-mono font-semibold">{item.submittalNumber}</div>
                                <div className="text-xs text-muted-foreground">Rev {item.revision}</div>
                            </div>
                        )
                    },
                    {
                        header: "Spec Section",
                        accessorKey: "specSection",
                        cell: (item: Submittal) => (
                            <Badge variant="outline" className="font-mono">
                                {item.specSection}
                            </Badge>
                        )
                    },
                    {
                        header: "Description",
                        accessorKey: "description",
                        cell: (item: Submittal) => (
                            <div className="max-w-xs">
                                <div className="font-medium line-clamp-1">{item.description}</div>
                            </div>
                        )
                    },
                    {
                        header: "Status",
                        accessorKey: "status",
                        cell: (item: Submittal) => {
                            const config = statusConfig[item.status];
                            const Icon = config.icon;
                            return (
                                <Badge variant="outline" className={cn("gap-1", config.color)}>
                                    <Icon className="h-3 w-3" />
                                    {config.label}
                                </Badge>
                            );
                        }
                    },
                    {
                        header: "Submitted By",
                        accessorKey: "submittedBy"
                    },
                    {
                        header: "Submitted",
                        accessorKey: "createdAt",
                        sortable: true,
                        cell: (item: Submittal) => format(new Date(item.createdAt), "MMM d, yyyy")
                    },
                    {
                        header: "Reviewed",
                        accessorKey: "reviewedAt",
                        cell: (item: Submittal) =>
                            item.reviewedAt ? format(new Date(item.reviewedAt), "MMM d, yyyy") : "-"
                    },
                    {
                        header: "",
                        accessorKey: "actions",
                        cell: (item: Submittal) => (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setSelectedSubmittal(item);
                                    setIsDetailOpen(true);
                                }}
                            >
                                View
                            </Button>
                        )
                    }
                ]}
            />

            {/* Create Submittal Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileUp className="h-5 w-5" />
                            Create Submittal
                        </DialogTitle>
                        <DialogDescription>
                            Submit shop drawings, product data, or samples for review and approval.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreate} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="specSection">Spec Section *</Label>
                                <Input
                                    id="specSection"
                                    name="specSection"
                                    placeholder="e.g., 03 30 00"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="submittedBy">Submitted By *</Label>
                                <Input
                                    id="submittedBy"
                                    name="submittedBy"
                                    placeholder="Name or company"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the submittal (e.g., Concrete mix design, Door hardware schedule)"
                                rows={3}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="files">Attach Files</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    PDF, DWG, or images (max 50MB)
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                <FileUp className="h-4 w-4 mr-2" />
                                {createMutation.isPending ? "Submitting..." : "Submit for Review"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Submittal Detail Dialog */}
            {selectedSubmittal && (
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FileUp className="h-5 w-5" />
                                Submittal #{selectedSubmittal.submittalNumber}
                            </DialogTitle>
                            <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="font-mono">
                                    {selectedSubmittal.specSection}
                                </Badge>
                                <Badge variant="outline" className={statusConfig[selectedSubmittal.status].color}>
                                    {statusConfig[selectedSubmittal.status].label}
                                </Badge>
                                <Badge variant="secondary">Revision {selectedSubmittal.revision}</Badge>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
                                <div className="text-sm bg-muted p-3 rounded-lg">{selectedSubmittal.description}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Submission Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div>
                                            <div className="text-muted-foreground">Submitted By</div>
                                            <div className="font-medium">{selectedSubmittal.submittedBy}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Submitted Date</div>
                                            <div className="font-medium">{format(new Date(selectedSubmittal.createdAt), "PPP")}</div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Review Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div>
                                            <div className="text-muted-foreground">Reviewed By</div>
                                            <div className="font-medium">{selectedSubmittal.reviewedBy || "-"}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Reviewed Date</div>
                                            <div className="font-medium">
                                                {selectedSubmittal.reviewedAt
                                                    ? format(new Date(selectedSubmittal.reviewedAt), "PPP")
                                                    : "-"}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {selectedSubmittal.notes && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Review Notes</div>
                                    <div className="text-sm bg-muted p-3 rounded-lg">{selectedSubmittal.notes}</div>
                                </div>
                            )}

                            {/* Revision History */}
                            {selectedSubmittal.revision > 0 && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-2">Revision History</div>
                                    <div className="text-sm text-muted-foreground">
                                        This is revision {selectedSubmittal.revision} of this submittal.
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                                Close
                            </Button>
                            {selectedSubmittal.status === "PENDING" && (
                                <>
                                    <Button variant="destructive">
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button variant="default">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                </>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
