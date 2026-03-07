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
            const res = await fetch("/api/ppm/revenue/contracts");
            return res.json();
        }
    });

    // Fetch performance obligations
    const { data: obligations = [] } = useQuery<PerformanceObligation[]>({
        queryKey: ["performance-obligations", selectedContractId],
        queryFn: async () => {
            // Mock - replace with real API
            return [];
        },
        enabled: !!selectedContractId
    });

    // Fetch revenue schedule
    const { data: schedule = [] } = useQuery<RevenueSchedule[]>({
        queryKey: ["revenue-schedule"],
        queryFn: async () => {
            const res = await fetch("/api/ppm/revenue/schedule");
            return res.json();
        }
    });

    // Recognize revenue mutation
    const recognizeMutation = useMutation({
        mutationFn: async (obligationId: string) => {
            const res = await fetch("/api/ppm/revenue/recognize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ obligationId })
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
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">Recognized Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">{formatCurrency(totalRecognized)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Deferred Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">{formatCurrency(totalDeferred)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Total Value</CardTitle>
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
                                        <Card
                                            key={contract.id}
                                            className={cn(`cursor-pointer transition-colors ${selectedContractId === contract.id ? "bg-blue-500/10 border-blue-200" : "hover:bg-muted/50"
                                                }`)}
                                            onClick={() => setSelectedContractId(contract.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
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
                                                    <h5 className="font-medium text-sm">{obligation.description}</h5>
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
