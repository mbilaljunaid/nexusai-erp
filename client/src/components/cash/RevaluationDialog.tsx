
import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";

interface RevaluationDialogProps {
    accountId: string;
    accountName: string;
    currency: string;
    isOpen: boolean;
    onClose: () => void;
}

export function RevaluationDialog({ accountId, accountName, currency, isOpen, onClose }: RevaluationDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const revalueMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/cash/accounts/${accountId}/revalue`);
            return res.json();
        },
        onSuccess: (data: any) => {
            toast({
                title: "Revaluation Complete",
                description: `FX Gain/Loss: ${data.gainLoss.toFixed(2)} USD. Journal posted.`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/cash/accounts"] });
            onClose();
        },
        onError: (error) => {
            toast({
                title: "Revaluation Failed",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Bank Revaluation
                    </DialogTitle>
                    <DialogDescription>
                        Revalue {accountName} ({currency}) based on the latest exchange rates.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">What happens next?</p>
                            <p className="text-muted-foreground">
                                This will compare the current market value with the historical cost and post an unrealized Gain/Loss journal to the General Ledger.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={revalueMutation.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={() => revalueMutation.mutate()} disabled={revalueMutation.isPending}>
                        {revalueMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Run Revaluation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
