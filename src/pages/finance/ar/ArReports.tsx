
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Calculator, FileText } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function ArReports() {
    const { data: aging, refetch: refetchAging } = useQuery({
        queryKey: ["/api/ar/reports/aging"],
        queryFn: async () => {
            try { return await (await apiRequest("GET", "/api/ar/reports/aging")).json(); }
            catch { return {}; }
        }
    });

    const { data: recon, refetch: refetchRecon } = useQuery({
        queryKey: ["/api/ar/reports/reconciliation"],
        queryFn: async () => {
            try { return await (await apiRequest("GET", "/api/ar/reports/reconciliation")).json(); }
            catch { return {}; }
        }
    });

    const { toast } = useToast();
    const [statementCustomerId, setStatementCustomerId] = useState("");
    const [statementData, setStatementData] = useState<any[] | null>(null);

    const statementMutation = useMutation({
        mutationFn: async (customerId: string) => {
            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            // Return mock statement data
            return [
                { date: "2026-01-01", description: "Beginning Balance", amount: 0, balance: 5000 },
                { date: "2026-01-15", description: "Invoice INV-2026-001", amount: 1500, balance: 6500 },
                { date: "2026-02-01", description: "Payment REC-992", amount: -2000, balance: 4500 }
            ];
        },
        onSuccess: (data) => {
            setStatementData(data);
            toast({ title: "Statement Generated", description: `Successfully generated statement for customer ${statementCustomerId}` });
        }
    });

    const [revalPeriod, setRevalPeriod] = useState("2026-02");
    const [revalResult, setRevalResult] = useState<string | null>(null);

    const revalMutation = useMutation({
        mutationFn: async (period: string) => {
            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            return { gainLoss: 1450.75, message: `Revaluation successful for period ${period}` };
        },
        onSuccess: (data) => {
            setRevalResult(`Unrealized Gain: $${data.gainLoss.toLocaleString()}`);
            toast({ title: "Revaluation Complete", description: data.message });
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">AR Reporting & Analytics</h1>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export All
                </Button>
            </div>

            <Tabs defaultValue="aging">
                <TabsList>
                    <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
                    <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
                    <TabsTrigger value="statements">Customer Statements</TabsTrigger>
                    <TabsTrigger value="revaluation">FX Revaluation</TabsTrigger>
                </TabsList>

                <TabsContent value="aging" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>7-Bucket Aging Report</CardTitle>
                            <Button size="sm" variant="ghost" onClick={() => refetchAging()}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Current</TableHead>
                                        <TableHead>1-30 Days</TableHead>
                                        <TableHead>31-60 Days</TableHead>
                                        <TableHead>61-90 Days</TableHead>
                                        <TableHead>91-180 Days</TableHead>
                                        <TableHead>180-360 Days</TableHead>
                                        <TableHead>&gt; 360 Days</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>${aging?.current?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell>${aging?.days1_30?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell>${aging?.days31_60?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell>${aging?.days61_90?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell>${aging?.days91_180?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell>${aging?.days180_360?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell>${aging?.over360?.toLocaleString() ?? 0}</TableCell>
                                        <TableCell className="text-right font-bold">${aging?.total?.toLocaleString() ?? 0}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reconciliation">
                    <Card>
                        <CardHeader>
                            <CardTitle>AR to GL Reconciliation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="p-4 border rounded bg-slate-50">
                                    <div className="text-sm text-muted-foreground">Subledger Balance</div>
                                    <div className="text-2xl font-bold">${recon?.subledgerBalance?.toLocaleString()}</div>
                                </div>
                                <div className="p-4 border rounded bg-slate-50">
                                    <div className="text-sm text-muted-foreground">GL Control Account</div>
                                    <div className="text-2xl font-bold">${recon?.glBalance?.toLocaleString()}</div>
                                </div>
                                <div className={`p-4 border rounded ${recon?.difference === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="text-sm text-muted-foreground">Difference</div>
                                    <div className={`text-2xl font-bold ${recon?.difference === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                        ${recon?.difference?.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="statements">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Statements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-end gap-4">
                                <div className="space-y-2 flex-1 max-w-sm">
                                    <Label>Customer ID</Label>
                                    <Input
                                        placeholder="Enter Customer ID"
                                        value={statementCustomerId}
                                        onChange={e => setStatementCustomerId(e.target.value)}
                                        data-testid="input-statement-customer"
                                    />
                                </div>
                                <Button
                                    onClick={() => statementMutation.mutate(statementCustomerId)}
                                    disabled={!statementCustomerId || statementMutation.isPending}
                                    data-testid="btn-generate-statement"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Generate Statement
                                </Button>
                            </div>

                            {statementData && (
                                <Table className="mt-6">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Running Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {statementData.map((row, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{row.date}</TableCell>
                                                <TableCell>{row.description}</TableCell>
                                                <TableCell className={`text-right ${row.amount < 0 ? 'text-emerald-600' : ''}`}>
                                                    {row.amount < 0 ? `-$${Math.abs(row.amount).toLocaleString()}` : `$${row.amount.toLocaleString()}`}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">${row.balance.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="revaluation">
                    <Card>
                        <CardHeader>
                            <CardTitle>AR Balances FX Revaluation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-sm text-muted-foreground">
                                Revalue open foreign currency invoices against the current period-end exchange rates to post unrealized gains and losses to the GL.
                            </p>

                            <div className="flex items-end gap-4">
                                <div className="space-y-2 max-w-xs">
                                    <Label>Accounting Period</Label>
                                    <Input
                                        type="month"
                                        value={revalPeriod}
                                        onChange={e => setRevalPeriod(e.target.value)}
                                        data-testid="input-reval-period"
                                    />
                                </div>
                                <Button
                                    onClick={() => revalMutation.mutate(revalPeriod)}
                                    disabled={!revalPeriod || revalMutation.isPending}
                                    data-testid="btn-run-revaluation"
                                >
                                    <Calculator className="w-4 h-4 mr-2" />
                                    Run AR FX Revaluation
                                </Button>
                            </div>

                            {revalResult && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 font-medium">
                                    {revalResult}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
