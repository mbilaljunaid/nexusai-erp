
import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table";


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
    const [rateOverride, setRateOverride] = useState<string>("");

    // Fetch History
    const { data: history = [] } = useQuery<any[]>({
        queryKey: [`/api/cash/accounts/${accountId}/revalue/history`],
        enabled: isOpen,
    });

    const revalueMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/cash/accounts/${accountId}/revalue`, {
                rateOverride: rateOverride ? parseFloat(rateOverride) : undefined
            });
            return res.json();
        },
        onSuccess: (data: any) => {
            toast({
                title: "Revaluation Complete",
                description: `FX Gain/Loss: ${Number(data.gainLoss).toFixed(2)} USD. Journal posted.`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/cash/accounts"] });
            queryClient.invalidateQueries({ queryKey: [`/api/cash/accounts/${accountId}/revalue/history`] });
            setRateOverride("");
            // Don't close immediately to show result in history? Or maybe close is better. User preference.
            // onClose(); 
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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Bank Revaluation
                    </DialogTitle>
                    <DialogDescription>
                        Revalue {accountName} ({currency}) based on exchange rates.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">Revaluation Control</p>
                            <p className="text-muted-foreground">
                                System will use the latest Corporate Rate from GL Daily Rates unless a manual override is provided.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Manual Rate Override (Optional)</Label>
                        <Input
                            type="number"
                            step="0.000001"
                            placeholder="e.g. 1.0850 (Leave empty for System Rate)"
                            value={rateOverride}
                            onChange={(e) => setRateOverride(e.target.value)}
                        />
                    </div>

                    <div className="pt-4">
                        <h4 className="text-sm font-medium mb-2">Revaluation History</h4>
                        <div className="border rounded-md max-h-[200px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Rate Used</TableHead>
                                        <TableHead>Gain/Loss</TableHead>
                                        <TableHead>Type</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history?.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{new Date(item.revaluationDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{Number(item.usedRate).toFixed(4)}</TableCell>
                                            <TableCell className={Number(item.unrealizedGainLoss) >= 0 ? "text-green-600" : "text-red-600"}>
                                                {Number(item.unrealizedGainLoss).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.rateType === 'User' ? "secondary" : "outline"}>
                                                    {item.rateType}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!history || history.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">No history found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={revalueMutation.isPending}>
                        Close
                    </Button>
                    <Button onClick={() => revalueMutation.mutate()} disabled={revalueMutation.isPending}>
                        {revalueMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Post Revaluation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

