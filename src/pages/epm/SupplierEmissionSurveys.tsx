import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Leaf, Send, AlertTriangle, CheckCircle2, Clock, MapPin, Factory, BarChart3, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface SupplierSurvey {
    id: string;
    supplierName: string;
    category: string;
    location: string;
    status: "Completed" | "Pending" | "Overdue";
    score: number | null;
    emissionsMt: number | null;
    lastUpdated: string;
}

export default function SupplierEmissionSurveys() {

    const surveys: SupplierSurvey[] = [
        { id: "SUR-2026-991", supplierName: "Global Logistics Inc", category: "Transportation", location: "Rotterdam, NL", status: "Completed", score: 82, emissionsMt: 14500, lastUpdated: "2 days ago" },
        { id: "SUR-2026-990", supplierName: "Shenzhen Electronics", category: "Hardware Mfg", location: "Shenzhen, CN", status: "Overdue", score: null, emissionsMt: null, lastUpdated: "14 days ago" },
        { id: "SUR-2026-989", supplierName: "EcoPak Solutions", category: "Packaging", location: "Portland, OR", status: "Completed", score: 95, emissionsMt: 2100, lastUpdated: "5 days ago" },
        { id: "SUR-2026-985", supplierName: "Acme Industrial", category: "Raw Materials", location: "Detroit, MI", status: "Pending", score: null, emissionsMt: null, lastUpdated: "Sent 3 days ago" },
    ];

    const getStatusUI = (status: string) => {
        switch (status) {
            case "Completed": return <Badge className="bg-emerald-100 text-emerald-800 border-none"><CheckCircle2 className="h-3 w-3 mr-1" /> Verified</Badge>;
            case "Pending": return <Badge className="bg-amber-100 text-amber-800 border-none"><Clock className="h-3 w-3 mr-1" /> Awaiting Response</Badge>;
            case "Overdue": return <Badge className="bg-red-100 text-red-800 border-none"><AlertTriangle className="h-3 w-3 mr-1" /> Escalated</Badge>;
            default: return null;
        }
    };

    const getScoreColor = (score: number | null) => {
        if (!score) return "text-muted-foreground";
        if (score >= 90) return "text-emerald-600";
        if (score >= 70) return "text-amber-600";
        return "text-red-600";
    };

    return (
        <StandardPage
            title="Supplier Scope 3 Emission Surveys"
            description="Manage and track ESG questionnaires sent to upstream supply chain partners to calculate overall Scope 3 carbon footprint."
            breadcrumbs={[
                { label: "EPM", href: "/epm" },
                { label: "Sustainability", href: "/epm/esg" },
                { label: "Supplier Surveys" }
            ]}
            actions={
                <Button>
                    <Send className="h-4 w-4 mr-2" /> Dispatch Annual Survey Batch
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Response Rate (FY26)</p>
                        <p className="text-3xl font-black text-slate-800">74.2%</p>
                        <Progress value={74.2} className="h-1.5 mt-2 bg-emerald-100" indicatorClassName="bg-emerald-500" />
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Tracked Scope 3 Footprint</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black text-blue-600">845k</p>
                            <span className="text-sm font-bold text-slate-500">MT CO₂e</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-amber-800 mb-1">Average Supplier Score</p>
                        <p className="text-3xl font-black text-amber-600">72/100</p>
                        <p className="text-xs text-amber-700/80 mt-1">Below target of 80</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary bg-primary/5 shadow-sm overflow-hidden relative">
                    <div className="absolute right-[-10px] top-[-10px] opacity-10"><Leaf className="h-24 w-24" /></div>
                    <CardContent className="p-4 z-10 relative">
                        <p className="text-sm font-medium text-primary mb-1">Green Certification Rate</p>
                        <p className="text-3xl font-black text-slate-800">38%</p>
                        <p className="text-xs text-muted-foreground mt-1">Suppliers meeting ISO-14001</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <Card className="lg:col-span-2 border shadow-sm">
                    <CardHeader className="pb-4 border-b">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Factory className="h-5 w-5 text-slate-600" /> Supply Chain ESG Roster
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>Supplier</TableHead>
                                <TableHead>Survey Status</TableHead>
                                <TableHead className="text-center">ESG Score</TableHead>
                                <TableHead className="text-right">Reported Footprint</TableHead>
                                <TableHead className="text-right">Last Updated</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {surveys.map(s => (
                                <TableRow key={s.id} className="hover:bg-muted/30">
                                    <TableCell>
                                        <p className="font-bold text-slate-800">{s.supplierName}</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-2.5 w-2.5" />{s.location} • {s.category}</p>
                                    </TableCell>
                                    <TableCell>{getStatusUI(s.status)}</TableCell>
                                    <TableCell className="text-center font-black">
                                        <span className={getScoreColor(s.score)}>{s.score || '--'}</span>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {s.emissionsMt ? (
                                            <span>{(s.emissionsMt).toLocaleString()} <span className="text-xs text-muted-foreground">MT</span></span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">Awaiting Data</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                        {s.lastUpdated}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="border shadow-sm border-blue-200">
                        <CardHeader className="bg-blue-50/50 pb-4 border-b">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" /> Scope 3 Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-semibold text-slate-700">1. Transportation / Logistics</span>
                                    <span className="font-bold text-slate-900">420k MT</span>
                                </div>
                                <Progress value={45} className="h-2" indicatorClassName="bg-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-semibold text-slate-700">2. Purchased Goods (Mfg)</span>
                                    <span className="font-bold text-slate-900">295k MT</span>
                                </div>
                                <Progress value={35} className="h-2" indicatorClassName="bg-slate-500" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-semibold text-slate-700">3. Employee Commute</span>
                                    <span className="font-bold text-slate-900">85k MT</span>
                                </div>
                                <Progress value={12} className="h-2" indicatorClassName="bg-slate-400" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-semibold text-slate-700">4. Business Travel</span>
                                    <span className="font-bold text-slate-900">45k MT</span>
                                </div>
                                <Progress value={8} className="h-2" indicatorClassName="bg-slate-300" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm bg-emerald-50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-900">
                                <TrendingDown className="h-4 w-4 text-emerald-600" /> Reduction Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <p className="text-xs text-emerald-800 leading-relaxed mb-4">
                                Shifting <b>20%</b> of the "Hardware Mfg" spend from Shenzhen Electronics (Pending/Unverified) to EcoPak Solutions (Score: 95) could reduce your estimated Scope 3 emissions by <b>~45,000 MT CO₂e</b> annually.
                            </p>
                            <Button variant="outline" className="w-full bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100">Simulate Scenario</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
