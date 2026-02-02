import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    RefreshCcw,
    Link as LinkIcon,
    Unlink,
    CheckCircle2,
    AlertTriangle,
    Search,
    Filter,
    ArrowRightLeft,
    Check,
    Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

export default function BankReconciliation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // State 
    const [selectedStatementLine, setSelectedStatementLine] = useState<number | null>(null);
    const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);

    // Queries
    const { data: bankAccounts } = useQuery<any[]>({
        queryKey: ["/api/cash/accounts"]
    });

    const activeAccountId = bankAccounts?.[0]?.id || "01-bank-01";

    const { data: statementLines, isLoading: loadingLines } = useQuery({
        queryKey: ["/api/cash/accounts", activeAccountId, "statement-lines"],
        queryFn: async () => {
            const res = await fetch(`/api/cash/accounts/${activeAccountId}/statement-lines`);
            return res.json();
        }
    });

    const { data: internalTransactions, isLoading: loadingTrx } = useQuery({
        queryKey: ["/api/cash/accounts", activeAccountId, "transactions"],
        queryFn: async () => {
            const res = await fetch(`/api/cash/accounts/${activeAccountId}/transactions`);
            return res.json();
        }
    });

    // Match Mutation
    const matchMutation = useMutation({
        mutationFn: async () => {
            // Placeholder logic: In a real app, this would call a reconciliation service
            await new Promise(r => setTimeout(r, 1000));
            return { success: true };
        },
        onSuccess: () => {
            toast({
                title: "Successfully Matched",
                description: "The transaction has been reconciled."
            });
            setSelectedStatementLine(null);
            setSelectedTransactions([]);
            queryClient.invalidateQueries({ queryKey: ["/api/cash/accounts"] });
        }
    });

    const unreconciledLines = statementLines?.filter((l: any) => !l.reconciled) || [];
    const unreconciledTrx = internalTransactions?.filter((t: any) => t.status === "Unreconciled") || [];

    const totalSelectedTrxAmount = internalTransactions
        ?.filter((t: any) => selectedTransactions.includes(t.id))
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0;

    const currentLineAmount = statementLines?.find((l: any) => l.id === selectedStatementLine)?.amount || 0;
    const diff = parseFloat(currentLineAmount) - totalSelectedTrxAmount;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1">
            {/* Left Side: Bank Statement */}
            <Card className="border-border/50 shadow-lg">
                <CardHeader className="border-b bg-muted/30 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ArrowRightLeft className="w-5 h-5 text-blue-500" />
                                Bank Statement Lines
                            </CardTitle>
                            <CardDescription>Lines imported from your bank</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-background">{unreconciledLines.length} Unmatched</Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search statement..." className="pl-9 h-9" />
                        </div>
                        <Button variant="outline" size="sm"><Filter className="w-4 h-4" /></Button>
                    </div>
                </CardHeader>
                <ScrollArea className="h-[600px]">
                    <CardContent className="p-0">
                        {loadingLines ? (
                            <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {unreconciledLines.map((line: any) => (
                                    <div
                                        key={line.id}
                                        onClick={() => setSelectedStatementLine(line.id)}
                                        className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${selectedStatementLine === line.id ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold">{line.description}</span>
                                            <span className="font-mono font-bold">{parseFloat(line.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <div className="flex gap-3">
                                                <span>{new Date(line.transactionDate).toLocaleDateString()}</span>
                                                <span className="uppercase">{line.referenceNumber}</span>
                                            </div>
                                            {line.reconciled && <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Reconciled</Badge>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </ScrollArea>
            </Card>

            {/* Right Side: Internal Transactions */}
            <Card className="border-border/50 shadow-lg">
                <CardHeader className="border-b bg-muted/30 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Internal Transactions
                            </CardTitle>
                            <CardDescription>Payments and receipts from ERP</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-background">{unreconciledTrx.length} Unreconciled</Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search transactions..." className="pl-9 h-9" />
                        </div>
                        <Button variant="outline" size="sm"><RefreshCcw className="w-4 h-4" /></Button>
                    </div>
                </CardHeader>
                <ScrollArea className="h-[600px]">
                    <CardContent className="p-0">
                        {loadingTrx ? (
                            <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {unreconciledTrx.map((trx: any) => (
                                    <div
                                        key={trx.id}
                                        className={`p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors ${selectedTransactions.includes(trx.id) ? 'bg-green-50/50' : ''}`}
                                    >
                                        <Checkbox
                                            checked={selectedTransactions.includes(trx.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedTransactions([...selectedTransactions, trx.id]);
                                                else setSelectedTransactions(selectedTransactions.filter(id => id !== trx.id));
                                            }}
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-sm">{trx.reference}</span>
                                                <span className="font-mono font-bold">{parseFloat(trx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                                <div className="flex gap-2">
                                                    <span>{new Date(trx.transactionDate).toLocaleDateString()}</span>
                                                    <Badge variant="secondary" className="text-[9px] h-4 py-0">{trx.sourceModule}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </ScrollArea>

                {/* Matching Bar */}
                <CardFooter className="p-4 border-t bg-muted/10">
                    <div className="w-full space-y-3">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span>Matched Amount:</span>
                            <span className={Math.abs(diff) < 0.01 ? 'text-green-600' : 'text-orange-600'}>
                                {totalSelectedTrxAmount.toLocaleString()} / {parseFloat(currentLineAmount || "0").toLocaleString()}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => { setSelectedStatementLine(null); setSelectedTransactions([]); }}
                            >
                                Clear
                            </Button>
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                disabled={!selectedStatementLine || selectedTransactions.length === 0 || Math.abs(diff) > 0.01 || matchMutation.isPending}
                                onClick={() => matchMutation.mutate()}
                            >
                                {matchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                Complete Match
                            </Button>
                        </div>
                        {Math.abs(diff) > 0.01 && selectedStatementLine && selectedTransactions.length > 0 && (
                            <p className="text-[10px] text-orange-500 text-center flex items-center justify-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Difference of {diff.toLocaleString()} must be resolved
                            </p>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

function CardFooter({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`p-4 focus-visible:outline-none ${className}`}>{children}</div>;
}
