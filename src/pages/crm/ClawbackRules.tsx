import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calculator, Percent, Coins, ChevronDown, CheckCircle2, RotateCcw, AlertOctagon } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface ClawbackRule {
    id: string;
    productLine: string;
    timeframe: string;
    trigger: string;
    action: string;
    recoverRate: number;
    active: boolean;
}

export default function ClawbackRules() {

    const rules: ClawbackRule[] = [
        { id: "CB-01", productLine: "SaaS Enterprise", timeframe: "Within 90 Days", trigger: "Customer Cancellation", action: "100% Commission Recovery", recoverRate: 100, active: true },
        { id: "CB-02", productLine: "Implementation Svc", timeframe: "Within 30 Days", trigger: "Failure to Launch / Refund", action: "100% Commission Recovery", recoverRate: 100, active: true },
        { id: "CB-03", productLine: "SaaS Professional", timeframe: "Days 91-180", trigger: "Customer Downgrade", action: "Pro-Rated Recovery", recoverRate: 50, active: true },
        { id: "CB-04", productLine: "Hardware Sales", timeframe: "Any", trigger: "RMA/Return without Exchange", action: "Full Reversal", recoverRate: 100, active: false },
    ];

    const activeEvents = [
        { id: "EVNT-9012", rep: "Michael Ross", customer: "Initech", trigger: "Cancelled Day 45", amount: 4500, status: "Pending Payroll Deduction", period: "Q3 2026" },
        { id: "EVNT-8944", rep: "Emily Chen", customer: "Globex", trigger: "Downgrade Day 112", amount: 1250, status: "Deducted", period: "Q2 2026" },
    ];

    return (
        <StandardPage
            title="Clawback & Reversal Engine"
            description="Manage commission recovery periods, retroactive adjustments, and automated payroll deductions."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Compensation", href: "/crm/compensation" },
                { label: "Clawbacks" }
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-l-4 border-l-red-500 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <RotateCcw className="h-16 w-16 text-red-500" />
                    </div>
                    <CardContent className="p-4 z-10 relative">
                        <p className="text-sm font-medium text-red-800 mb-1">Pending Clawbacks</p>
                        <p className="text-3xl font-black text-red-600">{formatCurrency(24500)}</p>
                        <p className="text-xs text-red-700 mt-1">12 Reps Affected</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-slate-400 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">YTD Recovered</p>
                        <p className="text-3xl font-black text-slate-800">{formatCurrency(85000)}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Retention Risk</p>
                        <p className="text-3xl font-black text-blue-600">Low (1.2%)</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Churn rate inside clawback window</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Disputed Reversals</p>
                        <p className="text-3xl font-black text-amber-600">3</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border shadow-sm">
                    <CardHeader className="pb-4 border-b">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertOctagon className="h-5 w-5 text-primary" /> Active Rules Configuration
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>Product / Contract</TableHead>
                                <TableHead>Time Window</TableHead>
                                <TableHead>Trigger Event</TableHead>
                                <TableHead className="text-right">Recovery Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.map(rule => (
                                <TableRow key={rule.id} className={!rule.active ? "opacity-50 grayscale" : ""}>
                                    <TableCell>
                                        <p className="font-bold text-slate-800">{rule.productLine}</p>
                                        <p className="text-[10px] uppercase text-muted-foreground">{rule.id}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none"><Clock className="h-3 w-3 mr-1" />{rule.timeframe}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600 font-medium">
                                        {rule.trigger}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {rule.recoverRate === 100 ? (
                                                <span className="font-black text-red-600">100%</span>
                                            ) : (
                                                <span className="font-bold text-amber-600">{rule.recoverRate}%</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <Card className="border shadow-sm border-red-100">
                    <CardHeader className="bg-red-50/50 pb-4 border-b border-red-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-red-900">
                            <RotateCcw className="h-5 w-5 text-red-600" /> Recent Execution Log
                        </CardTitle>
                        <CardDescription>Automated reversals triggered in the current period.</CardDescription>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10">
                                <TableHead>Representative</TableHead>
                                <TableHead>Trigger Details</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeEvents.map((evt, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <p className="font-bold text-slate-800">{evt.rep}</p>
                                        <p className="text-xs text-muted-foreground">{evt.period}</p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-medium text-slate-700">{evt.trigger}</p>
                                        <p className="text-xs text-muted-foreground">Acct: {evt.customer}</p>
                                    </TableCell>
                                    <TableCell className="text-right font-black text-red-600">
                                        -{formatCurrency(evt.amount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {evt.status === 'Deducted' ? (
                                            <Badge className="bg-slate-100 border-none text-slate-600 shadow-none"><CheckCircle2 className="h-3 w-3 mr-1" /> Deducted</Badge>
                                        ) : (
                                            <Badge className="bg-red-50 text-red-700 border border-red-200">Pending PR</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </StandardPage>
    );
}
