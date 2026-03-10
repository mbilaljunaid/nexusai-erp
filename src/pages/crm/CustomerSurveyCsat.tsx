import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Smile, Meh, Frown, TrendingUp, TrendingDown, Send, MessageSquareHeart, Star } from "lucide-react";

export default function CustomerSurveyCsat() {

    const csatResponses = [
        { id: "RSP-992", caseNumber: "CS-88902", customer: "Globex", agent: "Sarah Jenkins", score: 5, comment: "Resolution was incredibly fast, thanks!", date: "2 hrs ago" },
        { id: "RSP-991", caseNumber: "CS-88901", customer: "Initech", agent: "Sarah Jenkins", score: 4, comment: "Good help, but had to wait on hold for a bit.", date: "4 hrs ago" },
        { id: "RSP-990", caseNumber: "CS-88845", customer: "Massive Dynamic", agent: "David Kim", score: 2, comment: "Agent didn't seem to understand the technical issue initially. Required escalation.", date: "1 day ago" },
        { id: "RSP-989", caseNumber: "CS-88812", customer: "Soylent Corp", agent: "Emily Chen", score: 5, comment: "", date: "2 days ago" },
    ];

    const getScoreIcon = (score: number) => {
        if (score >= 4) return <Smile className="h-5 w-5 text-emerald-500" />;
        if (score === 3) return <Meh className="h-5 w-5 text-amber-500" />;
        return <Frown className="h-5 w-5 text-red-500" />;
    };

    const getStars = (score: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`h-3 w-3 ${star <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                ))}
            </div>
        );
    };

    return (
        <StandardPage
            title="Customer Satisfaction (CSAT)"
            description="Measure case resolution quality through automated survey distribution and analysis."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Service Cloud", href: "/crm/cases" },
                { label: "CSAT Surveys" }
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-l-4 border-l-emerald-500">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Global CSAT (30d)</p>
                        <div className="flex items-baseline justify-between">
                            <p className="text-3xl font-black text-emerald-600">4.6<span className="text-lg text-emerald-600/60">/5</span></p>
                            <span className="flex items-center text-xs font-bold text-emerald-600"><TrendingUp className="h-3 w-3 mr-1" />+0.2</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Response Rate</p>
                        <div className="flex items-baseline justify-between">
                            <p className="text-3xl font-black text-blue-600">22.4%</p>
                            <span className="flex items-center text-xs font-bold text-red-500"><TrendingDown className="h-3 w-3 mr-1" />-1.1%</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">NPS Score Tracker</p>
                        <p className="text-3xl font-black text-purple-600">+64</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-orange-800 mb-1">Detractor Alerts</p>
                        <p className="text-3xl font-black text-orange-600">3</p>
                        <p className="text-xs text-orange-700/80 mt-1">Requires supervisor callback</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border shadow-sm">
                    <CardHeader className="pb-4 border-b">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquareHeart className="h-5 w-5 text-primary" /> Survey Responses Log
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="w-[80px]">Score</TableHead>
                                <TableHead>Case / Customer</TableHead>
                                <TableHead>Feedback Comment</TableHead>
                                <TableHead>Assigned Agent</TableHead>
                                <TableHead className="text-right">Received</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {csatResponses.map(res => (
                                <TableRow key={res.id} className={res.score <= 3 ? "bg-red-50/30" : ""}>
                                    <TableCell>
                                        <div className="flex flex-col items-center gap-1">
                                            {getScoreIcon(res.score)}
                                            {getStars(res.score)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-bold text-primary text-sm">{res.caseNumber}</p>
                                        <p className="text-xs font-medium text-slate-600">{res.customer}</p>
                                    </TableCell>
                                    <TableCell>
                                        {res.comment ? (
                                            <p className="text-sm italic text-slate-700">"{res.comment}"</p>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic border border-dashed px-2 py-0.5 rounded">No comment provided</span>
                                        )}
                                        {res.score <= 2 && (
                                            <Badge variant="outline" className="mt-2 bg-red-100 text-red-800 border-none text-[10px]">Supervisor Hold</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-50">{res.agent}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                        {res.date}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <Card className="border shadow-sm bg-slate-50/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" /> Survey Automation Engine
                        </CardTitle>
                        <CardDescription>Rules to send CSAT surveys automatically.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm space-y-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-emerald-500 w-1.5 h-full"></div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-sm">Post-Resolution Trigger</h3>
                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Active</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Send survey exactly <b>24 hours</b> after case Status changes to <b>Resolved</b> or <b>Closed</b>.</p>
                            <Button variant="outline" size="sm" className="w-full text-xs h-7">Edit Condition</Button>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm space-y-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-emerald-500 w-1.5 h-full"></div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-sm">Frequency Cap</h3>
                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Active</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Do not send more than <b>1</b> survey to the same contact per <b>14 days</b> to prevent fatigue.</p>
                            <Button variant="outline" size="sm" className="w-full text-xs h-7">Edit Limits</Button>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 space-y-3">
                            <h3 className="font-bold text-sm text-slate-500">Escalation Threshold</h3>
                            <p className="text-xs text-muted-foreground">Automatically create a follow-up Task for the Service Manager if CSAT score is ≤ 2.</p>
                            <Button variant="secondary" size="sm" className="w-full text-xs h-7">Enable Rule</Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
