import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
    Activity, Clock, AlertTriangle, CheckCircle2
} from "lucide-react";
import type { WipBalance } from "@shared/schema";
import { StandardPage } from "@/components/layout/StandardPage";

export default function WIPDashboard() {
    // Fetch Data
    const [page, setPage] = useState(0);
    const limit = 50;

    const { data } = useQuery<{ items: WipBalance[], total: number }>({
        queryKey: ["/api/manufacturing/wip-balances", page, limit],
        queryFn: async () => {
            const res = await fetch(`/api/manufacturing/wip-balances?limit=${limit}&offset=${page * limit}`);
            if (!res.ok) throw new Error("Failed to fetch WIP balances");
            return res.json();
        }
    });

    const wipBalances = data?.items || [];
    const totalItems = data?.total || 0;

    // Mock trend data for chart
    const trendData = [
        { name: "Mon", material: 4000, labor: 2400, overhead: 1400 },
        { name: "Tue", material: 3000, labor: 1398, overhead: 2210 },
        { name: "Wed", material: 2000, labor: 9800, overhead: 2290 },
        { name: "Thu", material: 2780, labor: 3908, overhead: 2000 },
        { name: "Fri", material: 1890, labor: 4800, overhead: 2181 },
    ];

    const columns: Column<WipBalance>[] = [
        { header: "Order ID", accessorKey: "productionOrderId" },
        {
            header: "Total Balance",
            accessorKey: "balance",
            cell: (row) => `$${Number(row.balance).toFixed(2)}`
        },
        {
            header: "Last Updated",
            accessorKey: "lastUpdated",
            cell: (row) => new Date(row.lastUpdated!).toLocaleString()
        }
    ];

    return (
        <StandardPage
            title="WIP Valuation Dashboard"
            breadcrumbs={[
                { label: "Manufacturing", href: "/manufacturing" },
                { label: "Financials" },
                { label: "WIP Dashboard" }
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total WIP Value</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$42,300</div>
                        <p className="text-xs text-muted-foreground">Across 12 open orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aging WIP (&gt;30d)</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12,400</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Variances</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">High yield losses detected</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absorbed Cost</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$8,920</div>
                        <p className="text-xs text-muted-foreground">MTD Labor/OH absorption</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>WIP Value Progression</CardTitle>
                        <CardDescription>Daily breakdown of WIP by cost type.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="material" name="Material" fill="#3b82f6" stackId="a" />
                                <Bar dataKey="labor" name="Labor" fill="#10b981" stackId="a" />
                                <Bar dataKey="overhead" name="Overhead" fill="#8b5cf6" stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Open Order WIP Balances</CardTitle>
                        <CardDescription>Detailed financial standing of manufacturing orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StandardTable
                            columns={columns}
                            data={wipBalances}
                            page={page}
                            onPageChange={setPage}
                            totalItems={totalItems}
                            itemsPerPage={limit}
                        />
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
