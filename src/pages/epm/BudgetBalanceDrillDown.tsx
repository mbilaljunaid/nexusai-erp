import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronDown, FileSpreadsheet, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface BudgetBalance {
    ccid: string;
    accountName: string;
    budgeted: number;
    actual: number;
    consumed: number;
    remaining: number;
    variance: number;
    variancePct: number;
    hasChildren?: boolean;
    children?: BudgetBalance[];
}

interface Transaction {
    id: string;
    date: string;
    journalNumber: string;
    description: string;
    amount: number;
}

export default function BudgetBalanceDrillDown() {
    const [, params] = useRoute("/epm/budget-balances/:periodId");
    const periodId = (params as any)?.periodId ?? "Jan-2026";

    const [selectedPeriod, setSelectedPeriod] = useState<string>(periodId);
    const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

    // Fetch budget balances
    const { data: balances = [] } = useQuery<BudgetBalance[]>({
        queryKey: ["budget-balances", selectedPeriod],
        queryFn: async () => {
            const res = await fetch(`/api/gl/budget-balances?periodName=${selectedPeriod}`);
            return res.json();
        }
    });

    // Fetch transactions for drill-down
    const { data: transactions = [] } = useQuery<Transaction[]>({
        queryKey: ["budget-transactions", selectedAccount],
        queryFn: async () => {
            if (!selectedAccount) return [];
            const res = await fetch(`/api/gl/budget-balances/${selectedAccount}/transactions?periodName=${selectedPeriod}`);
            return res.json();
        },
        enabled: !!selectedAccount
    });

    const toggleExpand = (ccid: string) => {
        const newExpanded = new Set(expandedAccounts);
        if (newExpanded.has(ccid)) {
            newExpanded.delete(ccid);
        } else {
            newExpanded.add(ccid);
        }
        setExpandedAccounts(newExpanded);
    };

    const getStatusColor = (variancePct: number) => {
        if (variancePct <= -10) return "text-red-600 bg-red-50";
        if (variancePct <= -5) return "text-amber-600 bg-amber-50";
        if (variancePct >= 10) return "text-green-600 bg-green-50";
        return "text-gray-600 bg-gray-50";
    };

    const getStatusBadge = (variancePct: number) => {
        if (variancePct <= -10) return <Badge variant="destructive">Critical</Badge>;
        if (variancePct <= -5) return <StatusBadge status="warning" label="Warning" />;
        return <Badge variant="outline">On Track</Badge>;
    };

    // Calculate summary metrics
    const totalBudgeted = balances.reduce((sum, b) => sum + b.budgeted, 0);
    const totalActual = balances.reduce((sum, b) => sum + b.actual, 0);
    const totalRemaining = balances.reduce((sum, b) => sum + b.remaining, 0);
    const overBudgetCount = balances.filter(b => b.variance < 0).length;

    return (
        <StandardPage
            title="Budget Balance Drill-Down"
            description="Interactive budget exploration with transaction-level detail"
            breadcrumbs={[
                { label: "EPM", href: "/epm" },
                { label: "Budget Balances" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Total Budgeted</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">${(totalBudgeted / 1000000).toFixed(1)}M</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Actual Spend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">${(totalActual / 1000000).toFixed(1)}M</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Remaining</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">${(totalRemaining / 1000000).toFixed(1)}M</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Over Budget
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-900">{overBudgetCount}</div>
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
                                <SelectItem value="Q4-2025">Q4 2025</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export to Excel
                    </Button>
                </div>

                {/* Balance Table */}
                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader>
                        <CardTitle>Budget Balances - {selectedPeriod}</CardTitle>
                        <CardDescription>Click on an account to view transaction detail</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Budgeted</TableHead>
                                    <TableHead className="text-right">Actual</TableHead>
                                    <TableHead className="text-right">Consumed</TableHead>
                                    <TableHead className="text-right">Remaining</TableHead>
                                    <TableHead className="text-right">Variance</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {balances.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                            No budget data for selected period
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    balances.map((balance) => (
                                        <>
                                            <TableRow
                                                key={balance.ccid}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => setSelectedAccount(balance.ccid)}
                                            >
                                                <TableCell>
                                                    {balance.hasChildren && (
                                                        <button onClick={(e) => { e.stopPropagation(); toggleExpand(balance.ccid); }}>
                                                            {expandedAccounts.has(balance.ccid) ?
                                                                <ChevronDown className="h-4 w-4" /> :
                                                                <ChevronRight className="h-4 w-4" />
                                                            }
                                                        </button>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{balance.accountName}</TableCell>
                                                <TableCell className="text-right font-mono">${balance.budgeted.toLocaleString()}</TableCell>
                                                <TableCell className="text-right font-mono">${balance.actual.toLocaleString()}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    <span className={getStatusColor(balance.variancePct)}>
                                                        {balance.consumed.toFixed(0)}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">${balance.remaining.toLocaleString()}</TableCell>
                                                <TableCell className={`text-right font-mono flex items-center justify-end gap-1 ${balance.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {balance.variance < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                                                    ${Math.abs(balance.variance).toLocaleString()}
                                                    <span className="text-xs">({balance.variancePct.toFixed(1)}%)</span>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(balance.variancePct)}
                                                </TableCell>
                                            </TableRow>
                                            {expandedAccounts.has(balance.ccid) && balance.children?.map((child) => (
                                                <TableRow key={child.ccid} className="bg-muted/30">
                                                    <TableCell></TableCell>
                                                    <TableCell className="pl-8 text-sm">{child.accountName}</TableCell>
                                                    <TableCell className="text-right font-mono text-sm">${child.budgeted.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right font-mono text-sm">${child.actual.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right font-mono text-sm">{child.consumed.toFixed(0)}%</TableCell>
                                                    <TableCell className="text-right font-mono text-sm">${child.remaining.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right font-mono text-sm">${Math.abs(child.variance).toLocaleString()}</TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            ))}
                                        </>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Transaction Detail */}
                {selectedAccount && (
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle>Transaction Detail - {balances.find(b => b.ccid === selectedAccount)?.accountName}</CardTitle>
                            <CardDescription>Actual transactions for {selectedPeriod}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Journal</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                                                No transactions found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.map((txn) => (
                                            <TableRow key={txn.id}>
                                                <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                                                <TableCell><code className="text-xs">{txn.journalNumber}</code></TableCell>
                                                <TableCell>{txn.description}</TableCell>
                                                <TableCell className="text-right font-mono">${txn.amount.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
