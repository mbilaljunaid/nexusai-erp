import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";

interface RevenueContract {
    id: string;
    contractNumber: string;
    customerName: string;
    totalValue: number;
    recognizedRevenue: number;
    deferredRevenue: number;
    startDate: string;
    endDate: string;
    status: "ACTIVE" | "COMPLETED";
}

interface PerformanceObligation {
    id: string;
    contractId: string;
    description: string;
    standaloneSellingPrice: number;
    allocatedAmount: number;
    recognizedAmount: number;
    completionPercent: number;
}

interface RevenueSchedule {
    period: string;
    recognized: number;
    deferred: number;
    total: number;
}

export default function RevenueRecognitionDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

    // Fetch revenue contracts
    const { data: contracts = [] } = useQuery<RevenueContract[]>({
        queryKey: ["revenue-contracts"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/contracts");
            const json = await res.json();
            return (json.data || []).map((c: any) => ({
                id: c.id,
                contractNumber: c.contractNumber,
                customerName: c.customerName || "Unknown Customer",
                totalValue: parseFloat(c.totalTransactionPrice || "0"),
                recognizedRevenue: parseFloat(c.totalAllocatedPrice || "0"), // Simplified
                deferredRevenue: parseFloat(c.totalTransactionPrice || "0") - parseFloat(c.totalAllocatedPrice || "0"),
                startDate: c.createdAt,
                endDate: c.createdAt,
                status: c.status?.toUpperCase() || "ACTIVE"
            }));
        }
    });

    // Fetch performance obligations
    const { data: obligations = [] } = useQuery<PerformanceObligation[]>({
        queryKey: ["performance-obligations", selectedContractId],
        queryFn: async () => {
            const res = await fetch(`/api/revenue/contracts/${selectedContractId}`);
            const json = await res.json();
            return (json.performanceObligations || []).map((p: any) => ({
                id: p.id,
                contractId: p.contractId,
                description: p.name,
                standaloneSellingPrice: parseFloat(p.sspPrice || "0"),
                allocatedAmount: parseFloat(p.allocatedPrice || "0"),
                recognizedAmount: parseFloat(p.allocatedPrice || "0"), // Replace with real recognized amounts later
                completionPercent: p.status === 'Satisfied' ? 100 : 0
            }));
        },
        enabled: !!selectedContractId
    });

    // Fetch revenue schedule
    const { data: schedule = [] } = useQuery<RevenueSchedule[]>({
        queryKey: ["revenue-schedule"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/reporting/waterfall?year=2026");
            const json = await res.json();
            return json.map((w: any) => ({
                period: w.period,
                recognized: w.amount,
                deferred: 0,
                total: w.amount
            }));
        }
    });

    // Recognize revenue mutation
    const recognizeMutation = useMutation({
        mutationFn: async (contractId: string) => {
            // Simplified sweep for the contract's period
            // In a real ASC 606 we sweep periods not individual contracts usually,
            // but we'll use evaluate-contract if we have it or just period sweep
            const res = await fetch(`/api/revenue/periods/auto-sweep`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) throw new Error("Recognition failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["revenue-contracts"] });
            toast({
                title: "Revenue Recognized",
                description: "Revenue recognition completed successfully."
            });
        }
    });

    // Fetch accounting config
    const { data: accountingConfig } = useQuery({
        queryKey: ["revenue-accounting-config"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/config/accounting");
            const data = await res.json();
            return data.length > 0 ? data[0] : null;
        }
    });

    const selectedContract = contracts.find(c => c.id === selectedContractId);
    const totalRecognized = contracts.reduce((sum, c) => sum + c.recognizedRevenue, 0);
    const totalDeferred = contracts.reduce((sum, c) => sum + c.deferredRevenue, 0);

    return (
        <StandardPage
            title="Revenue Recognition Dashboard"
            description="ASC 606 compliant revenue recognition with performance obligation tracking."
            breadcrumbs={[
                { label: "Projects", href: "/projects" },
                { label: "Revenue Recognition" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Active Contracts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                                {contracts.filter(c => c.status === "ACTIVE").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100 relative group">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Recognized Revenue</CardTitle>
                            {accountingConfig && (
                                <Badge variant="outline" className="text-[10px] bg-white border-green-200 text-green-700 hidden group-hover:block transition-all absolute top-2 right-2">
                                    GL: {accountingConfig.revenueAccountCCID}
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">{formatCurrency(totalRecognized)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-100 relative group">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Deferred Revenue</CardTitle>
                            {accountingConfig && (
                                <Badge variant="outline" className="text-[10px] bg-white border-orange-200 text-orange-700 hidden group-hover:block transition-all absolute top-2 right-2">
                                    GL: {accountingConfig.deferredRevenueAccountCCID}
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">{formatCurrency(totalDeferred)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-100 relative group">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Contract Asset</CardTitle>
                            {accountingConfig && (
                                <Badge variant="outline" className="text-[10px] bg-white border-purple-200 text-purple-700 hidden group-hover:block transition-all absolute top-2 right-2">
                                    GL: {accountingConfig.contractAssetAccountCCID}
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                                {formatCurrency(totalRecognized + totalDeferred)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Schedule Chart */}
                <Card className="border-t-4 border-t-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" /> Revenue Schedule
                        </CardTitle>
                        <CardDescription>Recognized vs. deferred revenue over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={schedule}>
                                <defs>
                                    <linearGradient id="colorRecognized" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDeferred" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="recognized"
                                    stackId="1"
                                    stroke="#10b981"
                                    fill="url(#colorRecognized)"
                                    name="Recognized"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="deferred"
                                    stackId="1"
                                    stroke="#f97316"
                                    fill="url(#colorDeferred)"
                                    name="Deferred"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Contracts and Obligations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-t-4 border-t-blue-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Revenue Contracts
                            </CardTitle>
                            <CardDescription>Active customer contracts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {contracts.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No contracts created yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {contracts.map((contract) => (
                                        <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelectedContractId(contract.id)}>
                                            <Card
                                                key={contract.id}
                                                className={cn(`cursor-pointer transition-colors ${selectedContractId === contract.id ? "bg-blue-500/10 border-blue-200" : "hover:bg-muted/50"
                                                    }`)}
                                            >
                                                <CardContent className="pt-4 pb-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-sm">{contract.contractNumber}</h4>
                                                            <p className="text-xs text-muted-foreground">{contract.customerName}</p>
                                                        </div>
                                                        <Badge variant={contract.status === "ACTIVE" ? "default" : "secondary"}>
                                                            {contract.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                                                        <div>
                                                            <span className="text-muted-foreground">Recognized:</span>
                                                            <div className="font-bold text-green-600">{formatCurrency(contract.recognizedRevenue)}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Deferred:</span>
                                                            <div className="font-bold text-orange-600">{formatCurrency(contract.deferredRevenue)}</div>
                                                        </div>
                                                    </div>
                                                    <Progress
                                                        value={(contract.recognizedRevenue / contract.totalValue) * 100}
                                                        className="mt-3"
                                                    />
                                                </CardContent>
                                            </Card>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-purple-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" /> Performance Obligations
                            </CardTitle>
                            <CardDescription>Contract performance obligations (ASC 606)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!selectedContract ? (
                                <div className="text-center py-12 text-muted-foreground text-sm">
                                    Select a contract to view performance obligations
                                </div>
                            ) : obligations.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground text-sm">
                                    No performance obligations defined for this contract
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {obligations.map((obligation) => (
                                        <Card key={obligation.id}>
                                            <CardContent className="pt-3 pb-3">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <h5 className="font-medium text-sm">{obligation.description}</h5>
                                                        {accountingConfig && (
                                                            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500">
                                                                GL: {accountingConfig.contractAssetAccountCCID}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div>
                                                            <span className="text-muted-foreground">SSP:</span>
                                                            <div className="font-mono">{formatCurrency(obligation.standaloneSellingPrice)}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Allocated:</span>
                                                            <div className="font-mono">{formatCurrency(obligation.allocatedAmount)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <Progress value={obligation.completionPercent} className="flex-1 mr-2" />
                                                        <span className="text-xs font-bold">{obligation.completionPercent}%</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
