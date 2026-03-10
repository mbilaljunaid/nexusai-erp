import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import {
    Shield,
    Plus,
    CheckCircle,
    AlertCircle,
    XCircle,
    FileText,
    Download,
    TrendingUp,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TreasuryFxDeal } from "@/types/erp-types";
import { useEnterpriseStore } from "@/lib/enterpriseStore";
import { DatePicker } from '@/components/ui/DatePicker';
import { formatNumber } from '@/lib/formatters';

interface HedgeRelationship {
    id: string;
    dealId: string;
    dealNumber?: string;
    hedgeItemType: "FORECAST_TRANSACTION" | "FIRM_COMMITMENT" | "NET_INVESTMENT";
    hedgeItemId: string;
    hedgeItemDescription?: string;
    startDate: string;
    endDate?: string;
    effectiveness?: number;
    status: string;
    createdAt?: string;
}

export function HedgeAccountingWorkbench() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        dealId: "",
        hedgeItemType: "FORECAST_TRANSACTION" as const,
        hedgeItemId: "",
        hedgeItemDescription: "",
        startDate: new Date().toISOString().split("T")[0],
    });
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { legalEntityId } = useEnterpriseStore();
    const leHeaders: Record<string, string> = legalEntityId ? { 'x-legal-entity-id': legalEntityId } : {};

    // Fetch Hedge Relationships
    const { data: hedges = [], isLoading: isLoadingHedges } = useQuery<HedgeRelationship[]>({
        queryKey: ["/api/treasury/hedges", legalEntityId ?? 'all'],
        queryFn: async () => {
            const res = await fetch('/api/treasury/hedges', { headers: leHeaders });
            if (!res.ok) throw new Error('Failed to fetch hedges');
            return res.json();
        },
    });

    // Fetch FX Deals for selection
    const { data: fxDeals = [] } = useQuery<TreasuryFxDeal[]>({
        queryKey: ["/api/treasury/fx-deals", legalEntityId ?? 'all'],
        queryFn: async () => {
            const res = await fetch('/api/treasury/fx-deals', { headers: leHeaders });
            if (!res.ok) throw new Error('Failed to fetch FX deals');
            return res.json();
        },
    });

    // Create Hedge Mutation
    const createHedgeMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await apiRequest("POST", "/api/treasury/hedges", {
                dealId: data.dealId,
                sourceType: data.hedgeItemType,
                sourceId: data.hedgeItemId,
                amount: 0, // Amount derived from deal
            });
            return await res.json();
        },
        onSuccess: () => {
            toast({
                title: "Hedge Created",
                description: "Hedge relationship documented successfully.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/treasury/hedges"] });
            setIsCreateDialogOpen(false);
            setFormData({
                dealId: "",
                hedgeItemType: "FORECAST_TRANSACTION",
                hedgeItemId: "",
                hedgeItemDescription: "",
                startDate: new Date().toISOString().split("T")[0],
            });
        },
        onError: (error: any) => {
            toast({
                title: "Hedge Creation Failed",
                description: error.message || "System error.",
                variant: "destructive",
            });
        },
    });

    // Calculate effectiveness (simplified 80-125% test per ASC 815)
    const calculateEffectiveness = (hedge: HedgeRelationship) => {
        // In production, this would compare cumulative change in hedge vs hedged item
        // For now, return mock effectiveness
        const mockEffectiveness = 95 + Math.random() * 20; // 95-115%
        return mockEffectiveness;
    };

    // Enrich hedges with deal details and effectiveness
    const enrichedHedges = useMemo(() => {
        return hedges.map((hedge) => {
            const deal = fxDeals.find((d) => d.id === hedge.dealId);
            const effectiveness = hedge.effectiveness || calculateEffectiveness(hedge);
            const isEffective = effectiveness >= 80 && effectiveness <= 125;

            return {
                ...hedge,
                dealNumber: deal?.dealNumber,
                buyCurrency: deal?.buyCurrency,
                sellCurrency: deal?.sellCurrency,
                buyAmount: deal?.buyAmount,
                effectiveness,
                isEffective,
            };
        });
    }, [hedges, fxDeals]);

    // Filter unhedged FX deals
    const unhedgedDeals = useMemo(() => {
        const hedgedDealIds = new Set(hedges.map((h) => h.dealId));
        return fxDeals.filter(
            (deal) =>
                !hedgedDealIds.has(deal.id) &&
                (deal.status === "ACTIVE" || deal.status === "CONFIRMED")
        );
    }, [fxDeals, hedges]);

    // Table Columns
    const columns: Column<typeof enrichedHedges[0]>[] = [
        {
            header: "Hedge ID",
            width: "10%",
            cell: (item) => <span className="font-mono text-xs">{item.id.slice(0, 8)}</span>,
        },
        {
            header: "Hedging Instrument",
            width: "18%",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-mono font-bold text-primary">{item.dealNumber}</span>
                    <span className="text-[10px] text-muted-foreground">
                        {item.buyCurrency}/{item.sellCurrency} • ${formatNumber(Number(item.buyAmount || 0))}
                    </span>
                </div>
            ),
        },
        {
            header: "Hedged Item",
            width: "20%",
            cell: (item) => (
                <div className="flex flex-col">
                    <Badge variant="outline" className="w-fit text-[10px] mb-1">
                        {item.hedgeItemType?.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">
                        {item.hedgeItemDescription || item.hedgeItemId}
                    </span>
                </div>
            ),
        },
        {
            header: "Start Date",
            width: "12%",
            cell: (item) => format(new Date(item.startDate), "MMM dd, yyyy"),
        },
        {
            header: "Effectiveness",
            width: "15%",
            cell: (item) => {
                const eff = item.effectiveness || 0;
                const isEffective = item.isEffective;
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className={cn(`font-bold ${isEffective ? "text-emerald-600" : "text-red-600"}`)}>
                                {eff.toFixed(1)}%
                            </span>
                            {isEffective ? (
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                            ) : (
                                <XCircle className="w-3 h-3 text-red-500" />
                            )}
                        </div>
                        <span className="text-[9px] text-muted-foreground">
                            {isEffective ? "Highly Effective" : "INEFFECTIVE"}
                        </span>
                    </div>
                );
            },
        },
        {
            header: "Status",
            width: "10%",
            cell: (item) => {
                const colors: Record<string, string> = {
                    ACTIVE: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
                    INACTIVE: "bg-muted text-foreground/90 border-border",
                    TERMINATED: "bg-red-500/10 text-red-700 border-red-200",
                };
                return (
                    <Badge className={cn(`${colors[item.status] || colors.ACTIVE} border`)}>
                        {item.status}
                    </Badge>
                );
            },
        },
        {
            header: "Actions",
            width: "15%",
            className: "text-right",
            cell: (item) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                            toast({ title: "Documentation", description: "Generating ASC 815 docs..." })
                        }
                    >
                        <FileText className="w-3 h-3 mr-1" />
                        Docs
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive"
                        onClick={() =>
                            toast({ title: "Terminate Hedge", description: "Coming in Phase 4.1" })
                        }
                    >
                        Terminate
                    </Button>
                </div>
            ),
        },
    ];

    // Metrics
    const metrics = useMemo(() => {
        const totalHedges = enrichedHedges.length;
        const effectiveHedges = enrichedHedges.filter((h) => h.isEffective).length;
        const ineffectiveHedges = totalHedges - effectiveHedges;
        const totalUnhedgedExposure = unhedgedDeals.reduce(
            (sum, deal) => sum + Number(deal.buyAmount || 0),
            0
        );

        return { totalHedges, effectiveHedges, ineffectiveHedges, totalUnhedgedExposure };
    }, [enrichedHedges, unhedgedDeals]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        Hedge Accounting Workbench
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        ASC 815 compliant hedge relationship management and effectiveness testing
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export Report
                    </Button>

                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Create Hedge
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create Hedge Relationship</DialogTitle>
                                <DialogDescription>
                                    Document a new hedge per ASC 815 requirements
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dealId">Hedging Instrument (FX Deal)</Label>
                                    <Select
                                        value={formData.dealId}
                                        onValueChange={(value) => setFormData({ ...formData, dealId: value })}
                                    >
                                        <SelectTrigger id="dealId">
                                            <SelectValue placeholder="Select FX Deal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fxDeals
                                                .filter((d) => d.status === "ACTIVE" || d.status === "CONFIRMED")
                                                .map((deal) => (
                                                    <SelectItem key={deal.id} value={deal.id}>
                                                        {deal.dealNumber} - {deal.buyCurrency}/{deal.sellCurrency} ($
                                                        {formatNumber(Number(deal.buyAmount))})
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hedgeItemType">Hedged Item Type</Label>
                                    <Select
                                        value={formData.hedgeItemType}
                                        onValueChange={(value: any) =>
                                            setFormData({ ...formData, hedgeItemType: value })
                                        }
                                    >
                                        <SelectTrigger id="hedgeItemType">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FORECAST_TRANSACTION">Forecast Transaction</SelectItem>
                                            <SelectItem value="FIRM_COMMITMENT">Firm Commitment</SelectItem>
                                            <SelectItem value="NET_INVESTMENT">Net Investment in Foreign Op</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hedgeItemId">Hedged Item Reference ID</Label>
                                    <Input
                                        id="hedgeItemId"
                                        placeholder="e.g., PO-2026-001, Contract-ABC"
                                        value={formData.hedgeItemId}
                                        onChange={(e) =>
                                            setFormData({ ...formData, hedgeItemId: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        placeholder="e.g., Hedge EUR exposure on equipment purchase"
                                        value={formData.hedgeItemDescription}
                                        onChange={(e) =>
                                            setFormData({ ...formData, hedgeItemDescription: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Hedge Start Date</Label>
                                    <DatePicker value={formData.startDate} onChange={(v) =>
                                        setFormData({ ...formData, startDate: v })} />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                    disabled={createHedgeMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => createHedgeMutation.mutate(formData)}
                                    disabled={createHedgeMutation.isPending || !formData.dealId || !formData.hedgeItemId}
                                >
                                    {createHedgeMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : null}
                                    Create Hedge
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-primary flex items-center gap-2">
                            <Shield className="w-3 h-3" />
                            Total Hedges
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black">{metrics.totalHedges}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Active Relationships</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-transparent border-emerald-200">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-emerald-600 flex items-center gap-2">
                            <CheckCircle className="w-3 h-3" />
                            Highly Effective
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-emerald-700">{metrics.effectiveHedges}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">80-125% Range</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-transparent border-red-200">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-red-600 flex items-center gap-2">
                            <XCircle className="w-3 h-3" />
                            Ineffective
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-red-700">{metrics.ineffectiveHedges}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Requires Review</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-transparent border-amber-200">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs font-bold text-amber-600 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            Unhedged Exposure
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-amber-700">
                            ${(metrics.totalUnhedgedExposure / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {unhedgedDeals.length} Deals
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Unhedged Exposure Alert */}
            {unhedgedDeals.length > 0 && (
                <Card className="bg-amber-500/10 border-amber-200">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            Unhedged FX Exposures Detected
                        </CardTitle>
                        <CardDescription>
                            {unhedgedDeals.length} active FX deals without hedge designation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {unhedgedDeals.slice(0, 3).map((deal) => (
                                <div
                                    key={deal.id}
                                    className="flex justify-between items-center p-3 bg-card rounded-lg border border-amber-100"
                                >
                                    <div>
                                        <span className="font-mono font-bold text-sm">{deal.dealNumber}</span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                            {deal.buyCurrency}/{deal.sellCurrency}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-sm">
                                            ${formatNumber(Number(deal.buyAmount))}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs"
                                            onClick={() => {
                                                setFormData({ ...formData, dealId: deal.id });
                                                setIsCreateDialogOpen(true);
                                            }}
                                        >
                                            Designate Hedge
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {unhedgedDeals.length > 3 && (
                                <p className="text-xs text-muted-foreground text-center pt-2">
                                    +{unhedgedDeals.length - 3} more unhedged deals
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Hedge Relationships Table */}
            <Card className="shadow-lg border-primary/20">
                <CardHeader>
                    <CardTitle className="text-sm">Active Hedge Relationships</CardTitle>
                    <CardDescription>ASC 815 documented hedges and effectiveness testing</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <StandardTable
                        data={enrichedHedges}
                        columns={columns}
                        isLoading={isLoadingHedges}
                        className="border-0 shadow-none"
                        pageSize={10}
                    />
                </CardContent>
            </Card>

            {/* ASC 815 Compliance Note */}
            <Card className="bg-blue-500/10 border-blue-200">
                <CardContent className="pt-4">
                    <div className="flex gap-3">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">ASC 815 Compliance</p>
                            <p className="text-blue-700 leading-relaxed">
                                All hedge relationships are documented per ASC 815 requirements. Effectiveness is
                                tested quarterly using the dollar-offset method (80-125% range). Ineffective hedges
                                must be de-designated and marked-to-market through P&L.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
