import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    Target, Trophy, TrendingUp, Calendar, DollarSign, Search, Filter, Plus, Layers, MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';

const QUARTERS = ["Q1-2026", "Q2-2026", "Q3-2026", "Q4-2026"];

export default function CrmQuotaManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPeriod, setSelectedPeriod] = useState("Q1-2026");
    const [isAddMode, setIsAddMode] = useState(false);

    // Fetch mappings
    const { data: users = [] } = useQuery<any[]>({
        queryKey: ["/api/crm/contacts"], // Using contacts for demo
        queryFn: () => fetch("/api/crm/contacts").then(r => r.json()),
    });

    const { data: territories = [] } = useQuery<any[]>({
        queryKey: ["/api/crm/territories"],
        queryFn: () => fetch("/api/crm/territories").then(r => r.json()),
    });

    const { data: products = [] } = useQuery<any[]>({
        queryKey: ["/api/crm/products"],
        queryFn: () => fetch("/api/crm/products").then(r => r.json()),
    });

    // Fetch quotas
    const { data: quotas = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/crm/quotas", selectedPeriod],
        queryFn: async () => {
            const res = await fetch(`/api/crm/quotas?periodName=${selectedPeriod}`);
            if (!res.ok) throw new Error("Failed to fetch quotas");
            return res.json();
        }
    });

    // Extract performance for each quota row
    const { data: performanceMap = {} } = useQuery<any>({
        queryKey: ["/api/crm/quotas/performance/bulk", selectedPeriod, quotas],
        queryFn: async () => {
            const results: Record<string, any> = {};
            await Promise.all(quotas.map(async (quota: any) => {
                const res = await fetch(`/api/crm/quotas/performance?userId=${quota.userId}&periodName=${selectedPeriod}&territoryId=${quota.territoryId || ''}&productId=${quota.productId || ''}`);
                if (res.ok) {
                    results[quota.id] = await res.json();
                }
            }));
            return results;
        },
        enabled: quotas.length > 0
    });

    // Set up adding new quota
    const [newQuota, setNewQuota] = useState<any>({
        userId: "",
        territoryId: "none",
        productId: "none",
        quotaAmount: "",
        targetType: "Revenue"
    });

    const saveQuotaMutation = useMutation({
        mutationFn: (data: any) => {
            const payload = { ...data, periodName: selectedPeriod };
            if (payload.territoryId === "none") delete payload.territoryId;
            if (payload.productId === "none") delete payload.productId;
            return fetch("/api/crm/quotas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }).then(r => r.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/quotas", selectedPeriod] });
            setIsAddMode(false);
            setNewQuota({ userId: "", territoryId: "none", productId: "none", quotaAmount: "", targetType: "Revenue" });
            toast({ title: "Quota Saved" });
        }
    });

    const getUserName = (id: string) => {
        const u = users.find((u: any) => u.id === id);
        return u ? `${u.firstName} ${u.lastName}` : "Unknown Rep";
    };

    const getTerritoryName = (id: string | null) => {
        if (!id) return "All Territories";
        const t = territories.find((t: any) => t.id === id);
        return t ? t.name : "Unknown Territory";
    };

    const getProductName = (id: string | null) => {
        if (!id) return "All Products";
        const p = products.find((p: any) => p.id === id);
        return p ? p.name : "Unknown Product";
    };

    // Metrics
    const totalQuota = quotas.reduce((acc: number, q: any) => acc + Number(q.quotaAmount), 0) as number;
    const totalActual = Object.values(performanceMap).reduce((acc: number, param: any) => acc + Number(param.actual || 0), 0) as number;
    const avgAttainment = totalQuota > 0 ? ((totalActual / totalQuota) * 100).toFixed(1) : "0";

    return (
        <StandardPage
            className="bg-muted/50/30"
            title="Sales Quota Management"
            description="Align targets by Territory, Product, and Representative."
            actions={
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-xl border shadow-sm ring-1 ring-slate-100">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-40 border-none bg-transparent h-6 focus:ring-0 font-bold text-foreground/90">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {QUARTERS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <Dialog open={isAddMode} onOpenChange={setIsAddMode}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-4 font-bold shadow-md shadow-indigo-100 transition-all hover:translate-y-[-1px]">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Targeted Quota
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Targeted Quota</DialogTitle>
                                <DialogDescription>Assign a quota to a rep for a specific product or territory.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Sales Representative</Label>
                                    <Select value={newQuota.userId} onValueChange={v => setNewQuota({ ...newQuota, userId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Rep..." /></SelectTrigger>
                                        <SelectContent>
                                            {users.slice(0, 10).map((u: any) => <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Territory Override (Optional)</Label>
                                    <Select value={newQuota.territoryId} onValueChange={v => setNewQuota({ ...newQuota, territoryId: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">All Territories</SelectItem>
                                            {territories.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Product Override (Optional)</Label>
                                    <Select value={newQuota.productId} onValueChange={v => setNewQuota({ ...newQuota, productId: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">All Products</SelectItem>
                                            {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Target Type</Label>
                                        <Select value={newQuota.targetType} onValueChange={v => setNewQuota({ ...newQuota, targetType: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Revenue">Revenue ($)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Amount</Label>
                                        <Input type="number" value={newQuota.quotaAmount} onChange={e => setNewQuota({ ...newQuota, quotaAmount: e.target.value })} />
                                    </div>
                                </div>
                                <Button className="w-full mt-4" onClick={() => saveQuotaMutation.mutate(newQuota)} disabled={!newQuota.userId || !newQuota.quotaAmount}>
                                    Save Target Quota
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            }
        >

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Avg Attainment", value: `${avgAttainment}%`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-500/10" },
                    { label: "Total Quota", value: `$${formatNumber(totalQuota)}`, icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-500/10" },
                    { label: "Active Targets", value: quotas.length, icon: Target, color: "text-amber-600", bg: "bg-amber-500/10" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden hover:ring-slate-300 transition-all">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
                                <p className="text-2xl font-black text-foreground dark:text-slate-200 tracking-tighter">{stat.value}</p>
                            </div>
                            <div className={cn(`${stat.bg} p-3 rounded-2xl`)}>
                                <stat.icon className={cn(`h-6 w-6 ${stat.color}`)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quota Grid */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden bg-card mt-6">
                <CardHeader className="border-b border-slate-50 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-foreground">Target Breakdowns</CardTitle>
                            <CardDescription className="text-muted-foreground/70 font-medium mt-1">Quotas mapped by rep, region, and product lines.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50/50 hover:bg-muted/50/50 border-border">
                                <TableHead className="w-64 h-12 uppercase text-[10px] font-black tracking-widest text-muted-foreground/70 px-8">Assignment</TableHead>
                                <TableHead className="h-12 uppercase text-[10px] font-black tracking-widest text-muted-foreground/70">Dimension (Territory/Product)</TableHead>
                                <TableHead className="h-12 uppercase text-[10px] font-black tracking-widest text-muted-foreground/70 cursor-pointer">Target</TableHead>
                                <TableHead className="h-12 uppercase text-[10px] font-black tracking-widest text-muted-foreground/70 text-right px-8">Attainment</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotas.map((quota: any) => {
                                const perf = performanceMap[quota.id] || { quota: Number(quota.quotaAmount) || 0, actual: 0, attainment: 0 };
                                const repName = getUserName(quota.userId);

                                return (
                                    <TableRow key={quota.id} className="hover:bg-muted/50/30 transition-colors border-slate-50 group">
                                        <TableCell className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm border">
                                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">
                                                        {repName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold text-sm text-foreground dark:text-slate-200 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{repName}</div>
                                                    <div className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">{quota.targetType} Target</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                                                    <span className="text-xs font-semibold">{getTerritoryName(quota.territoryId)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Layers className="h-3.5 w-3.5 text-indigo-500" />
                                                    <span className="text-xs font-semibold">{getProductName(quota.productId)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-sm text-foreground dark:text-slate-200 tracking-tight">${formatNumber(Number(perf.quota))}</div>
                                            <div className="text-xs text-muted-foreground font-medium mt-0.5">Actual: ${formatNumber(Number(perf.actual))}</div>
                                        </TableCell>
                                        <TableCell className="px-8 text-right">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[10px] font-black tracking-tighter">
                                                    <span className={cn(`${perf.attainment >= 100 ? 'text-emerald-600' : 'text-muted-foreground/70'}`)}>
                                                        {Math.round(perf.attainment)}% Complete
                                                    </span>
                                                    {perf.attainment >= 100 && (
                                                        <StatusBadge status="active" label="Over Target" />
                                                    )}
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner border border-slate-50">
                                                    <div
                                                        className={cn(`h-full rounded-full transition-all duration-1000 w-[var(--tw-progress-width)] ${perf.attainment >= 100 ? 'bg-emerald-500' :
                                                            perf.attainment >= 70 ? 'bg-indigo-500' : 'bg-amber-500'
                                                            }`)}
                                                        style={{ "--tw-progress-width": `${Math.min(perf.attainment, 100)}%` } as React.CSSProperties}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    {quotas.length === 0 && !isLoading && (
                        <div className="py-20 text-center flex flex-col items-center justify-center opacity-30 gap-4">
                            <Target className="h-12 w-12 text-muted-foreground/70" />
                            <p className="text-sm font-bold uppercase tracking-widest">No Quotas Defined for this Period</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </StandardPage>
    );
}
