import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Violation {
    id: string;
    ruleName: string;
    entityType: string;
    entityId: string;
    status: string;
    severity: string;
    description: string;
    createdAt: string;
    remediationActions: string[];
}

interface RemediationSheetProps {
    violation: Violation | null;
    onOpenChange: (open: boolean) => void;
}

export function RemediationSheet({ violation, onOpenChange }: RemediationSheetProps) {
    const [status, setStatus] = useState<string>(violation?.status || "open");
    const [notes, setNotes] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: { status: string; resolutionNotes: string }) =>
            fetch(`/api/hr/compliance/violations/${violation?.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then((r) => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/hr/compliance/violations"] });
            queryClient.invalidateQueries({ queryKey: ["/api/hr/compliance/analytics"] });
            toast({ title: "Violation Updated", description: "The remediation status has been saved." });
            onOpenChange(false);
        },
    });

    if (!violation) return null;

    return (
        <Sheet open={!!violation} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold border-b pb-4">
                        Remediate Violation
                    </SheetTitle>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    <div className="space-y-1">
                        <Label className="text-xs uppercase text-muted-foreground font-semibold">Rule Violated</Label>
                        <p className="text-sm font-medium">{violation.ruleName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs uppercase text-muted-foreground font-semibold">Severity</Label>
                            <div>
                                <Badge variant={violation.severity === 'critical' ? 'destructive' : 'secondary'}>
                                    {violation.severity.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs uppercase text-muted-foreground font-semibold">Entity</Label>
                            <p className="text-sm font-medium">{violation.entityType}: {violation.entityId}</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs uppercase text-muted-foreground font-semibold">Description</Label>
                        <p className="text-sm text-slate-600 bg-slate-500/10 p-3 rounded-lg border italic">
                            "{violation.description}"
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-semibold">Remediation Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">Open / Investigating</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="dismissed">Dismissed (False Positive)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-semibold">Resolution Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Detail the actions taken to resolve this violation..."
                            className="min-h-28"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {violation.remediationActions && violation.remediationActions.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground font-semibold">Recommended Steps</Label>
                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 ml-1">
                                {violation.remediationActions.map((action, i) => (
                                    <li key={i}>{action}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Workflow Visualizer */}
                {violation.status !== "resolved" && (
                    <div className="bg-slate-500/10 p-4 rounded-lg border mb-4">
                        <div className="text-xs font-semibold uppercase text-slate-500 mb-2">Remediation Workflow</div>
                        <div className="flex items-center gap-2 text-sm">
                            <Badge variant={violation.status === 'open' ? 'default' : 'outline'}>Step 1: Manager</Badge>
                            <span className="text-slate-300">→</span>
                            <Badge variant="outline" className="text-slate-400">Step 2: Compliance</Badge>
                        </div>
                    </div>
                )}

                <SheetFooter className="border-t pt-4">
                    <Button
                        className="w-full"
                        onClick={() => mutation.mutate({ status, resolutionNotes: notes })}
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? "Saving..." : "Save Remediation"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
