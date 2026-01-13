import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3 } from "lucide-react";

interface Props {
    onViewChange: (view: string) => void;
}

export function ProcurementDashboard({ onViewChange }: Props) {
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

    // Analytics Helpers
    const spendBySupplier = suppliers.map((s: any) => {
        const spend = pos.filter((p: any) => (p.supplierId === s.id || p.supplier?.id === s.id) && p.status !== 'Cancelled').reduce((sum: number, p: any) => sum + Number(p.totalAmount || p.amount), 0);
        return { name: s.supplierName, amount: spend };
    }).filter((s: any) => s.amount > 0);

    const poStatusData = [
        { name: 'Draft', value: pos.filter((p: any) => p.status === 'Draft').length, color: '#94a3b8' },
        { name: 'Open', value: pos.filter((p: any) => p.status === 'Open').length, color: '#3b82f6' },
        { name: 'Closed', value: pos.filter((p: any) => p.status === 'Closed').length, color: '#22c55e' },
    ].filter(d => d.value > 0);

    const openPos = pos.filter((p: any) => p.status === 'Open').length;
    const pendingReceipts = pos.filter((p: any) => p.status === 'Open' && p.lines?.some((l: any) => Number(l.quantityReceived) < Number(l.quantity))).length;
    const draftInvoices = invoices.filter((i: any) => i.status === 'Draft').length;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover-elevate transform transition-all hover:scale-[1.01] cursor-pointer" onClick={() => onViewChange('pos')}>
                    <CardHeader className="p-4"><CardTitle className="text-sm font-medium text-muted-foreground">Open Orders</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{openPos}</div></CardContent>
                </Card>
                <Card className="hover-elevate transform transition-all hover:scale-[1.01] cursor-pointer" onClick={() => onViewChange('receiving')}>
                    <CardHeader className="p-4"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Receipts</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{pendingReceipts}</div></CardContent>
                </Card>
                <Card className="hover-elevate transform transition-all hover:scale-[1.01] cursor-pointer" onClick={() => onViewChange('invoices')}>
                    <CardHeader className="p-4"><CardTitle className="text-sm font-medium text-muted-foreground">Draft Invoices</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{draftInvoices}</div></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader><CardTitle>Spend by Supplier</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        {spendBySupplier.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={spendBySupplier}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis prefix="$" fontSize={12} />
                                    <Tooltip />
                                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-muted-foreground">No spend data available</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>PO Status Breakdown</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        {poStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={poStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {poStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-muted-foreground">No PO data available</div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
