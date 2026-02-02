
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AlertCircle, Clock } from "lucide-react";

const MOCK_TENANT_ID = "test-tenant-wfm-001";

export default function ViolationsDashboard() {
    // Fetch Violations
    const { data: violations, isLoading } = useQuery({
        queryKey: ["wfm-violations"],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/violations?tenantId=${MOCK_TENANT_ID}`);
            if (!res.ok) throw new Error("Failed to fetch violations");
            return res.json();
        }
    });

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Time Anomalies</h1>
                    <p className="text-muted-foreground">Monitor late-ins, early-outs, and policy violations.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{violations?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Violations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">Loading Violations...</TableCell>
                                </TableRow>
                            ) : (
                                violations?.map((v: any) => (
                                    <TableRow key={v.violation.id}>
                                        <TableCell>{format(new Date(v.violation.createdAt), "MMM d, yyyy")}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{v.person.firstName} {v.person.lastName}</div>
                                            <div className="text-xs text-muted-foreground">{v.person.personNumber}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={v.violation.type === "LATE_IN" ? "destructive" : "secondary"}>
                                                {v.violation.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={v.violation.severity === "HIGH" ? "text-red-500 font-bold" : ""}>
                                                {v.violation.severity}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-md truncate" title={v.violation.message}>
                                            {v.violation.message}
                                        </TableCell>
                                        <TableCell>
                                            {/* Future: Acknowledge / Waive */}
                                            <Button variant="outline" size="sm" disabled>Review</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {violations?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No active violations found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// Helper to keep concise
import { Button } from "@/components/ui/button";
