import { formatDateTime } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    TrendingUp, AlertTriangle, Clock, Mail, Phone,
    Sparkles, Play, History, Filter, User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ArDunningTemplates } from "@/components/ar/ArDunningTemplates";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Progress } from "@/components/ui/progress";
import { StandardPage } from '@/components/layout/StandardPage';

export default function ArDunningWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [aiDraft, setAiDraft] = useState<string | null>(null);

    // Queries
    const { data: invoices = [], isLoading: loadingInvoices } = useQuery<any[]>({
        queryKey: ["/api/ar/invoices"],
    });

    const { data: tasks = [], isLoading: loadingTasks } = useQuery<any[]>({
        queryKey: ["/api/ar/collections/tasks"],
    });

    const { data: dunningRuns = [] } = useQuery<any[]>({
        queryKey: ["/api/ar/dunning/runs"],
        queryFn: () => fetch("/api/ar/dunning/runs").then(r => r.json()).catch(() => []),
    });

    const { data: customers } = useQuery<any>({
        queryKey: ["/api/ar/customers"],
        queryFn: () => fetch("/api/ar/customers").then(r => r.json()),
    });

    // Mutations
    const runDunningMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/ar/dunning/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
            if (!res.ok) throw new Error("Failed to trigger dunning run");
            return res.json();
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/collections/tasks"] });
            queryClient.invalidateQueries({ queryKey: ["/api/ar/dunning/runs"] });
            toast({ title: "Dunning Run Started", description: `Run ${data.runId} started asynchronously. Status: ${data.status}` });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const generateAiDraftMutation = useMutation({
        mutationFn: async (invoiceId: string) => {
            setSelectedInvoiceId(invoiceId);
            const res = await fetch(`/api/ar/collections/tasks/${invoiceId}/email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invoiceId })
            });
            if (!res.ok) throw new Error("Failed to generate AI draft");
            const data = await res.json();
            return data.emailBody;
        },
        onSuccess: (body: string) => {
            setAiDraft(body);
            toast({ title: "AI Draft Ready", description: "Email draft generated for collector review." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    // Safe Array Wrappers for 404 responses
    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeRuns = Array.isArray(dunningRuns) ? dunningRuns : [];

    // Aging Logic
    const agingBuckets = {
        current: safeInvoices.filter((i: any) => i.status === "Sent" && new Date(i.dueDate) > new Date()),
        "1-30": safeInvoices.filter((i: any) => i.status === "Overdue" && i.daysOverdue <= 30),
        "31-60": safeInvoices.filter((i: any) => i.status === "Overdue" && i.daysOverdue > 30 && i.daysOverdue <= 60),
        "61-90": safeInvoices.filter((i: any) => i.status === "Overdue" && i.daysOverdue > 60 && i.daysOverdue <= 90),
        "91+": safeInvoices.filter((i: any) => i.status === "Overdue" && i.daysOverdue > 90),
    };

    return (
        <StandardPage
            title="AR Dunning Workbench"
            description="Strategic Collections & Aging Optimization"
            actions={
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                        onClick={() => runDunningMutation.mutate()}
                        disabled={runDunningMutation.isPending}
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Execute Run
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg">
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Advisor
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">

                {/* Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <DashboardWidget title="Total Overdue" icon={AlertTriangle}>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-red-500">$142,500.00</span>
                            <span className="text-xs text-red-400">+5% vs last week</span>
                        </div>
                    </DashboardWidget>
                    <DashboardWidget title="DSO (Trend)" icon={Clock}>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-yellow-400">42 Days</span>
                            <span className="text-xs text-green-400">-2 days optimized</span>
                        </div>
                    </DashboardWidget>
                    <DashboardWidget title="Pending Tasks" icon={Filter}>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-white">{safeTasks.length}</span>
                            <span className="text-xs text-slate-500">Awaiting action</span>
                        </div>
                    </DashboardWidget>
                    <DashboardWidget title="Collection Effectiveness" icon={History}>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-green-400">92%</span>
                            <span className="text-xs text-green-400">Above target</span>
                        </div>
                    </DashboardWidget>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                    <TabsList className="bg-slate-900 border-slate-800 p-1">
                        <TabsTrigger value="dashboard" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Dashboard</TabsTrigger>
                        <TabsTrigger value="queue" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Collector Queue</TabsTrigger>
                        <TabsTrigger value="templates" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Dunning Templates</TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Run History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 bg-slate-900 border-slate-800 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-white">Aging Analysis</CardTitle>
                                    <CardDescription className="text-slate-400">Invoices bucketed by days past due</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {Object.entries(agingBuckets).map(([bucket, invs]) => (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-300 font-medium capitalize">{bucket} Days</span>
                                                    <span className="text-white font-bold">{(invs as any[]).length} Invoices</span>
                                                </div>
                                                <Progress
                                                    value={Math.min(100, (invs.length / (safeInvoices.length || 1)) * 100)}
                                                    className="h-2 bg-slate-800"
                                                    indicatorClassName={
                                                        bucket === 'current' ? 'bg-green-500' :
                                                            bucket === '1-30' ? 'bg-blue-500' :
                                                                bucket === '31-60' ? 'bg-yellow-500' :
                                                                    bucket === '61-90' ? 'bg-orange-500' : 'bg-red-500'
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900 border-slate-800 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-white">Risk Concentration</CardTitle>
                                    <CardDescription className="text-slate-400">Customer risk categories</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                                            <span className="text-sm text-slate-200 font-medium">High Risk</span>
                                        </div>
                                        <span className="text-lg font-bold text-red-500">12%</span>
                                    </div>
                                    <div className="p-4 bg-yellow-950/20 border border-yellow-900/40 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
                                            <span className="text-sm text-slate-200 font-medium">Medium Risk</span>
                                        </div>
                                        <span className="text-lg font-bold text-yellow-500">28%</span>
                                    </div>
                                    <div className="p-4 bg-green-950/20 border border-green-900/40 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                                            <span className="text-sm text-slate-200 font-medium">Low Risk</span>
                                        </div>
                                        <span className="text-lg font-bold text-green-500">60%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="queue">
                        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
                            <CardHeader className="bg-slate-900/50 border-b border-slate-800">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-white">Collector Action Queue</CardTitle>
                                        <CardDescription className="text-slate-400">Tasks generated by the dunning engine</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700">
                                            <Filter className="h-4 w-4 mr-2" />
                                            Filter
                                        </Button>
                                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                            <Mail className="h-4 w-4 mr-2" />
                                            Batch Email
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-900/50">
                                        <TableRow className="hover:bg-transparent border-slate-800">
                                            <TableHead className="text-slate-400">Customer</TableHead>
                                            <TableHead className="text-slate-400">Task Type</TableHead>
                                            <TableHead className="text-slate-400">Priority</TableHead>
                                            <TableHead className="text-slate-400">Status</TableHead>
                                            <TableHead className="text-slate-400 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {safeTasks.map((task: any) => (
                                            <TableRow key={task.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                                                <TableCell className="font-medium text-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-slate-500" />
                                                        {customers?.find((c: any) => c.id === task.customerId)?.name || task.customerId}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-slate-950 border-slate-700 text-slate-300">
                                                        {task.taskType === 'Email' ? <Mail className="h-3 w-3 mr-1" /> : <Phone className="h-3 w-3 mr-1" />}
                                                        {task.taskType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        task.priority === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                            task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                                'bg-green-500/10 text-green-500 border-green-500/20'
                                                    }>
                                                        {task.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-slate-400 text-sm italic">{task.status}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                                                        onClick={() => generateAiDraftMutation.mutate(task.invoiceId)}
                                                        disabled={generateAiDraftMutation.isPending}
                                                    >
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                        {generateAiDraftMutation.isPending && selectedInvoiceId === task.invoiceId ? "Drafting..." : "AI Draft"}
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-slate-400">
                                                        Resolve
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {(tasks as any[]).length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                                    No pending collection tasks found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="templates">
                        <ArDunningTemplates />
                    </TabsContent>

                    <TabsContent value="history">
                        <Card className="bg-slate-900 border-slate-800 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-white">Dunning Run History</CardTitle>
                                <CardDescription className="text-slate-400">Historical records of automated collections runs</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-800">
                                            <TableHead className="text-slate-400">Date</TableHead>
                                            <TableHead className="text-slate-400">Invoices Processed</TableHead>
                                            <TableHead className="text-slate-400">Tasks Generated</TableHead>
                                            <TableHead className="text-slate-400">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {safeRuns.map((run: any) => (
                                            <TableRow key={run.id} className="border-slate-800">
                                                <TableCell className="text-slate-300">{formatDateTime(run.runDate)}</TableCell>
                                                <TableCell className="text-white font-bold">{run.totalInvoicesProcessed}</TableCell>
                                                <TableCell className="text-indigo-400 font-bold">{run.totalLettersGenerated}</TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        run.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                                                            'bg-red-500/10 text-red-500'
                                                    }>
                                                        {run.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* AI Draft Preview Modal */}
                {aiDraft && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-2xl bg-slate-900 border-slate-800 shadow-2xl">
                            <CardHeader className="border-b border-slate-800">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-indigo-400" />
                                        AI-Generated Collection Email
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => setAiDraft(null)} className="text-slate-400 hover:text-white">✕</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 font-mono text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                                    {aiDraft}
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" className="bg-slate-800 border-slate-700" onClick={() => setAiDraft(null)}>
                                        Discard
                                    </Button>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                                        navigator.clipboard.writeText(aiDraft);
                                        toast({ title: "Copied", description: "Draft copied to clipboard" });
                                    }}>
                                        Copy to Clipboard
                                    </Button>
                                    <Button className="bg-green-600 hover:bg-green-700">
                                        Send Email
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
