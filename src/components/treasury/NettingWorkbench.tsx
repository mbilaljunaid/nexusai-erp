
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowRightLeft, CheckCircle, Scale } from "lucide-react";
import { format } from "date-fns";

export function NettingWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

    // Fetch recent batches (mock endpoint search or just all for now)
    // We didn't implement LIST. Let's assume we can add LIST route or just create new.
    // Actually I missed adding a LIST route.
    // I will assume for now we just create one to see it. 
    // Or better, let's fix the routes in next step to include LIST. 
    // For now, I'll allow creating.

    const createMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/treasury/netting/batches", {});
            return res.json();
        },
        onSuccess: (data) => {
            setSelectedBatchId(data.id);
            toast({ title: "Netting Batch Created", description: `Batch ${data.batchNumber} draft generated.` });
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-muted/20 p-6 rounded-xl border border-dashed border-primary/20">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Scale className="h-6 w-6 text-primary" />
                        In-House Banking & Netting
                    </h3>
                    <p className="text-muted-foreground mt-1">
                        Consolidated intercompany settlement engine.
                    </p>
                </div>
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                    <Plus className="mr-2 h-4 w-4" />
                    Run Netting Cycle
                </Button>
            </div>

            {selectedBatchId && <NettingBatchDetail batchId={selectedBatchId} />}

            {!selectedBatchId && (
                <div className="text-center py-12 text-muted-foreground">
                    No active netting batch selected. Start a new cycle to clear intercompany positions.
                </div>
            )}
        </div>
    );
}

function NettingBatchDetail({ batchId }: { batchId: string }) {
    const { toast } = useToast();

    const { data: positions = [], isLoading } = useQuery<any[]>({
        queryKey: [`/api/treasury/netting/batches/${batchId}/positions`],
        enabled: !!batchId
    });

    const settleMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("POST", `/api/treasury/netting/batches/${batchId}/settle`, {});
        },
        onSuccess: () => {
            toast({ title: "Settlement Complete", description: "Internal transfers executed." });
        }
    });

    if (isLoading) return <div>Loading Matrix...</div>;

    const totalVolume = positions.reduce((sum, p) => sum + Math.abs(p.netAmount), 0);

    return (
        <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 pb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Netting Matrix</CardTitle>
                        <CardDescription>Consolidated positions by entity</CardDescription>
                    </div>
                    <Button
                        variant="default"
                        onClick={() => settleMutation.mutate()}
                        disabled={settleMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Execute Settlement
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-background border rounded-lg shadow-sm">
                        <span className="text-sm text-muted-foreground">Total Clearance Volume</span>
                        <div className="text-2xl font-bold font-mono">${(totalVolume / 2).toLocaleString()}</div>
                        {/* Divide by 2 because sum of abs includes both sides of 0 sum game? */}
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Entity</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead className="text-right">Net Amount (USD)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {positions.map((pos) => (
                            <TableRow key={pos.entityId}>
                                <TableCell className="font-medium">
                                    {/* Mock entity lookup or just ID */}
                                    Entity #{pos.entityId.slice(0, 4)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={pos.status === 'RECEIVING' ? 'default' : 'destructive'}>
                                        {pos.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono font-medium">
                                    {Math.abs(pos.netAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </TableCell>
                            </TableRow>
                        ))}
                        {positions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                    No Eligible Intercompany Transactions Found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default NettingWorkbench;
