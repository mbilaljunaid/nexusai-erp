import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { RiskIndicator } from "@/components/compliance/RiskIndicator";
import { ShieldCheck, Loader2 } from "lucide-react";
import { DatePicker } from '@/components/ui/DatePicker';

interface TransferWorkerDialogProps {
    personId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function TransferWorkerDialog({ personId, isOpen, onClose }: TransferWorkerDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [date, setDate] = useState("");
    const [jobId, setJobId] = useState("");
    const [deptId, setDeptId] = useState("");
    const [riskAnalysis, setRiskAnalysis] = useState<any>(null);

    const riskMutation = useMutation({
        mutationFn: () => {
            return fetch("/api/hr/compliance/predict-risk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transactionType: "TRANSFER",
                    data: {
                        personId,
                        effectiveDate: date,
                        jobId,
                        departmentId: deptId
                    }
                })
            }).then(r => r.json());
        },
        onSuccess: (data) => setRiskAnalysis(data),
    });

    const transferMutation = useMutation({
        mutationFn: async () => {
            return api.hr.persons.transfer(personId, {
                effectiveDate: date,
                newJobId: jobId || undefined,
                newDepartmentId: deptId || undefined
            });
        },
        onSuccess: () => {
            toast({ title: "Transfer Successful", description: "Worker assignment has been updated." });
            queryClient.invalidateQueries({ queryKey: ["hr-search"] });
            queryClient.invalidateQueries({ queryKey: ["hr-person-profile", personId] });
            onClose();
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Transfer Failed", description: error.message });
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <DialogTitle>Transfer / Promotion</DialogTitle>
                    </div>
                    <DialogDescription>
                        Create a new assignment record effective from the selected date.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="eff-date" className="text-right font-medium">
                            Date
                        </Label>
                        <DatePicker className="col-span-3" value={date} onChange={v => setDate(v)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-job" className="text-right font-medium">
                            Job ID
                        </Label>
                        <Input
                            id="new-job"
                            className="col-span-3"
                            placeholder="Enter Job ID"
                            value={jobId}
                            onChange={(e) => setJobId(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-dept" className="text-right font-medium">
                            Dept ID
                        </Label>
                        <Input
                            id="new-dept"
                            className="col-span-3"
                            placeholder="Enter Dept ID"
                            value={deptId}
                            onChange={(e) => setDeptId(e.target.value)}
                        />
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Risk Assessment</span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => riskMutation.mutate()}
                                disabled={riskMutation.isPending || !date}
                                className="h-7 text-[10px] gap-1.5"
                            >
                                {riskMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                                Preview Risk
                            </Button>
                        </div>
                        <RiskIndicator analysis={riskAnalysis} isLoading={riskMutation.isPending} />
                    </div>
                </div>
                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => transferMutation.mutate()}
                        disabled={!date || transferMutation.isPending}
                        className="gap-2"
                    >
                        {transferMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        Submit Transfer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
