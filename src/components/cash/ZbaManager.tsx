
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, ArrowRight, History, Settings2, Building2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function ZbaManager() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: structures, isLoading: loadingStructures } = useQuery<any[]>({
        queryKey: ["/api/cash/zba/structures"]
    });

    const { data: sweeps, isLoading: loadingSweeps } = useQuery<any[]>({
        queryKey: ["/api/cash/zba/sweeps"]
    });

    const executeMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/cash/zba/execute-sweeps", { method: "POST" });
            if (!res.ok) throw new Error("Failed to execute sweeps");
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "ZBA Sweeps Executed",
                description: `Successfully processed ${data.swept} sweeps across ${data.processed} structures.`
            });
            queryClient.invalidateQueries({ queryKey: ["/api/cash/zba/sweeps"] });
            queryClient.invalidateQueries({ queryKey: ["/api/cash/accounts"] });
        },
        onError: () => {
            toast({
                title: "Execution Failed",
                description: "There was an error during the automated sweep process.",
                variant: "destructive"
            });
        }
    });

    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/cash/zba/structures/${id}/approve`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to approve");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Approved", description: "ZBA structure is now active." });
            queryClient.invalidateQueries({ queryKey: ["/api/cash/zba/structures"] });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/cash/zba/structures/${id}/reject`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to reject");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Rejected", description: "ZBA structure has been rejected.", variant: "destructive" });
            queryClient.invalidateQueries({ queryKey: ["/api/cash/zba/structures"] });
        }
    });

    const pendingStructures = structures?.filter(s => s.status === 'Pending') || [];
    const activeStructures = structures?.filter(s => s.status === 'Active') || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Treasury Operations: ZBA</h3>
                    <p className="text-sm text-muted-foreground">Manage automated cash pooling and zero-balance account hierarchies.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" /> New Structure
                    </Button>
                    <Button
                        className="gap-2"
                        onClick={() => executeMutation.mutate()}
                        disabled={executeMutation.isPending}
                    >
                        <Play className="h-4 w-4" /> Run Automated Sweeps
                    </Button>
                </div>
            </div>

            {pendingStructures.length > 0 && (
                <Card className="border-orange-200 bg-orange-50/20">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                            <ShieldCheck className="h-4 w-4" />
                            Approval Queue (Maker-Checker)
                        </CardTitle>
                        <CardDescription>Hierarchies requiring second-level verification before activation.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sub Account</TableHead>
                                    <TableHead>Master Account</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingStructures.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium text-xs font-mono">{s.subAccountId.slice(0, 8)}</TableCell>
                                        <TableCell className="font-medium text-xs font-mono">{s.masterAccountId.slice(0, 8)}</TableCell>
                                        <TableCell className="text-xs">{s.targetBalance}</TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                className="h-7 bg-green-600 hover:bg-green-700"
                                                onClick={() => approveMutation.mutate(s.id)}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-red-600 border-red-200"
                                                onClick={() => rejectMutation.mutate(s.id)}
                                            >
                                                Reject
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-primary" />
                            Active ZBA Hierarchies
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sub Account</TableHead>
                                    <TableHead></TableHead>
                                    <TableHead>Target (Master)</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingStructures ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                                ) : activeStructures.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">No active ZBA structures defined</TableCell></TableRow>
                                ) : (
                                    activeStructures.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-medium text-xs font-mono">{s.subAccountId.slice(0, 8)}</TableCell>
                                            <TableCell><ArrowRight className="h-3 w-3 text-muted-foreground" /></TableCell>
                                            <TableCell className="font-medium text-xs font-mono">{s.masterAccountId.slice(0, 8)}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className="text-[10px] text-green-600 border-green-200">
                                                    {s.targetBalance}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <History className="h-4 w-4 text-primary" />
                            Sweep Execution Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Direction</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingSweeps ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                                ) : sweeps?.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">No sweep history</TableCell></TableRow>
                                ) : (
                                    sweeps?.map((sweep) => (
                                        <TableRow key={sweep.id}>
                                            <TableCell className="text-xs">{format(new Date(sweep.sweepDate), 'MMM dd, HH:mm')}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {sweep.direction === 'SUB_TO_MASTER' ? 'Pool Funds' : 'Refill Sub'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-xs">{Number(sweep.amount).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="default" className="bg-green-600 text-[10px]">{sweep.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-4 items-start">
                <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-xs">
                    <p className="font-semibold text-blue-900 uppercase tracking-tight">Treasury Policy Note</p>
                    <p className="text-blue-800 mt-1">
                        Sweeps are performed as internal GL transfers between cash clearing accounts.
                        Matching bank statement lines for the actual bank-side transfer will be automatically reconciled against these sweep transactions.
                    </p>
                </div>
            </div>
        </div>
    );
}
