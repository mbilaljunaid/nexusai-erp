import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

    const { data: approvals = [] } = useQuery<any[]>({
        queryKey: ["/api/hr/compliance/approvals", violation?.id],
        queryFn: () => fetch(`/api/hr/compliance/approvals?violationId=${violation?.id}`).then(r => r.json()),
        enabled: !!violation?.id
    });

    if (!violation) return null;

    return (
        <Sheet open={!!violation} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold border-b pb-4">
                        Remediate Violation
                    </SheetTitle>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* Approval Chain Visualizer */}
                    {approvals.length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-xs uppercase text-muted-foreground font-semibold">Approval Chain</Label>
                            <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                                {approvals.sort((a, b) => (a.stepOrder || 1) - (b.stepOrder || 1)).map((step, idx) => (
                                    <div key={idx} className="flex gap-4 relative">
                                        <div className={`h-6 w-6 rounded-full border-2 bg-white flex items-center justify-center shrink-0 z-10 ${step.status === 'approved' ? 'border-green-500 text-green-500' :
                                            step.status === 'rejected' ? 'border-red-500 text-red-500' : 'border-slate-300 text-slate-400'
                                            }`}>
                                            <span className="text-[10px] font-bold">{step.stepOrder || 1}</span>
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold">{step.status.toUpperCase()}</span>
                                                <Badge variant="outline" className="text-[10px] h-4">Step {step.stepOrder || 1}</Badge>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {step.status === 'approved' ? 'Approval granted by governance chain.' : 'Pending review by authorities.'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border italic">
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
                            className="min-h-[120px]"
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
