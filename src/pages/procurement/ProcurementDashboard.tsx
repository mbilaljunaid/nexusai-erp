import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { ShoppingCart, Truck, DollarSign, BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ProcurementDashboard() {
    const { data: pos = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/purchase-orders"],
        queryFn: () => fetch("/api/procurement/purchase-orders").then(r => r.json()).catch(() => [])
    });

    const { data: suppliers = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/suppliers"],
        queryFn: () => fetch("/api/procurement/suppliers").then(r => r.json()).catch(() => [])
    });

    const { data: invoices = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/ap/invoices"],
        queryFn: () => fetch("/api/procurement/ap/invoices").then(r => r.json()).catch(() => [])
    });

    // KPI Calculations
    const openOrdersCount = pos.filter(p => p.status === 'Open').length;
    const pendingReceiptsCount = pos.filter(p => p.status === 'Open' && p.lines?.some((l: any) => Number(l.quantityReceived) < Number(l.quantity))).length;
    const draftInvoicesCount = invoices.filter(i => i.status === 'Draft').length;

    // Chart Data Preparation
    const spendBySupplier = suppliers.map((s: any) => {
        const spend = pos
            .filter((p: any) => (p.supplierId === s.id || p.supplier?.id === s.id) && p.status !== 'Cancelled')
            .reduce((sum: number, p: any) => sum + Number(p.totalAmount || p.amount || 0), 0);
        return { name: s.supplierName, amount: spend };
    }).filter((s: any) => s.amount > 0).slice(0, 10); // Top 10

    const poStatusData = [
        { name: 'Draft', value: pos.filter(p => p.status === 'Draft').length, color: '#94a3b8' },
        { name: 'Open', value: pos.filter(p => p.status === 'Open').length, color: '#3b82f6' },
        { name: 'Closed', value: pos.filter(p => p.status === 'Closed').length, color: '#22c55e' },
    ].filter(d => d.value > 0);

    return (
        <StandardDashboard
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Procurement Overview</h1>
                        <p className="text-muted-foreground mt-2">
                            Monitor metrics, analyze spend, and manage supply chain operations.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/procurement/orders/new">
                            <Button>
                                <ShoppingCart className="mr-2 h-4 w-4" /> Create Order
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            {/* KPI Widgets */}
            <DashboardWidget title="Open Orders" action={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}>
                <div className="flex flex-col gap-1">
                    <span className="text-2xl font-bold">{openOrdersCount}</span>
                    <span className="text-xs text-muted-foreground">Active purchase orders</span>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Pending Receipts" action={<Truck className="h-4 w-4 text-muted-foreground" />}>
                <div className="flex flex-col gap-1">
                    <span className="text-2xl font-bold">{pendingReceiptsCount}</span>
                    <span className="text-xs text-muted-foreground">Orders awaiting delivery</span>
                </div>
            </DashboardWidget>

            <DashboardWidget title="Draft Invoices" action={<DollarSign className="h-4 w-4 text-muted-foreground" />}>
                <div className="flex flex-col gap-1">
                    <span className="text-2xl font-bold">{draftInvoicesCount}</span>
                    <span className="text-xs text-muted-foreground">Invoices pending validation</span>
                </div>
            </DashboardWidget>

            <DashboardWidget title="System Status" action={<AlertCircle className="h-4 w-4 text-green-500" />}>
                <div className="flex flex-col gap-1">
                    <span className="text-2xl font-bold text-green-600">Healthy</span>
                    <span className="text-xs text-muted-foreground">All systems operational</span>
                </div>
            </DashboardWidget>

            {/* Charts */}
            <DashboardWidget colSpan={2} title="Spend by Supplier">
                <div className="h-[300px] w-full">
                    {spendBySupplier.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={spendBySupplier}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                                />
                                <YAxis
                                    prefix="$"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No spend data available
                        </div>
                    )}
                </div>
            </DashboardWidget>

            <DashboardWidget colSpan={2} title="Order Status Breakdown">
                <div className="h-[300px] w-full">
                    {poStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={poStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {poStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No order data available
                        </div>
                    )}
                </div>
            </DashboardWidget>
        </StandardDashboard>
    );
}
