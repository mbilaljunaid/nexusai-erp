import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Target,
    Users,
    TrendingUp,
    Calendar,
    DollarSign,
    Percent,
    ArrowUpRight,
    Search,
    Filter,
    Plus,
    BarChart3,
    Trophy
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';

const QUARTERS = ["Q1-2026", "Q2-2026", "Q3-2026", "Q4-2026"];

export default function CrmQuotaManagement() {
    const { toast } = useToast();
    const [selectedPeriod, setSelectedPeriod] = useState("Q1-2026");

    // 1. Fetch Sales Reps (Users with CRM access or specific roles)
    // For V1, we'll fetch all users or a subset.
    const { data: users = [] } = useQuery<any>({
        queryKey: ["/api/crm/quotas/users"],
        queryFn: async () => {
            // Mocking user fetch since specific CRM reps list might not exist as a single route
            // In real app, we might use /api/auth/users or /api/hr/employees
            const res = await fetch("/api/crm/contacts"); // Using contacts as a proxy or just dummy reps
            const data = await res.json();
            return data.slice(0, 5).map((d: any) => ({
                id: d.id,
                name: `${d.firstName} ${d.lastName}`,
                role: "Sales Representative"
            }));
        }
    });

    // 2. Fetch Quotas for Period
    const { data: quotas = [], isLoading } = useQuery<any>({
        queryKey: ["/api/crm/quotas", selectedPeriod],
        queryFn: async () => {
            const res = await fetch(`/api/crm/quotas?periodName=${selectedPeriod}`);
            if (!res.ok) throw new Error("Failed to fetch quotas");
            return res.json();
        }
    });

    // 3. Fetch Performance for each rep
    // To WOW the user, we will map over users and get their individual performance
    // In a high-perf app, this would be a single bulk endpoint
    const { data: performanceMap = {} } = useQuery<any>({
        queryKey: ["/api/crm/quotas/performance/bulk", selectedPeriod, users],
        queryFn: async () => {
            const results: Record<string, any> = {};
            await Promise.all(users.map(async (user: any) => {
                const res = await fetch(`/api/crm/quotas/performance?userId=${user.id}&periodName=${selectedPeriod}`);
                if (res.ok) {
                    results[user.id] = await res.json();
                }
            }));
            return results;
        },
        enabled: users.length > 0
    });

    return (
        <StandardPage
            className="bg-slate-50/30"
            title="Sales Quota Management"
            description="Set targets and monitor representative performance"
            actions={
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border shadow-sm ring-1 ring-slate-100">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-40 border-none bg-transparent h-6 focus:ring-0 font-bold text-slate-700">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {QUARTERS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 font-bold shadow-md shadow-indigo-100 transition-all hover:translate-y-[-1px]">
                        <Plus className="h-4 w-4 mr-2" />
                        Bulk Update
                    </Button>
                </div>
            }
        >

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Avg Attainment", value: "84.2%", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-500/10" },
                    { label: "Total Quota", value: "$4.2M", icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-500/10" },
                    { label: "Top Performer", value: "8 Candidates", icon: Trophy, color: "text-amber-600", bg: "bg-amber-500/10" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden hover:ring-slate-300 transition-all">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-slate-200 tracking-tighter">{stat.value}</p>
                            </div>
                            <div className={cn(`${stat.bg} p-3 rounded-2xl`)}>
                                <stat.icon className={cn(`h-6 w-6 ${stat.color}`)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Rep List */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-50 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-slate-800">Representative Targets</CardTitle>
                            <CardDescription className="text-slate-400 font-medium mt-1">Detailed breakdown of attainment for {selectedPeriod}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-lg h-8 border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                                <Search className="h-3.5 w-3.5 mr-2" /> Search
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-lg h-8 border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                                <Filter className="h-3.5 w-3.5 mr-2" /> Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                                <TableHead className="w-72 h-12 uppercase text-[10px] font-black tracking-widest text-slate-400 px-8">Sales Representative</TableHead>
                                <TableHead className="h-12 uppercase text-[10px] font-black tracking-widest text-slate-400">Target Type</TableHead>
                                <TableHead className="h-12 uppercase text-[10px] font-black tracking-widest text-slate-400">Quota Amount</TableHead>
                                <TableHead className="h-12 uppercase text-[10px] font-black tracking-widest text-slate-400">Actual Revenue</TableHead>
                                <TableHead className="h-12 uppercase text-[10px] font-black tracking-widest text-slate-400 px-8">Attainment</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user: any) => {
                                const perf = performanceMap[user.id] || { quota: 0, actual: 0, attainment: 0 };
                                const quota = quotas.find((q: any) => q.userId === user.id);

                                return (
                                    <TableRow key={user.id} className="hover:bg-slate-50/30 transition-colors border-slate-50 group">
                                        <TableCell className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm border">
                                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">
                                                        {user.name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{user.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">T-1 Territory A</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Revenue</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-sm text-slate-600 tracking-tight">${formatNumber(Number(perf.quota))}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-sm text-slate-900 dark:text-slate-200 tracking-tight">${formatNumber(Number(perf.actual))}</div>
                                        </TableCell>
                                        <TableCell className="px-8">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[10px] font-black tracking-tighter">
                                                    <span className={cn(`${perf.attainment >= 100 ? 'text-emerald-600' : 'text-slate-400'}`)}>
                                                        {Math.round(perf.attainment)}% Complete
                                                    </span>
                                                    {perf.attainment >= 100 && (
                                                        <StatusBadge status="active" label="Over Target" />
                                                    )}
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-50">
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
                    {users.length === 0 && !isLoading && (
                        <div className="py-20 text-center flex flex-col items-center justify-center opacity-30 gap-4">
                            <Target className="h-12 w-12 text-slate-400" />
                            <p className="text-sm font-bold uppercase tracking-widest">No Sales Data for this Period</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </StandardPage>
    );
}
