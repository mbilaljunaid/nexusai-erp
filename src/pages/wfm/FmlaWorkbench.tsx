import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { HeartPulse, Plus, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format, addDays } from "date-fns";

export default function FmlaWorkbench() {
    const tenantId = "default-tenant";

    const { data: cases, isLoading } = useQuery<any>({
        queryKey: ["wfm-fmla-cases", tenantId],
        queryFn: async () => {
            // Mock FMLA cases
            return [
                { id: "CAS-9912", employeeName: "Jane Doe", type: "Maternity Leave", status: "APPROVED", startDate: "2026-05-01", remainingWeeks: 12, docsComplete: true },
                { id: "CAS-9915", employeeName: "John Smith", type: "FMLA - Medical", status: "PENDING_DOCS", startDate: "2026-03-20", remainingWeeks: 6, docsComplete: false },
                { id: "CAS-9918", employeeName: "Emily Chen", type: "Military Leave", status: "ACTIVE", startDate: "2025-11-01", remainingWeeks: 2, docsComplete: true }
            ];
        }
    });

    return (
        <StandardPage title="Leave of Absence & FMLA Workbench">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Manage complex continuous and intermittent leave cases.</p>
                <Button className="gap-2"><Plus className="h-4 w-4" /> New Leave Case</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                        <HeartPulse className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Employees currently on leave</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Docs</CardTitle>
                        <FileText className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Require medical certification</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approaching Return</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">Returning within 14 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Exhausted Warning</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">Exceeding protected entitlement</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Open Cases</CardTitle>
                    <CardDescription>Review and track the progress of ongoing leave of absence cases.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Case ID</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Leave Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Entitlement Remaining</TableHead>
                                <TableHead className="text-center">Docs</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={7}><TableSkeleton rows={3} /></TableCell></TableRow>
                            ) : cases?.map((c: any) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium text-xs text-primary">{c.id}</TableCell>
                                    <TableCell className="font-medium">{c.employeeName}</TableCell>
                                    <TableCell>{c.type}</TableCell>
                                    <TableCell>
                                        <Badge variant={c.status === 'ACTIVE' ? 'default' : c.status === 'PENDING_DOCS' ? 'secondary' : 'outline'}>
                                            {c.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(c.startDate), "MMM d, yyyy")}</TableCell>
                                    <TableCell>
                                        <span className={c.remainingWeeks <= 2 ? 'text-red-500 font-bold' : ''}>
                                            {c.remainingWeeks} Weeks
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {c.docsComplete ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-amber-500 mx-auto" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {cases?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No active cases found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
