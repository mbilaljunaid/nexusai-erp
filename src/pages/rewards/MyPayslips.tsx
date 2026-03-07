
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { FileText, Download, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';


export default function MyPayslips() {
    const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

    const { data: payslips, isLoading } = useQuery<any>({
        queryKey: ['my-payslips'],
        queryFn: async () => {
            const res = await fetch("/api/me/payslips");
            if (!res.ok) throw new Error("Failed to fetch payslips");
            return res.json();
        }
    });

    const { data: details, isLoading: isLoadingDetails } = useQuery<any>({
        queryKey: ['my-payslip-details', selectedRunId],
        enabled: !!selectedRunId,
        queryFn: async () => {
            const res = await fetch(`/api/me/payslips/${selectedRunId}`);
            if (!res.ok) throw new Error("Failed to fetch details");
            return res.json();
        }
    });

    // Calculate totals for the detail view
    const earnings = details?.filter((d: any) => !d.elementName.includes("Tax") && !d.elementName.includes("Insurance")) || [];
    const deductions = details?.filter((d: any) => d.elementName.includes("Tax") || d.elementName.includes("Insurance")) || [];

    const totalEarnings = earnings.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
    const totalDeductions = deductions.reduce((acc: number, curr: any) => acc + Math.abs(Number(curr.amount)), 0);
    const netPay = totalEarnings - totalDeductions;

    return (
        <StandardPage title="${formatNumber(netPay, 2)}">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Payslips</h2>
                    <p className="text-muted-foreground">View and download your monthly pay statements.</p>
                </div>
            </div>

            {/* Payslip History List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading && <p>Loading payslips...</p>}
                {payslips?.map((payslip: any) => (
                    <Card key={payslip.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setSelectedRunId(payslip.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {payslip.periodName}
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${formatNumber(Number(payslip.totalNet))}</div>
                            <p className="text-xs text-muted-foreground">
                                Paid on {format(new Date(payslip.paymentDate || payslip.periodEndDate), 'MMM dd, yyyy')}
                            </p>
                            <div className="mt-4 flex gap-2">
                                <StatusBadge status="active" label="Paid" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Payslip Detail Sheet */}
            <Sheet open={!!selectedRunId} onOpenChange={() => setSelectedRunId(null)}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Payslip Details</SheetTitle>
                        <SheetDescription>
                            Period: {payslips?.find((p: any) => p.id === selectedRunId)?.periodName}
                        </SheetDescription>
                    </SheetHeader>

                    {isLoadingDetails ? (
                        <div className="py-8 text-center">Loading details...</div>
                    ) : (
                        <div className="mt-8 space-y-8">
                            {/* Net Pay Hero */}
                            <div className="bg-primary/5 p-6 rounded-lg text-center border border-primary/10">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Net Pay</p>

                            </div>

                            {/* Earnings Section */}
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                    <TrendingUp className="h-5 w-5 text-green-600" /> Earnings
                                </h3>
                                <div className="space-y-3">
                                    {earnings.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0 border-border/50">
                                            <span className="font-medium">{item.elementName}</span>
                                            <span>${formatNumber(Number(item.amount), 2)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-2 font-bold text-lg">
                                        <span>Total Earnings</span>
                                        <span>${formatNumber(totalEarnings, 2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Deductions Section */}
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                    <TrendingDown className="h-5 w-5 text-red-600" /> Deductions & Taxes
                                </h3>
                                <div className="space-y-3">
                                    {deductions.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0 border-border/50">
                                            <span className="text-muted-foreground">{item.elementName}</span>
                                            <span className="text-red-600">-${Math.abs(Number(item.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-2 font-bold text-lg">
                                        <span>Total Deductions</span>
                                        <span className="text-red-600">-${formatNumber(totalDeductions, 2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex justify-end">
                                <Button variant="outline" onClick={() => window.open(`/api/me/payslips/${selectedRunId}/pdf`, '_blank')}>
                                    <Download className="mr-2 h-4 w-4" /> Download PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </StandardPage>
    );
}
