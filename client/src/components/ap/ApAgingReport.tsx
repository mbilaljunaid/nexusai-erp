import { useQuery } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Loader2, TrendingDown, AlertTriangle } from "lucide-react";

export default function ApAgingReport() {
    const { data: agingData, isLoading } = useQuery<any[]>({
        queryKey: ["/api/ap/reports/aging"]
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Prepare chart data
    const totals = {
        current: 0,
        days1_30: 0,
        days31_60: 0,
        days61_90: 0,
        daysOver90: 0
    };

    agingData?.forEach(row => {
        totals.current += Number(row.current);
        totals.days1_30 += Number(row.days1_30);
        totals.days31_60 += Number(row.days31_60);
        totals.days61_90 += Number(row.days61_90);
        totals.daysOver90 += Number(row.daysOver90);
    });

    const chartData = [
        { name: 'Current', value: totals.current, color: '#10b981' },
        { name: '1-30 Days', value: totals.days1_30, color: '#3b82f6' },
        { name: '31-60 Days', value: totals.days31_60, color: '#f59e0b' },
        { name: '61-90 Days', value: totals.days61_90, color: '#ef4444' },
        { name: '90+ Days', value: totals.daysOver90, color: '#7f1d1d' },
    ];

    const totalOutstanding = chartData.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Liabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <TrendingDown className="h-3 w-3 text-green-500" />
                            Accounts Payable Balance
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Past Due (&gt; 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                            ${(totals.days31_60 + totals.days61_90 + totals.daysOver90).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-red-600/70 mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Requires Immediate Attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Aging Summary</CardTitle>
                    <CardDescription>Outstanding payables by age bucket</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                                <Tooltip
                                    formatter={(v: any) => [`$${v.toLocaleString()}`, 'Amount']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Supplier Aging Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Supplier</TableHead>
                                <TableHead className="text-right">Current</TableHead>
                                <TableHead className="text-right">1-30 Days</TableHead>
                                <TableHead className="text-right">31-60 Days</TableHead>
                                <TableHead className="text-right">61-90 Days</TableHead>
                                <TableHead className="text-right">90+ Days</TableHead>
                                <TableHead className="text-right font-bold">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agingData?.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{row.supplierName}</TableCell>
                                    <TableCell className="text-right">${Number(row.current).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">${Number(row.days1_30).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">${Number(row.days31_60).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">${Number(row.days61_90).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">${Number(row.daysOver90).toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-bold text-primary">
                                        ${Number(row.total).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {agingData?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No outstanding payables found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
