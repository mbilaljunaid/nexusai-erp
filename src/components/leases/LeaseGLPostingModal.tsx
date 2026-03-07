import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";

interface GLPostingModalProps {
    leaseId: string;
    period: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface JournalLine {
    accountId: string;
    accountName: string;
    description: string;
    debit?: number;
    credit?: number;
}

export function LeaseGLPostingModal({ leaseId, period, isOpen, onClose, onSuccess }: GLPostingModalProps) {
    const queryClient = useQueryClient();
    const [showPreview, setShowPreview] = useState(false);

    // Mock preview data (in real app, fetch from backend)
    const previewData: JournalLine[] = [
        {
            accountId: "62100",
            accountName: "Interest Expense",
            description: "Lease Interest Expense",
            debit: 1250.00,
            credit: undefined
        },
        {
            accountId: "62200",
            accountName: "Lease Amortization Expense",
            description: "ROU Asset Amortization",
            debit: 2500.00,
            credit: undefined
        },
        {
            accountId: "22000",
            accountName: "Lease Liability",
            description: "Lease Liability Adjustment (Interest)",
            debit: undefined,
            credit: 1250.00
        },
        {
            accountId: "16500",
            accountName: "Accumulated Amortization - ROU",
            description: "ROU Accumulated Amortization",
            debit: undefined,
            credit: 2500.00
        }
    ];

    const totalDebits = previewData.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredits = previewData.reduce((sum, line) => sum + (line.credit || 0), 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    const postGLMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/lease/leases/${leaseId}/post-gl`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ period })
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to post to GL");
            }
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Posted Successfully",
                description: `Journal ${data.journalNumber} created in General Ledger`
            });
            queryClient.invalidateQueries({ queryKey: ["lease", leaseId] });
            onSuccess();
            onClose();
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Posting Failed",
                description: error.message
            });
        }
    });

    const handlePost = () => {
        setShowPreview(true);
    };

    const handleConfirmPost = () => {
        postGLMutation.mutate();
    };

    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined) return "-";
        return formatCurrency(amount);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Post Lease Amortization to GL</DialogTitle>
                    <DialogDescription>
                        Period {period} - Review journal entries before posting
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        {isBalanced ? (
                            <>
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium">Journal is balanced and ready to post</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <span className="text-sm font-medium text-red-600">Journal is not balanced!</span>
                            </>
                        )}
                    </div>

                    {/* Account Mappings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Account Mappings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Interest Expense:</span>
                                    <Badge variant="outline">62100</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amortization Expense:</span>
                                    <Badge variant="outline">62200</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Lease Liability:</span>
                                    <Badge variant="outline">22000</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Accumulated Amort:</span>
                                    <Badge variant="outline">16500</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Journal Entry Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Journal Entry Lines</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Account</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.map((line, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{line.accountId}</div>
                                                    <div className="text-xs text-muted-foreground">{line.accountName}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{line.description}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {line.debit !== undefined && (
                                                    <span className="text-green-600">{formatCurrency(line.debit)}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {line.credit !== undefined && (
                                                    <span className="text-blue-600">{formatCurrency(line.credit)}</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-bold border-t-2">
                                        <TableCell colSpan={2}>TOTALS</TableCell>
                                        <TableCell className="text-right text-green-600">
                                            {formatCurrency(totalDebits)}
                                        </TableCell>
                                        <TableCell className="text-right text-blue-600">
                                            {formatCurrency(totalCredits)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>

                            {!isBalanced && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-200 rounded text-sm text-red-700">
                                    <strong>Warning:</strong> Debits and credits do not balance.
                                    Difference: {formatCurrency(Math.abs(totalDebits - totalCredits))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Posting Info */}
                    <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Journal will be created with source: LEASE</p>
                        <p>• Category: Amortization</p>
                        <p>• Status: Unposted (requires GL batch posting)</p>
                        <p>• Once posted, this period cannot be posted again</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={postGLMutation.isPending}>
                        Cancel
                    </Button>
                    {!showPreview ? (
                        <Button onClick={handlePost} disabled={!isBalanced}>
                            Preview & Post
                        </Button>
                    ) : (
                        <Button
                            onClick={handleConfirmPost}
                            disabled={postGLMutation.isPending || !isBalanced}
                        >
                            {postGLMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                "Confirm & Post to GL"
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
