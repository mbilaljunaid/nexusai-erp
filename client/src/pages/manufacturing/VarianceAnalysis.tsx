import { useQuery } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts";
import {
    AlertCircle, ArrowUpRight, ArrowDownRight, FileSpreadsheet
} from "lucide-react";
import type { VarianceJournal } from "@shared/schema";

export default function VarianceAnalysis() {
    // Fetch Data
    const { data: journals = [] } = useQuery<VarianceJournal[]>({
        queryKey: ["/api/manufacturing/variance-journals"]
    });

    // Chart Data
    const varianceSummary = [
        { name: "Material Usage", value: 4500, color: "#3b82f6" },
        { name: "Labor Efficiency", value: 2100, color: "#10b981" },
        { name: "Overhead Volume", value: 1200, color: "#8b5cf6" },
        { name: "Yield Variance", value: 800, color: "#f59e0b" },
    ];

    const columns: Column<VarianceJournal>[] = [
        { header: "Order ID", accessorKey: "productionOrderId" },
        { header: "Type", accessorKey: "varianceType" },
        {
            header: "Amount",
            accessorKey: "amount",
            cell: ({ row }) => (
                <span className={Number(row.original.amount) > 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                    ${Number(row.original.amount).toFixed(2)}
                </span>
            )
        },
        { header: "Description", accessorKey: "description" },
        {
            header: "GL Posted",
            accessorKey: "glPosted",
            cell: ({ row }) => row.original.glPosted ? "✅" : "⏳"
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Variance Analysis</h1>
                    <p className="text-muted-foreground">Monitor and investigate manufacturing cost deviations.</p>
                </div>
                <div className="flex gap-2">
                    <Card className="px-4 py-2 flex flex-row items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-full">
                            <ArrowUpRight className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Net Variance</p>
                            <p className="text-xl font-bold text-red-600">+$8,600</p>
                        </div>
                    </Card>
                    <Card className="px-4 py-2 flex flex-row items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <ArrowDownRight className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Recovered</p>
                            <p className="text-xl font-bold text-green-600">-$1,200</p>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Variance Distribution</CardTitle>
                        <CardDescription>Breakdown by variance category.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={varianceSummary}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {varianceSummary.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Variance Journals</CardTitle>
                            <CardDescription>System-generated postings for cost deviations.</CardDescription>
                        </div>
                        <FileSpreadsheet className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
                    </CardHeader>
                    <CardContent>
                        <StandardTable
                            columns={columns}
                            data={journals}
                        />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-red-200 bg-red-50/20">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-red-900">Critical Yield Alerts</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">Order #WO-2024-00{i} - Significant Waste</p>
                                    <p className="text-xs text-muted-foreground">Work Center: CC-STAMPING-01. Actual usage 25% above standard.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-red-600">+$2,450.00</p>
                                    <p className="text-[10px] text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
