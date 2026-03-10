import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileSignature, CheckCircle2, AlertTriangle, FileText, Send, Clock, PlayCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlanAgreement {
    id: string;
    rep: string;
    title: string;
    status: "Signed" | "Pending" | "Disputed" | "Draft";
    sentDate: string;
    docId: string;
}

export default function PlanAgreementSignOffs() {

    const agreements: PlanAgreement[] = [
        { id: "PA-2026-101", rep: "Sarah Jenkins", title: "Enterprise AE Plan FY26", status: "Signed", sentDate: "Jan 02, 2026", docId: "DOC-9941" },
        { id: "PA-2026-102", rep: "Michael Ross", title: "Mid-Market AE Plan FY26", status: "Signed", sentDate: "Jan 03, 2026", docId: "DOC-9942" },
        { id: "PA-2026-103", rep: "Emily Chen", title: "SDR Accelerator Plan H1", status: "Pending", sentDate: "Jan 15, 2026", docId: "DOC-9955" },
        { id: "PA-2026-104", rep: "David Kim", title: "Strategic Accounts Plan FY26", status: "Disputed", sentDate: "Jan 05, 2026", docId: "DOC-9949" },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Signed": return <Badge className="bg-emerald-100 text-emerald-800 border-none"><CheckCircle2 className="h-3 w-3 mr-1" /> Executed</Badge>;
            case "Pending": return <Badge className="bg-amber-100 text-amber-800 border-none"><Clock className="h-3 w-3 mr-1" /> Awaiting Sig</Badge>;
            case "Disputed": return <Badge className="bg-red-100 text-red-800 border-none"><AlertTriangle className="h-3 w-3 mr-1" /> Under Review</Badge>;
            default: return <Badge variant="outline">Draft</Badge>;
        }
    };

    return (
        <StandardPage
            title="Compensation Plan Agreements"
            description="Distribute, track, and capture e-signatures for representative commission plans (EPM / SPM integration)."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Compensation", href: "/crm/compensation" },
                { label: "Agreements" }
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Distributed</p>
                        <p className="text-3xl font-black text-slate-800">142</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-emerald-800 mb-1">Fully Executed</p>
                        <p className="text-3xl font-black text-emerald-600">128</p>
                        <Progress value={(128 / 142) * 100} className="h-1.5 mt-2 bg-emerald-100" indicatorClassName="bg-emerald-500" />
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-amber-800 mb-1">Awaiting Signatures</p>
                        <p className="text-3xl font-black text-amber-600">13</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500 shadow-sm bg-red-50/50">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-red-800 mb-1">Active Disputes</p>
                        <p className="text-3xl font-black text-red-600">1</p>
                        <p className="text-[10px] text-red-700 font-bold mt-1">Blocks payroll calculations</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* PDF Viewer Mockup */}
                <Card className="lg:col-span-2 border shadow-sm bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
                    <div className="absolute top-4 left-4 flex gap-2">
                        <Badge variant="secondary" className="bg-white"><FileText className="h-3 w-3 mr-1" /> PDF Wrapper Output</Badge>
                    </div>

                    {/* Simulated Document */}
                    <div className="w-[80%] max-w-[500px] h-[400px] bg-white shadow-xl flex flex-col text-sm border">
                        <div className="h-8 border-b bg-slate-100 flex items-center px-4">
                            <div className="flex gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                                <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400"></div>
                            </div>
                        </div>
                        <ScrollArea className="flex-1 p-8 text-slate-700">
                            <h1 className="text-center font-bold text-xl mb-6 font-serif">NEXUSAI COMPENSATION AGREEMENT FY2026</h1>
                            <p className="mb-4">This document outlines the Sales Incentive Plan for <b>Emily Chen</b> (SDR Accelerator Plan H1).</p>
                            <h2 className="font-bold underline mt-6 mb-2">1. Base Target Matrix</h2>
                            <p className="text-xs text-slate-600 leading-relaxed text-justify mb-4">
                                Representative shall receive variable compensation based on Quota Attainment. The primary metric is Qualified Meetings Set (QMS).
                                The base payout per QMS is $150.00.
                            </p>
                            <h2 className="font-bold underline mt-6 mb-2">2. Accelerators</h2>
                            <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                                <li>Tier 1 (100-120% Quota): 1.5x Multiplier</li>
                                <li>Tier 2 (121%+ Quota): 2.0x Multiplier</li>
                            </ul>

                            <div className="mt-12 pt-6 border-t border-dashed">
                                <p className="text-xs mb-8">By signing below, you agree to the terms outlined within this Incentive Compensation Plan.</p>

                                <div className="p-4 bg-amber-50 border border-amber-200 rounded text-center cursor-pointer hover:bg-amber-100 transition-colors">
                                    <FileSignature className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                                    <p className="font-bold text-amber-800">CLICK TO E-SIGN</p>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </Card>

                {/* Management Column */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border shadow-sm border-blue-200">
                        <CardHeader className="bg-blue-50/50 pb-4 border-b">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Send className="h-5 w-5 text-primary" /> Routing Operations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <p className="text-sm text-slate-600">Select an approved plan template below to dynamically generate a PDF for a representative.</p>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start text-left"><FileText className="h-4 w-4 mr-2" /> AE Enterprise FY26</Button>
                                <Button variant="outline" className="w-full justify-start text-left"><FileText className="h-4 w-4 mr-2" /> SDR Accelerator H1</Button>
                                <Button variant="outline" className="w-full justify-start text-left"><FileText className="h-4 w-4 mr-2" /> VP Overlay Spiff</Button>
                            </div>
                            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                                Generate & Send via Docusign <PlayCircle className="h-4 w-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2 border-b">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                Track Ledger
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y max-h-[300px] overflow-auto">
                                {agreements.map(agr => (
                                    <div key={agr.id} className="p-3 hover:bg-slate-50 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{agr.rep}</p>
                                            <p className="text-[10px] text-muted-foreground truncate w-[120px]">{agr.title}</p>
                                        </div>
                                        {getStatusBadge(agr.status)}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
