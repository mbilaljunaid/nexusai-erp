import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, DollarSign, Percent, MinusCircle, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { generatePayAppPDF, type PayAppData } from "./reports/PayAppPDFGenerator";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from '@/lib/formatters';

interface PayAppSummaryProps {
    payApp: {
        applicationNumber: number;
        periodEnd: string;
        scheduledValue: string;
        totalCompleted: string;
        previousAmount: string;
        workThisPeriod: string;
        materialsStored: string;
        retentionPercent: number;
        retentionAmount: string;
        currentPaymentDue: string;
        status: string;
    };
    className?: string;
}

export function PayAppSummary({ payApp, className }: PayAppSummaryProps) {
    const { toast } = useToast();
    const scheduled = Number(payApp.scheduledValue || 0);
    const totalCompleted = Number(payApp.totalCompleted || 0);
    const previous = Number(payApp.previousAmount || 0);
    const thisPeriod = Number(payApp.workThisPeriod || totalCompleted - previous);
    const retention = Number(payApp.retentionAmount || 0);
    const paymentDue = Number(payApp.currentPaymentDue || 0);

    const percentComplete = scheduled > 0 ? (totalCompleted / scheduled) * 100 : 0;
    const balance = scheduled - totalCompleted;

    const changeFromPrevious = previous > 0 ? ((thisPeriod / previous) * 100) : 0;
    const isIncrease = changeFromPrevious > 0;

    const handleExportPDF = async () => {
        try {
            const pdfData: PayAppData = {
                applicationNumber: payApp.applicationNumber,
                periodEnding: payApp.periodEnd,
                projectNumber: "PRJ-2026-001",
                projectName: "Sample Construction Project",
                contractorName: "ABC Construction Co.",
                ownerName: "XYZ Development LLC",
                contractDate: "2026-01-01",
                originalContractSum: scheduled,
                changeOrders: 0,
                currentContractSum: scheduled,
                retainageRate: payApp.retentionPercent,
                lineItems: [
                    {
                        itemNumber: "01",
                        description: "Site Work & Foundations",
                        scheduledValue: scheduled * 0.3,
                        workCompleted: totalCompleted * 0.3,
                        materialsStored: 0,
                        totalCompleted: totalCompleted * 0.3
                    },
                    {
                        itemNumber: "02",
                        description: "Structural Framing",
                        scheduledValue: scheduled * 0.4,
                        workCompleted: totalCompleted * 0.4,
                        materialsStored: 0,
                        totalCompleted: totalCompleted * 0.4
                    },
                    {
                        itemNumber: "03",
                        description: "Finishing & MEP",
                        scheduledValue: scheduled * 0.3,
                        workCompleted: totalCompleted * 0.3,
                        materialsStored: 0,
                        totalCompleted: totalCompleted * 0.3
                    }
                ],
                companyName: "Construction Management System"
            };

            await generatePayAppPDF(pdfData);
            toast({ title: "PDF Generated", description: "Pay application PDF downloaded successfully." });
        } catch (error) {
            toast({ title: "Export Failed", description: "Failed to generate PDF.", variant: "destructive" });
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex justify-between items-center">
                        <span>Application #{payApp.applicationNumber} Summary</span>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={handleExportPDF}>
                                <FileDown className="h-4 w-4 mr-1" />
                                Export PDF
                            </Button>
                            <Badge variant={payApp.status === "CERTIFIED" ? "default" : "outline"}>
                                {payApp.status.replace(/_/g, " ")}
                            </Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Main Financial Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Original Contract Amount</div>
                            <div className="text-2xl font-bold font-mono">${formatNumber(scheduled)}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Percentage Complete</div>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-green-600">{percentComplete.toFixed(1)}%</div>
                                <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                                    {/* Tailwind JIT does not generate arbitrary values for dynamic widths at runtime,
                                        so an inline style is used here. */}
                                    <div
                                        className="bg-green-600 h-full transition-all"
                                        style={{ width: `${Math.min(percentComplete, 100)}%`}}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Current vs Previous */}
                    <div>
                        <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Current Period Breakdown
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-200">
                                <div className="text-xs text-blue-700 mb-1">Previous Amount</div>
                                <div className="font-mono font-bold text-blue-900 dark:text-blue-200">${formatNumber(previous)}</div>
                            </div>
                            <div className="bg-green-500/10 p-3 rounded-lg border border-green-200">
                                <div className="text-xs text-green-700 mb-1 flex items-center gap-1">
                                    Work This Period
                                    {isIncrease && changeFromPrevious > 0 && (
                                        <Badge variant="outline" className="text-[10px] py-0 px-1">
                                            <TrendingUp className="h-3 w-3 mr-0.5" />
                                            {changeFromPrevious.toFixed(0)}%
                                        </Badge>
                                    )}
                                </div>
                                <div className="font-mono font-bold text-green-900 dark:text-green-200">${formatNumber(thisPeriod)}</div>
                            </div>
                            <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-200">
                                <div className="text-xs text-purple-700 mb-1">Total to Date</div>
                                <div className="font-mono font-bold text-purple-900 dark:text-purple-200">${formatNumber(totalCompleted)}</div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Retainage & Payment */}
                    <div>
                        <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <MinusCircle className="h-4 w-4" />
                            Retainage & Net Payment
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm">Total Completed & Stored to Date</span>
                                <span className="font-mono font-semibold">${formatNumber(totalCompleted)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm flex items-center gap-2">
                                    Retainage ({payApp.retentionPercent}%)
                                    <Percent className="h-3 w-3 text-muted-foreground" />
                                </span>
                                <span className="font-mono font-semibold text-red-600">(${formatNumber(retention)})</span>
                            </div>
                            <div className="flex justify-between items-center py-3 bg-green-500/10 px-3 rounded-lg">
                                <span className="font-semibold">Current Payment Due</span>
                                <span className="font-mono text-xl font-bold text-green-700">${formatNumber(paymentDue)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Balance Remaining */}
                    <div className="bg-gray-500/10 p-4 rounded-lg border">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Balance to Finish</div>
                                <div className="font-mono text-2xl font-bold">${formatNumber(balance)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground mb-1">Remaining %</div>
                                <div className="text-2xl font-bold">{(100 - percentComplete).toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
