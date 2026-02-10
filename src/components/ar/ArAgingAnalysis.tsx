import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api"; // Assuming we might mock this or add an endpoint later
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface AgingBucket {
    bucket: string;
    amount: number;
    count: number;
    color: string;
}

interface ArAgingAnalysisProps {
    customerId: string;
}

export function ArAgingAnalysis({ customerId }: ArAgingAnalysisProps) {
    // In a real scenario, we'd fetch this from /api/ar/customers/:id/aging
    // For now, we'll simulate or use a mock query if the endpoint doesn't exist yet
    // mocking existing endpoint behavior for now
    const { data, isLoading } = useQuery({
        queryKey: ["/api/ar/customers", customerId, "aging"],
        queryFn: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            return [
                { bucket: "Current", amount: 12500.00, count: 5, color: "#10b981" },
                { bucket: "1-30 Days", amount: 4200.50, count: 2, color: "#f59e0b" },
                { bucket: "31-60 Days", amount: 1200.00, count: 1, color: "#f97316" },
                { bucket: "61-90 Days", amount: 0, count: 0, color: "#ef4444" },
                { bucket: "90+ Days", amount: 500.00, count: 1, color: "#7f1d1d" },
            ] as AgingBucket[];
        }
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-[150px] w-full rounded-xl" />
            </div>
        );
    }

    const totalOutstanding = data?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

    return (
        <div className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Outstanding</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">${totalOutstanding.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ${(totalOutstanding - (data?.find(b => b.bucket === "Current")?.amount || 0)).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">Aging Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="amount"
                            >
                                {data?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `$${value.toLocaleString()}`}
                                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Aging Bucket</TableHead>
                        <TableHead className="text-right">Invoice Count</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.map((bucket) => (
                        <TableRow key={bucket.bucket}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bucket.color }} />
                                    <span className="font-medium text-xs">{bucket.bucket}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">{bucket.count}</TableCell>
                            <TableCell className="text-right font-bold">
                                ${bucket.amount.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
