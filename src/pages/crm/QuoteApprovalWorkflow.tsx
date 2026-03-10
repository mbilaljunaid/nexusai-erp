import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, XCircle, Clock, ArrowRightLeft, ScrollText, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface ApprovalRequest {
    id: string;
    quoteNumber: string;
    customer: string;
    rep: string;
    amount: number;
    margin: number;
    discountPct: number;
    status: "PENDING_SALES_DIR" | "PENDING_VP" | "PENDING_CFO" | "APPROVED" | "REJECTED";
    submittedDate: string;
    flags: string[];
}

export default function QuoteApprovalWorkflow() {

    const requests: ApprovalRequest[] = [
        { id: "APR-8842", quoteNumber: "QT-2026-941", customer: "Globex Corporation", rep: "Sarah Jenkins", amount: 450000, margin: 42.5, discountPct: 25, status: "PENDING_VP", submittedDate: "10 mins ago", flags: ["High Discount", "Enterprise Tier"] },
        { id: "APR-8841", quoteNumber: "QT-2026-938", customer: "Initech", rep: "Michael Ross", amount: 85000, margin: 55.0, discountPct: 15, status: "PENDING_SALES_DIR", submittedDate: "1 hr ago", flags: ["Standard Routing"] },
        { id: "APR-8839", quoteNumber: "QT-2026-920", customer: "Massive Dynamic", rep: "Emily Chen", amount: 1250000, margin: 31.2, discountPct: 35, status: "PENDING_CFO", submittedDate: "4 hrs ago", flags: ["Margin Floor Violation", "Major Account"] },
        { id: "APR-8830", quoteNumber: "QT-2026-911", customer: "Soylent Corp", rep: "David Kim", amount: 210000, margin: 62.1, discountPct: 10, status: "APPROVED", submittedDate: "1 day ago", flags: [] },
    ];

    const getStatusUI = (status: string) => {
        switch (status) {
            case "PENDING_SALES_DIR": return { badge: <Badge className="bg-amber-100 text-amber-800 border-none">Sales Dir Review</Badge>, step: 1 };
            case "PENDING_VP": return { badge: <Badge className="bg-orange-100 text-orange-800 border-none">VP Sales Review</Badge>, step: 2 };
            case "PENDING_CFO": return { badge: <Badge className="bg-red-100 text-red-800 border-none">CFO Final Review</Badge>, step: 3 };
            case "APPROVED": return { badge: <Badge className="bg-emerald-100 text-emerald-800 border-none"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>, step: 4 };
            case "REJECTED": return { badge: <Badge className="bg-slate-100 text-slate-800 border-none"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>, step: 0 };
            default: return { badge: null, step: 0 };
        }
    };

    return (
        <StandardPage
            title="Quote Approval Workflows"
            description="Manage multi-level hierarchical approvals based on discount percentages and margin floors."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "CPQ", href: "/crm/quotes" },
                { label: "Approvals" }
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="col-span-1 border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">Active Ruleset</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">1</div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Discount &gt; 10%</p>
                                <p className="text-xs text-muted-foreground">Routes to Regional Sales Director</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 font-bold">2</div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Discount &gt; 20% OR Amt &gt; $250k</p>
                                <p className="text-xs text-muted-foreground">Routes to VP of Sales</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0 font-bold">3</div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Margin &lt; 40% OR Amt &gt; $1M</p>
                                <p className="text-xs text-muted-foreground">Routes to CFO (Final)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2 border shadow-sm">
                    <CardHeader className="pb-4 border-b">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ScrollText className="h-5 w-5 text-slate-600" /> My Pending Approvals
                            </CardTitle>
                            <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> 2 Action Required</Badge>
                        </div>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>Quote / Customer</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Discount</TableHead>
                                <TableHead className="text-right">Margin</TableHead>
                                <TableHead>Workflow Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map(req => {
                                const ui = getStatusUI(req.status);
                                const isActionable = req.status === "PENDING_VP"; // Mocking that user is VP of Sales

                                return (
                                    <TableRow key={req.id} className={isActionable ? "bg-amber-50/50" : ""}>
                                        <TableCell>
                                            <p className="font-bold text-primary">{req.quoteNumber}</p>
                                            <p className="font-medium text-slate-800">{req.customer}</p>
                                            <p className="text-xs text-muted-foreground">Rep: {req.rep}</p>
                                            {req.flags.length > 0 && (
                                                <div className="mt-1 flex gap-1">
                                                    {req.flags.map((f, i) => (
                                                        <Badge key={i} variant="outline" className="text-[9px] h-4 py-0 px-1 border-amber-200 text-amber-700 bg-amber-50"><AlertTriangle className="h-2 w-2 mr-1" />{f}</Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-black">{formatCurrency(req.amount)}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={`font-bold ${req.discountPct > 20 ? 'text-red-500' : 'text-amber-500'}`}>{req.discountPct}%</span>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{req.margin}%</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2">
                                                {ui.badge}
                                                <div className="flex items-center gap-1">
                                                    <div className={`h-1.5 flex-1 rounded-full ${ui.step >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                                    <div className={`h-1.5 flex-1 rounded-full ${ui.step >= 2 ? 'bg-emerald-500' : req.status === "PENDING_VP" ? 'bg-amber-400 animate-pulse' : 'bg-slate-200'}`}></div>
                                                    <div className={`h-1.5 flex-1 rounded-full ${ui.step >= 3 ? 'bg-emerald-500' : req.status === "PENDING_CFO" ? 'bg-red-400 animate-pulse' : 'bg-slate-200'}`}></div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isActionable ? (
                                                <div className="flex justify-end gap-1">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"><CheckCircle2 className="h-4 w-4" /></Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100"><XCircle className="h-4 w-4" /></Button>
                                                </div>
                                            ) : (
                                                <Button variant="ghost" size="sm" className="text-xs">View</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </StandardPage>
    );
}
