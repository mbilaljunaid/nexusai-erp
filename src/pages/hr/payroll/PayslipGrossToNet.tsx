import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend
} from 'recharts';
import {
    FileText,
    Download,
    Mail,
    ChevronDown,
    ChevronRight,
    ArrowRightCircle,
    Building2,
    Briefcase
} from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";

// Mock Data
const payslipData = {
    employee: {
        name: "Sarah Jenkins",
        id: "N2091",
        jobTitle: "Senior Software Engineer",
        department: "Engineering",
        manager: "David Chen",
        location: "San Francisco, CA"
    },
    period: {
        start: "Feb 16, 2026",
        end: "Feb 28, 2026",
        payDate: "Mar 05, 2026",
        type: "Regular - BiWeekly"
    },
    summary: {
        grossPay: 5125.00,
        preTaxDeductions: 450.00,
        taxes: 1120.50,
        postTaxDeductions: 50.00,
        netPay: 3504.50,
        employerTaxes: 395.00,
        employerBenefits: 850.00
    },
    earnings: [
        { id: "e1", name: "Regular Salary", hours: 80, rate: 64.06, amount: 5125.00, ytd: 15375.00 },
        { id: "e2", name: "Bonus", hours: null, rate: null, amount: 0.00, ytd: 5000.00 }
    ],
    preTax: [
        { id: "pt1", name: "401k Contribution (6%)", amount: 307.50, ytd: 922.50 },
        { id: "pt2", name: "Medical Insurance - PPO", amount: 125.00, ytd: 375.00 },
        { id: "pt3", name: "Dental Insurance", amount: 17.50, ytd: 52.50 }
    ],
    taxes: [
        { id: "t1", name: "Federal Income Tax", amount: 615.00, ytd: 1845.00 },
        { id: "t2", name: "Social Security (FICA)", amount: 317.75, ytd: 953.25 },
        { id: "t3", name: "Medicare", amount: 74.31, ytd: 222.93 },
        { id: "t4", name: "CA State Income Tax", amount: 113.44, ytd: 340.32 }
    ],
    postTax: [
        { id: "po1", name: "Roth 401k", amount: 50.00, ytd: 150.00 }
    ]
};

const COLORS = ['#14b8a6', '#f59e0b', '#ef4444', '#6366f1']; // Teal, Amber, Red, Indigo

export default function PayslipGrossToNet() {
    const { toast } = useToast();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        earnings: true,
        preTax: true,
        taxes: true,
        postTax: false
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleDownload = () => {
        toast({ title: "Downloading PDF", description: "Your payslip is generating." });
    };

    const chartData = [
        { name: 'Net Pay', value: payslipData.summary.netPay, color: COLORS[0] },
        { name: 'Pre-Tax Deds', value: payslipData.summary.preTaxDeductions, color: COLORS[1] },
        { name: 'Taxes', value: payslipData.summary.taxes, color: COLORS[2] },
        { name: 'Post-Tax Deds', value: payslipData.summary.postTaxDeductions, color: COLORS[3] },
    ];

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const BreakdownRow = ({ item, isSubRow = false }: { item: any; isSubRow?: boolean }) => (
        <div className={cn(`grid grid-cols-12 gap-4 py-2 text-sm ${isSubRow ? 'text-muted-foreground pl-6' : 'font-medium'}`)}>
            <div className="col-span-4 lg:col-span-5">{item.name}</div>
            <div className="col-span-2 text-right hidden md:block">{item.hours ? item.hours.toFixed(2) : '-'}</div>
            <div className="col-span-2 text-right hidden md:block">{item.rate ? formatCurrency(item.rate) : '-'}</div>
            <div className="col-span-3 md:col-span-2 text-right">{formatCurrency(item.amount)}</div>
            <div className="col-span-3 md:col-span-2 text-right text-muted-foreground">{formatCurrency(item.ytd)}</div>
        </div>
    );

    return (
        <StandardPage
            title="Payslip Details"
            description="Detailed gross-to-net breakdown for the selected pay period."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Payroll', href: '/hr/payroll/workbench' },
                { label: 'Runs', href: '/hr/payroll' },
                { label: 'Payslip' }
            ]}
        >
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header Actions */}
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold">{payslipData.employee.name}</h2>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {payslipData.employee.jobTitle}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {payslipData.employee.department}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-2" /> PDF
                        </Button>
                        <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4 mr-2" /> Email
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Breakdown Area */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                            <div className="bg-muted/20 px-6 py-4 border-b flex justify-between items-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                <span>Period: {payslipData.period.start} - {payslipData.period.end}</span>
                                <span>Pay Date: {payslipData.period.payDate}</span>
                            </div>

                            <CardContent className="p-0">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-500/10 dark:bg-zinc-900 border-b text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    <div className="col-span-4 lg:col-span-5">Description</div>
                                    <div className="col-span-2 text-right hidden md:block">Hours</div>
                                    <div className="col-span-2 text-right hidden md:block">Rate</div>
                                    <div className="col-span-3 md:col-span-2 text-right">Current</div>
                                    <div className="col-span-3 md:col-span-2 text-right">YTD</div>
                                </div>

                                {/* Earnings Section */}
                                <div className="border-b group">
                                    <div className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-500/10 dark:hover:bg-zinc-900/50 transition-colors" onClick={() => toggleSection('earnings')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                                        <div className="flex items-center gap-2 font-bold text-teal-700 dark:text-teal-400">
                                            {expandedSections.earnings ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            Earnings
                                        </div>
                                        <div className="font-bold">{formatCurrency(payslipData.summary.grossPay)}</div>
                                    </div>
                                    {expandedSections.earnings && (
                                        <div className="px-6 pb-4 pt-1 space-y-1 bg-white dark:bg-zinc-950">
                                            {payslipData.earnings.map(e => <BreakdownRow key={e.id} item={e} />)}
                                        </div>
                                    )}
                                </div>

                                {/* Pre-Tax Deductions */}
                                <div className="border-b group">
                                    <div className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-500/10 dark:hover:bg-zinc-900/50 transition-colors" onClick={() => toggleSection('preTax')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                                        <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-500">
                                            {expandedSections.preTax ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            Pre-Tax Deductions
                                        </div>
                                        <div className="font-bold text-amber-700 dark:text-amber-500">-{formatCurrency(payslipData.summary.preTaxDeductions)}</div>
                                    </div>
                                    {expandedSections.preTax && (
                                        <div className="px-6 pb-4 pt-1 space-y-1 bg-white dark:bg-zinc-950">
                                            {payslipData.preTax.map(e => <BreakdownRow key={e.id} item={e} isSubRow />)}
                                        </div>
                                    )}
                                </div>

                                {/* Taxes */}
                                <div className="border-b group">
                                    <div className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-500/10 dark:hover:bg-zinc-900/50 transition-colors" onClick={() => toggleSection('taxes')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                                        <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-500">
                                            {expandedSections.taxes ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            Taxes
                                        </div>
                                        <div className="font-bold text-red-700 dark:text-red-500">-{formatCurrency(payslipData.summary.taxes)}</div>
                                    </div>
                                    {expandedSections.taxes && (
                                        <div className="px-6 pb-4 pt-1 space-y-1 bg-white dark:bg-zinc-950">
                                            {payslipData.taxes.map(e => <BreakdownRow key={e.id} item={e} isSubRow />)}
                                        </div>
                                    )}
                                </div>

                                {/* Post-Tax Deductions */}
                                <div className="border-b group">
                                    <div className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-500/10 dark:hover:bg-zinc-900/50 transition-colors" onClick={() => toggleSection('postTax')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                                        <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-400">
                                            {expandedSections.postTax ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            Post-Tax Deductions
                                        </div>
                                        <div className="font-bold text-indigo-700 dark:text-indigo-400">-{formatCurrency(payslipData.summary.postTaxDeductions)}</div>
                                    </div>
                                    {expandedSections.postTax && (
                                        <div className="px-6 pb-4 pt-1 space-y-1 bg-white dark:bg-zinc-950">
                                            {payslipData.postTax.map(e => <BreakdownRow key={e.id} item={e} isSubRow />)}
                                        </div>
                                    )}
                                </div>

                                {/* Net Pay Footer */}
                                <div className="px-6 py-5 bg-teal-500/10 text-teal-900 dark:text-teal-100 flex items-center justify-between">
                                    <div className="font-black text-xl flex items-center gap-2">
                                        <ArrowRightCircle className="h-6 w-6 text-teal-600" /> Net Pay
                                    </div>
                                    <div className="font-black text-2xl tracking-tight">{formatCurrency(payslipData.summary.netPay)}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Summary Widget */}
                        <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/20 pb-4 border-b">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <PieChart className="h-4 w-4" /> Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="h-48 w-full mb-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2">
                                    {chartData.map(item => (
                                        <div key={item.name} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                {item.name}
                                            </div>
                                            <div className="font-semibold">{formatCurrency(item.value)}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Employer Contributions (Hidden value) */}
                        <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                            <CardHeader className="pb-4 border-b">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Employer Paid Benefits & Taxes</CardTitle>
                                <CardDescription className="text-xs">Contributions paid by the company on your behalf (Not deducted from your pay).</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Employer Taxes (FICA Match, FUTA, SUTA)</span>
                                    <span className="font-medium">{formatCurrency(payslipData.summary.employerTaxes)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Health & Welfare Benefits</span>
                                    <span className="font-medium">{formatCurrency(payslipData.summary.employerBenefits)}</span>
                                </div>
                                <div className="pt-3 border-t flex justify-between items-center font-bold text-sm">
                                    <span>Total Value Added</span>
                                    <span className="text-teal-600 dark:text-teal-400">{formatCurrency(payslipData.summary.employerTaxes + payslipData.summary.employerBenefits)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </StandardPage>
    );
}
