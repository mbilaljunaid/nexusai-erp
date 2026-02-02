import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

interface TerminateWorkerDialogProps {
    personId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function TerminateWorkerDialog({ personId, isOpen, onClose }: TerminateWorkerDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("");

    const terminateMutation = useMutation({
        mutationFn: async () => {
            return api.hr.persons.terminate(personId, { date, reason });
        },
        onSuccess: () => {
            toast({ title: "Terminated", description: "Worker has been terminated successfully." });
            queryClient.invalidateQueries({ queryKey: ["hr-search"] });
            queryClient.invalidateQueries({ queryKey: ["hr-person-profile", personId] });
            onClose();
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Termination Failed", description: error.message });
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Terminate Worker
                    </DialogTitle>
                    <DialogDescription>
                        This action will end the work relationship and all active assignments effective on the selected date.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="term-date" className="text-right">
                            Termination Date
                        </Label>
                        <Input
                            id="term-date"
                            type="date"
                            className="col-span-3"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reason" className="text-right">
                            Reason
                        </Label>
                        <Input
                            id="reason"
                            className="col-span-3"
                            placeholder="Optional"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        variant="destructive"
                        onClick={() => terminateMutation.mutate()}
                        disabled={!date || terminateMutation.isPending}
                    >
                        {terminateMutation.isPending ? "Terminating..." : "Confirm Termination"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
