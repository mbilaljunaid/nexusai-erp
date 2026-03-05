import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    DollarSign,
    Clock,
    FileBarChart,
    Download,
    Filter
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface DeferredItem {
    contractId: string;
    contractNumber: string;
    customerName: string;
    pobName: string;
    deferredBalance: string;
    currentRelease: string;
    nextPeriodRelease: string;
    remainingPeriods: number;
    status: string;
}

interface DeferredSummary {
    totalDeferred: number;
    currentPeriodRelease: number;
    next12MonthsRelease: number;
    contractLiability: number;
    contractAsset: number;
}

export default function DeferredRevenueMatrix() {
    const { toast } = useToast();
    const [asOfDate, setAsOfDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Fetch deferred revenue summary
    const { data: summary, isLoading: summaryLoading } = useQuery<DeferredSummary>({
        queryKey: ["/api/revenue/reporting/deferred", asOfDate],
        queryFn: async () => {
            const res = await fetch(`/api/revenue/reporting/deferred?date=${asOfDate}`);
            if (!res.ok) return {
                totalDeferred: 0,
                currentPeriodRelease: 0,
                next12MonthsRelease: 0,
                contractLiability: 0,
                contractAsset: 0
            };
            return res.json();
        }
    });

    // Fetch deferred items detail
    const { data: items = [], isLoading: itemsLoading } = useQuery<DeferredItem[]>({
        queryKey: ["/api/revenue/reporting/deferred-details", asOfDate],
        queryFn: async () => {
            const res = await fetch(`/api/revenue/reporting/deferred-details?date=${asOfDate}`);
            if (!res.ok) return [];
            return res.json();
        }
    });

    const filteredItems = items.filter(item =>
        filterStatus === "all" || item.status === filterStatus
    );

    const handleExport = () => {
        toast({
            title: "Export Started",
            description: "Deferred revenue report is being generated..."
        });
        // TODO: Implement actual export
    };

    return (
        <StandardPage
            title="Deferred Revenue Matrix"
            description="Track contract liabilities and release schedules"
            actions={
                <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            }
        >

            {/* Summary Metrics */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deferred</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {summaryLoading ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    ${(summary?.totalDeferred || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Outstanding balance
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Period</CardTitle>
                        <Calendar className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        {summaryLoading ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-green-600">
                                    ${(summary?.currentPeriodRelease || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    To be recognized
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next 12 Months</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        {summaryLoading ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-blue-600">
                                    ${(summary?.next12MonthsRelease || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Forecasted release
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contract Liability</CardTitle>
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        {summaryLoading ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-orange-600">
                                    ${(summary?.contractLiability || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Prepaid/unearned
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contract Asset</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        {summaryLoading ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-purple-600">
                                    ${(summary?.contractAsset || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Unbilled revenue
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Deferred Revenue Details</CardTitle>
                            <CardDescription>
                                Active deferral balances by contract and performance obligation
                            </CardDescription>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Satisfied">Satisfied</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="matrix">
                        <TabsList>
                            <TabsTrigger value="matrix">Matrix View</TabsTrigger>
                            <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
                            <TabsTrigger value="schedule">Release Schedule</TabsTrigger>
                        </TabsList>

                        <TabsContent value="matrix" className="mt-4">
                            {itemsLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : filteredItems.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileBarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No deferred revenue items found</p>
                                    <p className="text-sm mt-1">
                                        {filterStatus !== "all"
                                            ? "Try changing the filter"
                                            : "All revenue has been recognized"}
                                    </p>
                                </div>
                            ) : (
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Contract</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Performance Obligation</TableHead>
                                                <TableHead className="text-right">Deferred Balance</TableHead>
                                                <TableHead className="text-right">Current Release</TableHead>
                                                <TableHead className="text-right">Next Period</TableHead>
                                                <TableHead className="text-center">Remaining</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredItems.map((item, idx) => (
                                                <TableRow key={idx} className="hover:bg-slate-50">
                                                    <TableCell className="font-mono text-sm">
                                                        {item.contractNumber}
                                                    </TableCell>
                                                    <TableCell>{item.customerName}</TableCell>
                                                    <TableCell className="font-medium">
                                                        {item.pobName}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-semibold">
                                                        ${parseFloat(item.deferredBalance).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-green-600">
                                                        ${parseFloat(item.currentRelease).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-blue-600">
                                                        ${parseFloat(item.nextPeriodRelease).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="font-mono">
                                                            {item.remainingPeriods} periods
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                item.status === "Active"
                                                                    ? "default"
                                                                    : item.status === "Satisfied"
                                                                        ? "secondary"
                                                                        : "destructive"
                                                            }
                                                        >
                                                            {item.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="aging" className="mt-4">
                            <div className="text-center py-12 text-muted-foreground">
                                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Aging analysis coming soon</p>
                                <p className="text-sm mt-1">
                                    View deferred revenue by aging buckets (0-30, 31-60, 61-90, 90+ days)
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="schedule" className="mt-4">
                            <div className="text-center py-12 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Release schedule coming soon</p>
                                <p className="text-sm mt-1">
                                    View forecasted revenue release by period for the next 12 months
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
