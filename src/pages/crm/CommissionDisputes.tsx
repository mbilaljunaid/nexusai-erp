import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, FileText, Filter, MessageSquare, Scale, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";

interface CommissionDispute {
    id: string;
    repName: string;
    opportunityName: string;
    period: string;
    disputedAmount: number;
    reason: string;
    status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
    dateSubmitted: string;
}

export default function CommissionDisputes() {

    const disputes: CommissionDispute[] = [
        { id: "DISP-101", repName: "Sarah Jenkins", opportunityName: "Acme Corp Q3 Expansion", period: "Aug 2026", disputedAmount: 12500, reason: "Split credit not applied correctly for John Doe.", status: "UNDER_REVIEW", dateSubmitted: "2026-09-02" },
        { id: "DISP-102", repName: "Michael Ross", opportunityName: "Stark Industries Upgrade", period: "Aug 2026", disputedAmount: 4200, reason: "Accelerator tier 2 should have been triggered.", status: "PENDING", dateSubmitted: "2026-09-04" },
        { id: "DISP-103", repName: "David Kim", opportunityName: "Globex 500 Seats", period: "Jul 2026", disputedAmount: 850, reason: "Missing margin kicker.", status: "APPROVED", dateSubmitted: "2026-08-15" },
        { id: "DISP-104", repName: "Emily Chen", opportunityName: "Initech Initial Order", period: "Jul 2026", disputedAmount: 3100, reason: "Clawback applied in error (customer paid late, did not cancel).", status: "REJECTED", dateSubmitted: "2026-08-10" },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING": return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
            case "UNDER_REVIEW": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Search className="h-3 w-3 mr-1" /> Under Review</Badge>;
            case "APPROVED": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
            case "REJECTED": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <StandardPage
            title="Commission Disputes"
            description="Manage and resolve exception requests from sales representatives regarding compensation calculations."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Incentives", href: "/crm/incentives" },
                { label: "Disputes" }
            ]}
            actions={
                <Button>
                    <FileText className="h-4 w-4 mr-2" /> File New Dispute
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Pending Review</p>
                        <p className="text-3xl font-black text-amber-600">3</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Disputed Value</p>
                        <p className="text-3xl font-black text-blue-600">{formatCurrency(16700)}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Resolved this Period</p>
                        <p className="text-3xl font-black text-green-600">14</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-slate-400">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Resolution Time</p>
                        <p className="text-3xl font-black text-slate-700">4.2 Days</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Scale className="h-5 w-5 text-primary" /> Active Disputes Log
                            </CardTitle>
                            <CardDescription>Track claims against the automated commission engine.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search reps or deals..." className="pl-9 h-9" />
                            </div>
                            <Select defaultValue="ALL">
                                <SelectTrigger className="w-[140px] h-9">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[100px]">Claim ID</TableHead>
                            <TableHead>Sales Rep</TableHead>
                            <TableHead>Opportunity / Deal</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead className="text-right">Disputed Amt</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {disputes.map(dispute => (
                            <TableRow key={dispute.id} className="hover:bg-muted/30 group">
                                <TableCell className="font-mono text-xs text-muted-foreground">{dispute.id}</TableCell>
                                <TableCell className="font-semibold text-primary">{dispute.repName}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{dispute.opportunityName}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-1 truncate max-w-[250px]" title={dispute.reason}>
                                        {dispute.reason}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{dispute.period}</TableCell>
                                <TableCell className="text-right font-bold text-amber-700">{formatCurrency(dispute.disputedAmount)}</TableCell>
                                <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">{dispute.dateSubmitted}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8">
                                        <Scale className="h-4 w-4 mr-2 opacity-50" /> Review
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </StandardPage>
    );
}
