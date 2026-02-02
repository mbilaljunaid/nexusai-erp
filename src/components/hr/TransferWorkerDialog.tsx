import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transfer / Promotion</DialogTitle>
                    <DialogDescription>
                        Create a new assignment record effective from the selected date.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="eff-date" className="text-right">
                            Effective Date
                        </Label>
                        <Input
                            id="eff-date"
                            type="date"
                            className="col-span-3"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    {/* Placeholder for Selects - using Text for MVP */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-job" className="text-right">
                            New Job ID
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
                        <Label htmlFor="new-dept" className="text-right">
                            New Dept ID
                        </Label>
                        <Input
                            id="new-dept"
                            className="col-span-3"
                            placeholder="Enter Dept ID"
                            value={deptId}
                            onChange={(e) => setDeptId(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => transferMutation.mutate()}
                        disabled={!date || transferMutation.isPending}
                    >
                        {transferMutation.isPending ? "Processing..." : "Submit Transfer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
