import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PDFExportButton } from "@/components/shared/PDFExportButton";
import { FileDown, Calendar, Calculator, Info } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, PenTool, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { StandardPage } from '@/components/layout/StandardPage';
import { ExportButton } from "@/components/ExportButton";
import { formatCurrency } from "@/lib/formatters";

interface LeaseSchedule {
    period: number;
    date: string;
    openingLiability: string;
    interestExpense: string;
    paymentAmount: string;
    closingLiability: string;
    rouOpeningBalance: string;
    amortizationExpense: string;
    rouClosingBalance: string;
}

interface LeaseDetail {
    id: string;
    leaseName: string;
    leaseType: "Finance" | "Operating";
    status: string;
    startDate: string;
    endDate: string;
    totalValue: number;
    discountRate: number;
    currency: string;
}

export default function LeaseSchedulesView({ leaseId }: { leaseId: string }) {
    const [activeTab, setActiveTab] = useState<"payment" | "rou">("payment");
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();

    // Fetch lease basic info
    const { data: lease } = useQuery<LeaseDetail>({
        queryKey: [`/api/lease/leases/${leaseId}`],
        queryFn: async () => {
            const res = await fetch(`/api/lease/leases/${leaseId}`);
            if (!res.ok) throw new Error("Failed to fetch lease details");
            return res.json();
        }
    });

    // Fetch payment schedules
    const { data: schedules = [], isLoading } = useQuery<LeaseSchedule[]>({
        queryKey: [`/api/lease/leases/${leaseId}/schedules`],
        queryFn: async () => {
            const res = await fetch(`/api/lease/leases/${leaseId}/schedules`);
            if (!res.ok) throw new Error("Failed to fetch schedules");
            return res.json();
        }
    });

    const generateScheduleMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/lease/leases/${leaseId}/generate-schedule`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to generate schedule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/lease/leases/${leaseId}/schedules`] });
        }
    });

    const exportData = schedules.map(row => ({
        "Period": row.period,
        "Date": format(new Date(row.date), 'yyyy-MM-dd'),
        "Opening Liability": parseFloat(row.openingLiability),
        "Payment": parseFloat(row.paymentAmount),
        "Interest": parseFloat(row.interestExpense),
        "Principal": (parseFloat(row.paymentAmount) - parseFloat(row.interestExpense)),
        "Closing Liability": parseFloat(row.closingLiability),
        "Opening ROU": parseFloat(row.rouOpeningBalance),
        "Amortization": parseFloat(row.amortizationExpense),
        "Closing ROU": parseFloat(row.rouClosingBalance)
    }));

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (e) {
            return dateString;
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading schedules...</div>;
    }

    return (
        <StandardPage title="Amortization Schedule">
            <div className="space-y-6">
                {/* Lease Overview Header */}
                {lease && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>{lease.leaseName} - Amortization Schedule</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {lease.leaseType} Lease • {lease.discountRate}% Incremental Borrowing Rate
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setLocation(`/finance/leases/${leaseId}/modify`)}
                                >
                                    <PenTool className="mr-2 h-4 w-4" /> Remeasure Lease
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => generateScheduleMutation.mutate()}
                                    disabled={generateScheduleMutation.isPending}
                                >
                                    {generateScheduleMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                    )}
                                    Regenerate Schedule
                                </Button>
                                <ExportButton
                                    data={exportData}
                                    filename={`Lease_Schedule_${leaseId}_${format(new Date(), 'yyyy-MM-dd')}`}
                                />
                                <PDFExportButton
                                    endpoint={`/api/lease/leases/${leaseId}/schedules/pdf`}
                                    label="Download PDF"
                                    filename={`Lease_Schedule_${leaseId}.pdf`}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Commencement Date</p>
                                    <p className="font-medium">{formatDate(lease.startDate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">End Date</p>
                                    <p className="font-medium">{formatDate(lease.endDate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Initial Liability (NPV)</p>
                                    <p className="font-bold text-lg text-blue-600">
                                        {formatCurrency(lease.totalValue, lease.currency)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Accounting Standard</p>
                                    <Badge variant="outline" className="border-blue-500 text-blue-600">
                                        ASC 842 / IFRS 16
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Visualization */}
                <Card>
                    <CardHeader>
                        <CardTitle>Accounting Projections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={schedules}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={formatDate} fontSize={10} />
                                    <YAxis fontSize={10} tickFormatter={(v) => formatCurrency(v).replace('$', '') + 'k'} />
                                    <Tooltip
                                        formatter={(v: number) => formatCurrency(v)}
                                        labelFormatter={formatDate}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="closingLiability"
                                        stroke="#ef4444"
                                        name="Lease Liability"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="rouClosingBalance"
                                        stroke="#3b82f6"
                                        name="ROU Asset Value"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Detailed Schedule</CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant={activeTab === "payment" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveTab("payment")}
                            >
                                Liability & Payments
                            </Button>
                            <Button
                                variant={activeTab === "rou" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveTab("rou")}
                            >
                                ROU Asset Amortization
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">Period</TableHead>
                                    <TableHead>Date</TableHead>
                                    {activeTab === "payment" ? (
                                        <>
                                            <TableHead className="text-right">Opening Liability</TableHead>
                                            <TableHead className="text-right">Payment</TableHead>
                                            <TableHead className="text-right">Interest</TableHead>
                                            <TableHead className="text-right">Principal Reduction</TableHead>
                                            <TableHead className="text-right">Closing Liability</TableHead>
                                        </>
                                    ) : (
                                        <>
                                            <TableHead className="text-right">Opening ROU</TableHead>
                                            <TableHead className="text-right">Amortization</TableHead>
                                            <TableHead className="text-right">Impairment/Adj</TableHead>
                                            <TableHead className="text-right">Closing ROU</TableHead>
                                        </>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.map((row) => (
                                    <TableRow key={row.period}>
                                        <TableCell className="font-medium">#{row.period}</TableCell>
                                        <TableCell>{formatDate(row.date)}</TableCell>
                                        {activeTab === "payment" ? (
                                            <>
                                                <TableCell className="text-right">{formatCurrency(row.openingLiability)}</TableCell>
                                                <TableCell className="text-right font-medium text-red-600">{formatCurrency(row.paymentAmount)}</TableCell>
                                                <TableCell className="text-right text-orange-600">{formatCurrency(row.interestExpense)}</TableCell>
                                                <TableCell className="text-right text-green-600">{formatCurrency(parseFloat(row.paymentAmount) - parseFloat(row.interestExpense))}</TableCell>
                                                <TableCell className="text-right font-bold">{formatCurrency(row.closingLiability)}</TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell className="text-right">{formatCurrency(row.rouOpeningBalance)}</TableCell>
                                                <TableCell className="text-right text-blue-600">{formatCurrency(row.amortizationExpense)}</TableCell>
                                                <TableCell className="text-right">$0.00</TableCell>
                                                <TableCell className="text-right font-bold">{formatCurrency(row.rouClosingBalance)}</TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg text-sm">
                    <Info className="h-4 w-4 text-blue-500" />
                    <p className="text-muted-foreground">
                        Schedules are generated based on the selected discount rate and payment frequency defined in the lease agreement.
                        Standard accounting rules for {lease?.leaseType} leases apply.
                    </p>
                </div>
            </div>
        </StandardPage>
    );
}
