
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Plus, Search, Filter, ArrowUpRight, ArrowDownRight,
    Briefcase, Landmark, Calendar, RefreshCcw, Loader2,
    CheckCircle2, Clock, AlertCircle, Scale
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { DealEntrySheet } from "./DealEntrySheet";
import { CounterpartyManager } from "./CounterpartyManager";
import { RiskDashboard } from "./RiskDashboard";
import { FxDealEntry } from "./FxDealEntry";
import { CashForecastDashboard } from "./CashForecastDashboard";
import { NettingWorkbench } from "./NettingWorkbench";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { TreasuryDeal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function TreasuryWorkbench() {
    const [isEntryOpen, setIsEntryOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("deals");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: deals = [], isLoading } = useQuery<TreasuryDeal[]>({
        queryKey: ["/api/treasury/deals"],
    });

    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("PATCH", `/api/treasury/deals/${id}/status`, { status: "CONFIRMED" });
        },
        onSuccess: () => {
            toast({ title: "Deal Confirmed", description: "Treasury instrument is now active." });
            queryClient.invalidateQueries({ queryKey: ["/api/treasury/deals"] });
        }
    });

    const columns: Column<TreasuryDeal>[] = [
        {
            header: "Deal #",
            accessorKey: "dealNumber",
            width: "15%",
            cell: (item) => <span className="font-mono font-bold text-primary">{item.dealNumber}</span>
        },
        {
            header: "Type",
            width: "15%",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-medium">{item.type}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{item.subType}</span>
                </div>
            )
        },
        {
            header: "Counterparty",
            width: "20%",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <Landmark className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">Bank of America</span> {/* Placeholder for counterparty name join */}
                </div>
            )
        },
        {
            header: "Principal",
            width: "15%",
            className: "text-right",
            cell: (item) => (
                <div className="flex flex-col items-end">
                    <span className="font-bold">{Number(item.principalAmount).toLocaleString()} {item.currency}</span>
                    <span className="text-[10px] text-muted-foreground italic">Rate: {item.interestRate}%</span>
                </div>
            )
        },
        {
            header: "Maturity",
            width: "15%",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span>{item.maturityDate ? format(new Date(item.maturityDate), "MMM dd, yyyy") : "OPEN"}</span>
                </div>
            )
        },
        {
            header: "Status",
            width: "10%",
            cell: (item) => {
                const colors: Record<string, string> = {
                    DRAFT: "bg-slate-100 text-slate-600",
                    CONFIRMED: "bg-blue-100 text-blue-600",
                    ACTIVE: "bg-emerald-100 text-emerald-600",
                    MATURED: "bg-purple-100 text-purple-600"
                };
                return <Badge className={colors[item.status || 'DRAFT']}>{item.status}</Badge>
            }
        },
        {
            header: "Actions",
            width: "10%",
            className: "text-right",
            cell: (item) => (
                <div className="flex justify-end gap-2">
                    {item.status === 'DRAFT' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => approveMutation.mutate(item.id)}
                            disabled={approveMutation.isPending}
                        >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setSelectedDeal(item.id)}>
                        <ArrowUpRight className="w-4 h-4 text-primary" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Treasury Workbench</h2>
                    <p className="text-muted-foreground">Manage debt instruments, investment portfolios, and FX risk positions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => setActiveTab("counterparties")}>
                        <Landmark className="w-4 h-4" /> Institutions
                    </Button>
                    <Button className="gap-2" onClick={() => setIsEntryOpen(true)}>
                        <Plus className="w-4 h-4" /> New Deal
                    </Button>
                    <FxDealEntry />
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="deals" className="gap-2">
                        <Briefcase className="w-4 h-4" /> Active Positions
                    </TabsTrigger>
                    <TabsTrigger value="counterparties" className="gap-2">
                        <Landmark className="w-4 h-4" /> Counterparties
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2">
                        <ArrowUpRight className="w-4 h-4" /> Risk Exposure
                    </TabsTrigger>
                    <TabsTrigger value="netting" className="gap-2">
                        <Scale className="w-4 h-4" /> In-House Bank
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="deals" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-primary/5 border-primary/10">
                            <CardHeader className="py-3">
                                <CardTitle className="text-xs font-bold text-primary flex items-center gap-2">
                                    <ArrowUpRight className="w-3 h-3" /> Total Debt Principal
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-black">2.4M USD</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Weighted Avg Rate: 5.2%</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-emerald-50/50 border-emerald-100">
                            <CardHeader className="py-3">
                                <CardTitle className="text-xs font-bold text-emerald-600 flex items-center gap-2">
                                    <ArrowDownRight className="w-3 h-3" /> Managed Investments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-black text-emerald-700">1.8M USD</p>
                                <p className="text-[10px] text-muted-foreground mt-1">YTD Yield: 4.8%</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-amber-50/50 border-amber-100">
                            <CardHeader className="py-3">
                                <CardTitle className="text-xs font-bold text-amber-600 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Maturing in 30 Days
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-black text-amber-700">500k USD</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Refinancing Required</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-destructive/5 border-destructive/10">
                            <CardHeader className="py-3">
                                <CardTitle className="text-xs font-bold text-destructive flex items-center gap-2">
                                    <AlertCircle className="w-3 h-3" /> High FX Concentration
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-black text-destructive">850k EUR</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Unhedged Exposure</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-primary/20">
                        <CardContent className="p-0">
                            <StandardTable
                                data={deals}
                                columns={columns}
                                isLoading={isLoading}
                                className="border-0 shadow-none"
                                pageSize={15}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="counterparties" className="pt-4">
                    <CounterpartyManager />
                </TabsContent>

                <TabsContent value="analytics" className="pt-4">
                    <div className="p-4 bg-muted/20 rounded-xl border-dashed border-muted-foreground/10 mb-8">
                        <RiskDashboard />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold tracking-tight">Liquidity Forecasting</h3>
                        <CashForecastDashboard />
                    </div>
                </TabsContent>

                <TabsContent value="netting" className="pt-4">
                    <NettingWorkbench />
                </TabsContent>
            </Tabs>

            <DealEntrySheet
                open={isEntryOpen}
                onClose={() => setIsEntryOpen(false)}
            />
        </div>
    );
}
