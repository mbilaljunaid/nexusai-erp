import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Unlock, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ApPeriodClose() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: periods, isLoading } = useQuery<any[]>({
        queryKey: ["/api/ap/periods"]
    });

    const closeMutation = useMutation({
        mutationFn: async (periodId: string) => {
            const res = await apiRequest("POST", `/api/ap/periods/${periodId}/close`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to close period");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Period Closed", description: "The payables period has been closed successfully." });
            queryClient.invalidateQueries({ queryKey: ["/api/ap/periods"] });
        },
        onError: (err: Error) => {
            toast({
                title: "Close Failed",
                description: err.message,
                variant: "destructive"
            });
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payables Period Control</CardTitle>
                <CardDescription>Manage accounting periods for the Accounts Payable subledger</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Period Name</TableHead>
                            <TableHead>Date Range</TableHead>
                            <TableHead>GL Status</TableHead>
                            <TableHead>AP Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {periods?.map((period) => (
                            <TableRow key={period.id}>
                                <TableCell className="font-medium">{period.periodName}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-normal">
                                        {period.glStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={period.apStatus === "OPEN" ? "outline" : "secondary"}
                                        className={period.apStatus === "OPEN" ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-700"}
                                    >
                                        <div className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider font-bold">
                                            {period.apStatus === "OPEN" ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                            {period.apStatus}
                                        </div>
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {period.apStatus === "OPEN" ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                            onClick={() => closeMutation.mutate(period.id)}
                                            disabled={closeMutation.isPending}
                                        >
                                            {closeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Close Period"}
                                        </Button>
                                    ) : (
                                        <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            Closed
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="mt-8 p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        Pre-Close Requirements
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                        <li>All invoices for the period must be validated (Status: VALIDATED).</li>
                        <li>All holds must be resolved or manually released if they block accounting.</li>
                        <li>Payments for the period must be fully accounted and sent to the General Ledger.</li>
                        <li>Recurring invoices for the period must be generated.</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
