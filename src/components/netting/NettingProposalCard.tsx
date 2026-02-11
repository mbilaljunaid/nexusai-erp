import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, ArrowLeft, TrendingDown, DollarSign, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface NettingProposalProps {
    proposal: {
        batchId?: string;
        entityA: {
            id: string;
            name: string;
            owes: number; // What A owes to B
        };
        entityB: {
            id: string;
            name: string;
            owes: number; // What B owes to A
        };
        netSettlement: {
            payer: string;
            payee: string;
            amount: number;
        };
        currency: string;
        transactions?: Array<{
            id: string;
            invoiceNumber: string;
            from: string;
            to: string;
            amount: number;
            dueDate: string;
        }>;
        optimization?: {
            paymentsReduced: number;
            originalPaymentCount: number;
            fxSavings?: number;
        };
    };
}

export function NettingProposalCard({ proposal }: NettingProposalProps) {
    const { entityA, entityB, netSettlement, currency, transactions = [], optimization } = proposal;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD"
        }).format(amount);
    };

    const grossTotal = entityA.owes + entityB.owes;
    const reductionPercentage = optimization
        ? Math.round((1 - (1 / optimization.originalPaymentCount)) * 100)
        : Math.round((netSettlement.amount / grossTotal) * 100);

    return (
        <div className="space-y-6">
            {/* Visual Flow Diagram */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Netting Proposal
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Entity A → Entity B */}
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex-1">
                                <p className="font-semibold text-lg">{entityA.name}</p>
                                <Badge variant="outline" className="mt-1">Entity A</Badge>
                            </div>
                            <div className="flex flex-col items-center flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <ArrowRight className="h-5 w-5 text-blue-500" />
                                    <span className="text-sm font-medium text-blue-600">
                                        Owes {formatCurrency(entityA.owes)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ArrowLeft className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-medium text-green-600">
                                        Owes {formatCurrency(entityB.owes)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 text-right">
                                <p className="font-semibold text-lg">{entityB.name}</p>
                                <Badge variant="outline" className="mt-1">Entity B</Badge>
                            </div>
                        </div>

                        {/* Net Settlement */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-dashed"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-background px-4 text-sm font-medium text-muted-foreground">
                                    NETS TO
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Net Payer</p>
                                    <p className="font-bold text-lg">{netSettlement.payer}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ArrowRight className="h-6 w-6 text-primary" />
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-primary">
                                            {formatCurrency(netSettlement.amount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Net Settlement</p>
                                    </div>
                                    <ArrowRight className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Net Payee</p>
                                    <p className="font-bold text-lg">{netSettlement.payee}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Optimization Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <TrendingDown className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground uppercase">Payment Reduction</p>
                                <p className="text-2xl font-bold text-green-600">{reductionPercentage}%</p>
                            </div>
                        </div>
                        <Progress value={reductionPercentage} className="mt-3 h-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <ArrowRight className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground uppercase">Transactions</p>
                                <p className="text-2xl font-bold">
                                    {optimization?.originalPaymentCount || transactions.length} → 1
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {((optimization?.originalPaymentCount || transactions.length) - 1)} payments eliminated
                        </p>
                    </CardContent>
                </Card>

                {optimization?.fxSavings && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground uppercase">FX Savings</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {formatCurrency(optimization.fxSavings)}
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Estimated FX fee reduction</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Transaction Breakdown */}
            {transactions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Included Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Due Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((txn) => (
                                    <TableRow key={txn.id}>
                                        <TableCell className="font-mono text-sm">{txn.invoiceNumber}</TableCell>
                                        <TableCell>{txn.from}</TableCell>
                                        <TableCell>{txn.to}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(txn.amount)}
                                        </TableCell>
                                        <TableCell>{new Date(txn.dueDate).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="font-bold border-t-2">
                                    <TableCell colSpan={3}>GROSS TOTAL</TableCell>
                                    <TableCell className="text-right">{formatCurrency(grossTotal)}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow className="font-bold bg-primary/5">
                                    <TableCell colSpan={3}>NET SETTLEMENT</TableCell>
                                    <TableCell className="text-right text-primary">
                                        {formatCurrency(netSettlement.amount)}
                                    </TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
