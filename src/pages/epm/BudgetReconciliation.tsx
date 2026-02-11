import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Link2, FileCheck, AlertTriangle } from "lucide-react";

interface ReconciliationItem {
    id: string;
    account: string;
    budgetLineId: string;
    actualLineId?: string;
    budgetAmount: number;
    actualAmount?: number;
    variance?: number;
    status: "MATCHED" | "UNMATCHED" | "EXCEPTION";
    matchedBy?: string;
    matchedAt?: string;
}

export default function BudgetReconciliation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedPeriod, setSelectedPeriod] = useState("Jan-2026");
    const [selectedItem, setSelectedItem] = useState<ReconciliationItem | null>(null);
    const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
    const [isSignOffDialogOpen, setIsSignOffDialogOpen] = useState(false);
    const [signOffComments, setSignOffComments] = useState("");

    // Fetch reconciliation items
    const { data: items = [] } = useQuery<ReconciliationItem[]>({
        queryKey: ["budget-reconciliation", selectedPeriod],
        queryFn: async () => {
            const res = await fetch(`/api/gl/reconciliation?periodName=${selectedPeriod}`);
            return res.json();
        }
    });

    // Manual match mutation
    const matchMutation = useMutation({
        mutationFn: async ({ itemId, actualLineId }: { itemId: string; actualLineId: string }) => {
            const res = await fetch(`/api/gl/reconciliation/${itemId}/match`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actualLineId })
            });
            if (!res.ok) throw new Error("Failed to match");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budget-reconciliation"] });
            setIsMatchDialogOpen(false);
            setSelectedItem(null);
            toast({
                title: "Item Matched",
                description: "Budget and actual successfully matched"
            });
        }
    });

    // Sign-off mutation
    const signOffMutation = useMutation({
        mutationFn: async ({ period, comments }: { period: string; comments: string }) => {
            const res = await fetch(`/api/gl/reconciliation/sign-off`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ period, comments })
            });
            if (!res.ok) throw new Error("Failed to sign off");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budget-reconciliation"] });
            setIsSignOffDialogOpen(false);
            setSignOffComments("");
            toast({
                title: "Reconciliation Signed Off",
                description: "Period reconciliation completed successfully"
            });
        }
    });

    const matchedCount = items.filter(i => i.status === "MATCHED").length;
    const unmatchedCount = items.filter(i => i.status === "UNMATCHED").length;
    const exceptionCount = items.filter(i => i.status === "EXCEPTION").length;
    const totalItems = items.length;
    const matchRate = totalItems > 0 ? ((matchedCount / totalItems) * 100).toFixed(0) : 0;

    return (
        <StandardPage
            title="Budget vs Actual Reconciliation"
            description="Formal reconciliation process for budget variance with sign-off capability"
            breadcrumbs={[
                { label: "EPM", href: "/epm" },
                { label: "Reconciliation" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Total Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{totalItems}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Matched
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{matchedCount}</div>
                            <div className="text-xs text-green-600">{matchRate}% match rate</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Unmatched
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">{unmatchedCount}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Exceptions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-900">{exceptionCount}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Period Selector & Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Period:</label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Jan-2026">Jan 2026</SelectItem>
                                <SelectItem value="Dec-2025">Dec 2025</SelectItem>
                                <SelectItem value="Nov-2025">Nov 2025</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Dialog open={isSignOffDialogOpen} onOpenChange={setIsSignOffDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={unmatchedCount > 0 || exceptionCount > 0}>
                                <FileCheck className="h-4 w-4 mr-2" />
                                Sign Off Reconciliation
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Sign Off Reconciliation - {selectedPeriod}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <p className="text-sm text-muted-foreground">
                                    By signing off, you confirm that all budget vs actual variances have been reviewed and reconciled.
                                </p>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Comments (Optional)</label>
                                    <Textarea
                                        placeholder="Add any notes or observations..."
                                        value={signOffComments}
                                        onChange={(e) => setSignOffComments(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsSignOffDialogOpen(false)}>Cancel</Button>
                                <Button onClick={() => signOffMutation.mutate({ period: selectedPeriod, comments: signOffComments })}>
                                    Confirm Sign Off
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Reconciliation Table */}
                <Card className="border-t-4 border-t-green-500">
                    <CardHeader>
                        <CardTitle>Reconciliation Status - {selectedPeriod}</CardTitle>
                        <CardDescription>Budget vs Actual matching and exception handling</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Budget Amount</TableHead>
                                    <TableHead className="text-right">Actual Amount</TableHead>
                                    <TableHead className="text-right">Variance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Matched By</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No reconciliation items for selected period
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.account}</TableCell>
                                            <TableCell className="text-right font-mono">${item.budgetAmount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {item.actualAmount ? `$${item.actualAmount.toLocaleString()}` : "-"}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {item.variance !== undefined ? (
                                                    <span className={item.variance < 0 ? "text-red-600" : "text-green-600"}>
                                                        ${Math.abs(item.variance).toLocaleString()}
                                                    </span>
                                                ) : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {item.status === "MATCHED" && (
                                                    <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Matched</Badge>
                                                )}
                                                {item.status === "UNMATCHED" && (
                                                    <Badge className="bg-amber-500"><AlertTriangle className="h-3 w-3 mr-1" />Unmatched</Badge>
                                                )}
                                                {item.status === "EXCEPTION" && (
                                                    <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Exception</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {item.matchedBy || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {item.status === "UNMATCHED" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setIsMatchDialogOpen(true);
                                                        }}
                                                    >
                                                        <Link2 className="h-3 w-3 mr-1" />
                                                        Match
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Manual Match Dialog */}
                <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Manual Match - {selectedItem?.account}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                Select the actual transaction to match with this budget line.
                            </p>
                            {/* In a real implementation, this would show a list of candidates */}
                            <div className="p-4 border rounded-lg space-y-2">
                                <div className="text-sm font-medium">Budget Line</div>
                                <div className="text-xs text-muted-foreground">{selectedItem?.budgetLineId}</div>
                                <div className="text-lg font-mono">${selectedItem?.budgetAmount.toLocaleString()}</div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsMatchDialogOpen(false)}>Cancel</Button>
                            <Button onClick={() => {
                                if (selectedItem) {
                                    matchMutation.mutate({ itemId: selectedItem.id, actualLineId: "MOCK-ACTUAL-001" });
                                }
                            }}>
                                Confirm Match
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </StandardPage>
    );
}
