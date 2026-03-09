import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, DollarSign, TrendingDown, AlertTriangle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { LedgerContextBadge } from "@/components/gl/LedgerContextBadge";
import { DatePicker } from '@/components/ui/DatePicker';

interface FxRate {
    id: string;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    conversionDate: string;
    rateType: "DAILY" | "AVERAGE" | "SPOT";
}

interface RateCoverage {
    currencyPair: string;
    hasRate: boolean;
    lastDate?: string;
    lastRate?: number;
}

interface TranslationImpact {
    entity: string;
    originalCurrency: string;
    originalAmount: number;
    translatedAmount: number;
    fxGainLoss: number;
}

export default function FxTranslationDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedPair, setSelectedPair] = useState("EUR-USD");
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
    const [newRate, setNewRate] = useState({
        fromCurrency: "EUR",
        toCurrency: "USD",
        rate: "",
        conversionDate: new Date().toISOString().split('T')[0],
        rateType: "DAILY" as const
    });

    // Fetch FX rates
    const { data: rates = [] } = useQuery<FxRate[]>({
        queryKey: ["fx-rates"],
        queryFn: async () => {
            const res = await fetch("/api/gl/consolidation/fx-rates");
            return res.json();
        }
    });

    // Fetch rate coverage matrix
    const { data: coverage = [] } = useQuery<RateCoverage[]>({
        queryKey: ["fx-coverage"],
        queryFn: async () => {
            // Mock - replace with API
            return [
                { currencyPair: "EUR-USD", hasRate: true, lastDate: "2026-02-11", lastRate: 1.08 },
                { currencyPair: "GBP-USD", hasRate: true, lastDate: "2026-02-11", lastRate: 1.27 },
                { currencyPair: "JPY-USD", hasRate: false },
                { currencyPair: "EUR-GBP", hasRate: true, lastDate: "2026-02-10", lastRate: 0.85 }
            ];
        }
    });

    // Fetch translation impact
    const { data: translationImpact = [] } = useQuery<TranslationImpact[]>({
        queryKey: ["translation-impact"],
        queryFn: async () => {
            // Mock - replace with API
            return [
                { entity: "UK Operations", originalCurrency: "GBP", originalAmount: 1000000, translatedAmount: 1270000, fxGainLoss: 50000 },
                { entity: "EU Operations", originalCurrency: "EUR", originalAmount: 2000000, translatedAmount: 2160000, fxGainLoss: -30000 },
                { entity: "Asia Pacific", originalCurrency: "JPY", originalAmount: 500000000, translatedAmount: 3300000, fxGainLoss: 15000 }
            ];
        }
    });

    // Historical rates for chart
    const { data: historicalRates = [] } = useQuery<any>({
        queryKey: ["fx-historical", selectedPair],
        queryFn: async () => {
            // Mock - replace with API
            return [
                { date: "2026-01-01", rate: 1.05 },
                { date: "2026-01-15", rate: 1.06 },
                { date: "2026-02-01", rate: 1.07 },
                { date: "2026-02-11", rate: 1.08 }
            ];
        }
    });

    // Manual rate entry mutation
    const createRateMutation = useMutation({
        mutationFn: async (rateData: typeof newRate) => {
            const res = await fetch("/api/gl/consolidation/fx-rates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rateData)
            });
            if (!res.ok) throw new Error("Failed to create rate");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fx-rates"] });
            queryClient.invalidateQueries({ queryKey: ["fx-coverage"] });
            setIsManualEntryOpen(false);
            setNewRate({ fromCurrency: "EUR", toCurrency: "USD", rate: "", conversionDate: new Date().toISOString().split('T')[0], rateType: "DAILY" });
            toast({
                title: "Rate Created",
                description: "Exchange rate added successfully."
            });
        }
    });

    const missingRates = coverage.filter(c => !c.hasRate).length;
    const totalGainLoss = translationImpact.reduce((sum, t) => sum + t.fxGainLoss, 0);

    return (
        <StandardPage
            title="FX Translation Dashboard"
            description={
                <div className="flex items-center gap-2">
                    <span>Monitor currency translation impact and manage exchange rates for consolidation.</span>
                    <LedgerContextBadge />
                </div>
            }
            breadcrumbs={[
                { label: "General Ledger", href: "/gl" },
                { label: "Consolidation", href: "/finance/gl/consolidation" },
                { label: "FX Translation" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Active Rates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{rates.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Missing Rates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">{missingRates}</div>
                        </CardContent>
                    </Card>
                    <Card className={cn(`${totalGainLoss >= 0 ? 'bg-green-500/10 border-green-100' : 'bg-red-500/10 border-red-100'}`)}>
                        <CardHeader className="pb-2">
                            <CardTitle className={cn(`text-xs font-bold uppercase ${totalGainLoss >= 0 ? 'text-green-800' : 'text-red-800'}`)}>
                                FX Gain/Loss
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={cn(`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-900 dark:text-green-200' : 'text-red-900'}`)}>
                                {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(0)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Currency Pairs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">{coverage.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Rate Coverage Matrix */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" /> Rate Coverage Matrix
                                </CardTitle>
                                <CardDescription>Exchange rate availability by currency pair</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Calendar className="h-4 w-4 mr-2" /> Manual Entry
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Exchange Rate</DialogTitle>
                                            <DialogDescription>Manually enter an FX rate</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="fromCurr">From Currency</Label>
                                                    <Select
                                                        value={newRate.fromCurrency}
                                                        onValueChange={(v) => setNewRate({ ...newRate, fromCurrency: v })}
                                                    >
                                                        <SelectTrigger id="fromCurr">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="EUR">EUR</SelectItem>
                                                            <SelectItem value="GBP">GBP</SelectItem>
                                                            <SelectItem value="JPY">JPY</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="toCurr">To Currency</Label>
                                                    <Select
                                                        value={newRate.toCurrency}
                                                        onValueChange={(v) => setNewRate({ ...newRate, toCurrency: v })}
                                                    >
                                                        <SelectTrigger id="toCurr">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="USD">USD</SelectItem>
                                                            <SelectItem value="EUR">EUR</SelectItem>
                                                            <SelectItem value="GBP">GBP</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="rate">Exchange Rate *</Label>
                                                <Input
                                                    id="rate"
                                                    type="number"
                                                    step="0.0001"
                                                    value={newRate.rate}
                                                    onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
                                                    placeholder="1.0800"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="date">Conversion Date</Label>
                                                <DatePicker value={newRate.conversionDate} onChange={(v) => setNewRate({ ...newRate, conversionDate: v })} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsManualEntryOpen(false)}>Cancel</Button>
                                            <Button
                                                onClick={() => createRateMutation.mutate(newRate)}
                                                disabled={createRateMutation.isPending || !newRate.rate}
                                            >
                                                {createRateMutation.isPending ? "Saving..." : "Add Rate"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button size="sm">
                                    <Upload className="h-4 w-4 mr-2" /> Upload CSV
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Currency Pair</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Rate</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coverage.map((cov) => (
                                    <TableRow key={cov.currencyPair}>
                                        <TableCell className="font-medium">{cov.currencyPair}</TableCell>
                                        <TableCell>
                                            {cov.hasRate ? (
                                                <StatusBadge status="Active" />
                                            ) : (
                                                <StatusBadge status="Missing" />
                                            )}
                                        </TableCell>
                                        <TableCell>{cov.lastRate ? cov.lastRate.toFixed(4) : "—"}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {cov.lastDate ? format(new Date(cov.lastDate), "MMM dd, yyyy") : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Translation Impact */}
                    <Card className="border-t-4 border-t-green-500">
                        <CardHeader>
                            <CardTitle>Translation Impact</CardTitle>
                            <CardDescription>FX impact by entity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={translationImpact}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="entity" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="originalAmount" fill="#3b82f6" name="Original" />
                                    <Bar dataKey="translatedAmount" fill="#10b981" name="Translated" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Rate Trends */}
                    <Card className="border-t-4 border-t-purple-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5" /> Rate Trends
                            </CardTitle>
                            <CardDescription>
                                <Select value={selectedPair} onValueChange={setSelectedPair}>
                                    <SelectTrigger className="w-32 h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EUR-USD">EUR-USD</SelectItem>
                                        <SelectItem value="GBP-USD">GBP-USD</SelectItem>
                                        <SelectItem value="JPY-USD">JPY-USD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={historicalRates}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis domain={['dataMin - 0.02', 'dataMax + 0.02']} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2} name={selectedPair} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
