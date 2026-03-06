import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import {
    Landmark,
    TrendingUp,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Download,
    Filter,
    RefreshCcw,
    Loader2,
    ArrowUpRight,
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TreasuryDeal, TreasuryFxDeal } from "@/types/erp-types";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

type UnifiedDeal = (TreasuryDeal | TreasuryFxDeal) & {
    _dealCategory: "MONEY_MARKET" | "FX";
};

export function DealBlotter() {
    const [dealTypeFilter, setDealTypeFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { legalEntityId } = useEnterpriseStore();
    const leHeaders: Record<string, string> = legalEntityId ? { 'x-legal-entity-id': legalEntityId } : {};

    // Fetch Money Market Deals
    const { data: mmDeals = [], isLoading: isLoadingMM } = useQuery<TreasuryDeal[]>({
        queryKey: ["/api/treasury/deals", legalEntityId ?? 'all'],
        refetchInterval: 30000,
        queryFn: async () => {
            const res = await fetch('/api/treasury/deals', { headers: leHeaders });
            if (!res.ok) throw new Error('Failed to fetch MM deals');
            return res.json();
        },
    });

    // Fetch FX Deals
    const { data: fxDeals = [], isLoading: isLoadingFX } = useQuery<TreasuryFxDeal[]>({
        queryKey: ["/api/treasury/fx-deals", legalEntityId ?? 'all'],
        refetchInterval: 30000,
        queryFn: async () => {
            const res = await fetch('/api/treasury/fx-deals', { headers: leHeaders });
            if (!res.ok) throw new Error('Failed to fetch FX deals');
            return res.json();
        },
    });

    // Fetch Counterparties for name lookup
    const { data: counterparties = [] } = useQuery<any[]>({
        queryKey: ["/api/treasury/counterparties", legalEntityId ?? 'all'],
        queryFn: async () => {
            const res = await fetch('/api/treasury/counterparties', { headers: leHeaders });
            if (!res.ok) throw new Error('Failed to fetch counterparties');
            return res.json();
        },
    });

    // Confirm Deal Mutation
    const confirmMutation = useMutation({
        mutationFn: async ({ id, isFx }: { id: string; isFx: boolean }) => {
            const endpoint = isFx
                ? `/api/treasury/fx-deals/${id}/confirm`
                : `/api/treasury/deals/${id}/confirm`;
            await apiRequest("POST", endpoint, {});
        },
        onSuccess: (_, variables) => {
            toast({
                title: "Deal Confirmed",
                description: "Treasury instrument confirmed successfully.",
            });
            queryClient.invalidateQueries({
                queryKey: variables.isFx ? ["/api/treasury/fx-deals"] : ["/api/treasury/deals"],
            });
        },
        onError: (error: any) => {
            toast({
                title: "Confirmation Failed",
                description: error.message || "SoD violation or system error.",
                variant: "destructive",
            });
        },
    });

    // Settle Deal Mutation
    const settleMutation = useMutation({
        mutationFn: async ({ id, isFx }: { id: string; isFx: boolean }) => {
            const endpoint = isFx
                ? `/api/treasury/fx-deals/${id}/settle`
                : `/api/treasury/deals/${id}/settle`;
            await apiRequest("POST", endpoint, {});
        },
        onSuccess: (_, variables) => {
            toast({
                title: "Deal Settled",
                description: "Settlement processed successfully.",
            });
            queryClient.invalidateQueries({
                queryKey: variables.isFx ? ["/api/treasury/fx-deals"] : ["/api/treasury/deals"],
            });
        },
        onError: (error: any) => {
            toast({
                title: "Settlement Failed",
                description: error.message || "System error during settlement.",
                variant: "destructive",
            });
        },
    });

    // Unify deals with category tag
    const unifiedDeals: UnifiedDeal[] = useMemo(() => {
        const mm: UnifiedDeal[] = mmDeals.map((d) => ({
            ...d,
            _dealCategory: "MONEY_MARKET" as const,
        }));
        const fx: UnifiedDeal[] = fxDeals.map((d) => ({
            ...d,
            _dealCategory: "FX" as const,
        }));
        return [...mm, ...fx];
    }, [mmDeals, fxDeals]);

    // Filter and search
    const filteredDeals = useMemo(() => {
        return unifiedDeals.filter((deal) => {
            // Deal type filter
            if (dealTypeFilter === "MM" && deal._dealCategory !== "MONEY_MARKET") return false;
            if (dealTypeFilter === "FX" && deal._dealCategory !== "FX") return false;

            // Status filter
            if (statusFilter !== "ALL" && deal.status !== statusFilter) return false;

            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const dealNumber = deal.dealNumber?.toLowerCase() || "";
                const counterpartyName =
                    counterparties.find((c) => c.id === deal.counterpartyId)?.name?.toLowerCase() || "";
                if (!dealNumber.includes(searchLower) && !counterpartyName.includes(searchLower)) {
                    return false;
                }
            }

            return true;
        });
    }, [unifiedDeals, dealTypeFilter, statusFilter, searchTerm, counterparties]);

    // Metrics calculations
    const metrics = useMemo(() => {
        const totalNotional = filteredDeals.reduce((sum, deal) => {
            const amount =
                Number(deal.principalAmount || (deal as TreasuryFxDeal).buyAmount || 0);
            return sum + amount;
        }, 0);

        const maturing30d = filteredDeals.filter((deal) => {
            const maturityDate = new Date(
                deal.maturityDate || (deal as TreasuryFxDeal).valueDate || ""
            );
            const now = new Date();
            const diffDays = Math.ceil((maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 30;
        }).length;

        const unconfirmedCount = filteredDeals.filter(
            (deal) => deal.status === "DRAFT" || deal.confirmationStatus === "PENDING"
        ).length;

        const avgRate =
            mmDeals.length > 0
                ? mmDeals.reduce((sum, d) => sum + Number(d.interestRate || 0), 0) / mmDeals.length
                : 0;

        return { totalNotional, maturing30d, unconfirmedCount, avgRate };
    }, [filteredDeals, mmDeals]);

    // Table Columns
    const columns: Column<UnifiedDeal>[] = [
        {
            header: "Deal #",
            accessorKey: "dealNumber",
            width: "12%",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-mono font-bold text-primary">{item.dealNumber}</span>
                    <Badge variant="outline" className="w-fit text-[10px] mt-1">
                        {item._dealCategory === "FX" ? "FX" : "MM"}
                    </Badge>
                </div>
            ),
        },
        {
            header: "Type / Subtype",
            width: "14%",
            cell: (item) => {
                if (item._dealCategory === "FX") {
                    const fxDeal = item as TreasuryFxDeal;
                    return (
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">FX Forward</span>
                            <span className="text-[10px] text-muted-foreground">
                                {fxDeal.buyCurrency}/{fxDeal.sellCurrency}
                            </span>
                        </div>
                    );
                } else {
                    const mmDeal = item as TreasuryDeal;
                    return (
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">{mmDeal.type}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">
                                {mmDeal.dealType}
                            </span>
                        </div>
                    );
                }
            },
        },
        {
            header: "Counterparty",
            width: "16%",
            cell: (item) => {
                const counterpartyName =
                    counterparties.find((c) => c.id === item.counterpartyId)?.name || "Unknown";
                return (
                    <div className="flex items-center gap-2">
                        <Landmark className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm truncate">{counterpartyName}</span>
                    </div>
                );
            },
        },
        {
            header: "Notional / Principal",
            width: "14%",
            className: "text-right",
            cell: (item) => {
                if (item._dealCategory === "FX") {
                    const fxDeal = item as TreasuryFxDeal;
                    return (
                        <div className="flex flex-col items-end">
                            <span className="font-bold">
                                {Number(fxDeal.buyAmount).toLocaleString()} {fxDeal.buyCurrency}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                @ {Number(fxDeal.exchangeRate || 0).toFixed(4)}
                            </span>
                        </div>
                    );
                } else {
                    const mmDeal = item as TreasuryDeal;
                    return (
                        <div className="flex flex-col items-end">
                            <span className="font-bold">
                                {Number(mmDeal.principalAmount || 0).toLocaleString()} {mmDeal.currency}
                            </span>
                            <span className="text-[10px] text-muted-foreground italic">
                                Rate: {mmDeal.interestRate}%
                            </span>
                        </div>
                    );
                }
            },
        },
        {
            header: "Trade / Start Date",
            width: "12%",
            cell: (item) => {
                const date =
                    item._dealCategory === "FX"
                        ? (item as TreasuryFxDeal).tradeDate
                        : item.startDate;
                return date ? (
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{format(new Date(date), "MMM dd, yyyy")}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                );
            },
        },
        {
            header: "Maturity / Value Date",
            width: "12%",
            cell: (item) => {
                const date =
                    item._dealCategory === "FX"
                        ? (item as TreasuryFxDeal).valueDate
                        : item.maturityDate;
                if (!date) return <span className="text-muted-foreground">OPEN</span>;

                const maturityDate = new Date(date);
                const now = new Date();
                const diffDays = Math.ceil((maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isNearMaturity = diffDays > 0 && diffDays <= 30;

                return (
                    <div className="flex items-center gap-2">
                        <Calendar className={cn(`w-3 h-3 ${isNearMaturity ? 'text-amber-500' : 'text-muted-foreground'}`)} />
                        <span className={cn(`text-sm ${isNearMaturity ? 'text-amber-600 font-medium' : ''}`)}>
                            {format(maturityDate, "MMM dd, yyyy")}
                        </span>
                    </div>
                );
            },
        },
        {
            header: "Status",
            width: "10%",
            cell: (item) => {
                const status = item.status || "DRAFT";
                const colors: Record<string, string> = {
                    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
                    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
                    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
                    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    SETTLED: "bg-purple-50 text-purple-700 border-purple-200",
                    MATURED: "bg-gray-100 text-gray-700 border-gray-200",
                };
                return (
                    <Badge className={cn(`${colors[status] || colors.DRAFT} border font-medium`)}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            header: "Actions",
            width: "10%",
            className: "text-right",
            cell: (item) => {
                const isFx = item._dealCategory === "FX";
                const isPending = item.status === "DRAFT" || item.confirmationStatus === "PENDING";
                const isConfirmed = item.status === "CONFIRMED" || item.status === "ACTIVE";

                return (
                    <div className="flex justify-end gap-1">
                        {isPending && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmMutation.mutate({ id: item.id, isFx })}
                                disabled={confirmMutation.isPending}
                                title="Confirm Deal"
                            >
                                {confirmMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                )}
                            </Button>
                        )}
                        {isConfirmed && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => settleMutation.mutate({ id: item.id, isFx })}
                                disabled={settleMutation.isPending}
                                title="Settle Deal"
                            >
                                {settleMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                ) : (
                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                )}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            title="View Details"
                            onClick={() => {
                                toast({
                                    title: "Deal Details",
                                    description: `View implementation coming in Phase 2.1`,
                                });
                            }}
                        >
                            <ArrowUpRight className="w-4 h-4 text-primary" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const isLoading = isLoadingMM || isLoadingFX;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        Deal Blotter
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Real-time view of all Money Market and FX positions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                            queryClient.invalidateQueries({ queryKey: ["/api/treasury/deals"] });
                            queryClient.invalidateQueries({ queryKey: ["/api/treasury/fx-deals"] });
                        }}
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-primary flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" />
                            Total Notional
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black">${(metrics.totalNotional / 1000000).toFixed(1)}M</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {filteredDeals.length} Positions
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50/50 to-transparent border-emerald-100">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-emerald-600 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3" />
                            Weighted Avg Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-emerald-700">{metrics.avgRate.toFixed(2)}%</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Money Market Only</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50/50 to-transparent border-amber-100">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-amber-600 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Maturing in 30d
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-amber-700">{metrics.maturing30d}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Requires Action</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-destructive/5 to-transparent border-destructive/10">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-destructive flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            Unconfirmed Deals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-destructive">{metrics.unconfirmedCount}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Pending Approval</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-muted/20 border-muted">
                <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Filters:</span>
                        </div>

                        <Select value={dealTypeFilter} onValueChange={setDealTypeFilter}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Deal Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Deals</SelectItem>
                                <SelectItem value="MM">Money Market</SelectItem>
                                <SelectItem value="FX">FX Forward</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="SETTLED">Settled</SelectItem>
                                <SelectItem value="MATURED">Matured</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            placeholder="Search by Deal # or Counterparty..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-xs"
                        />

                        {(dealTypeFilter !== "ALL" || statusFilter !== "ALL" || searchTerm) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setDealTypeFilter("ALL");
                                    setStatusFilter("ALL");
                                    setSearchTerm("");
                                }}
                                className="text-xs"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Deal Grid */}
            <Card className="border-primary/20 shadow-lg">
                <CardContent className="p-0">
                    <StandardTable
                        data={filteredDeals}
                        columns={columns}
                        isLoading={isLoading}
                        className="border-0 shadow-none"
                        pageSize={20}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
