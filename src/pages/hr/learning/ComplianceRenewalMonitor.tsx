import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { AlertCircle, ShieldAlert, Send, FileCheck } from "lucide-react";
import { format, addDays, isPast } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function ComplianceRenewalMonitor() {
    const tenantId = "default-tenant";
    const { toast } = useToast();

    const { data: certifications, isLoading } = useQuery<any>({
        queryKey: ["hr-compliance-renewals", tenantId],
        queryFn: async () => {
            return [
                { id: "CERT-901", employeeName: "John Smith", certName: "OSHA 30-Hour", expiresAt: "2026-03-01", status: "EXPIRED", department: "Manufacturing" },
                { id: "CERT-902", employeeName: "Emily Chen", certName: "CPR / First Aid", expiresAt: "2026-03-20", status: "CRITICAL", department: "Patient Care" },
                { id: "CERT-903", employeeName: "Michael Doe", certName: "Data Privacy & Sec", expiresAt: "2026-04-15", status: "WARNING", department: "IT" },
                { id: "CERT-904", employeeName: "Sarah Connor", certName: "Forklift Operation", expiresAt: "2026-12-01", status: "VALID", department: "Logistics" }
            ];
        }
    });

    const nudgeMut = useMutation({
        mutationFn: async (id: string) => {
            await new Promise(r => setTimeout(r, 600));
            return { success: true };
        },
        onSuccess: () => {
            toast({ title: "Reminder Sent", description: "Automated email & system notification sent to employee." });
        }
    });

    return (
        <StandardPage title="Compliance & Renewal Monitor">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Track expiring mandatory certifications and enforce compliance across the organization.</p>
                <Button className="gap-2" variant="outline"><FileCheck className="h-4 w-4" /> Generate Compliance Report</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card className="border-red-200 bg-red-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">Lapsed Certifications</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">1</div>
                        <p className="text-xs text-red-600/80">Employees banned from restricted duties</p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 bg-amber-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800">Expiring Next 30 Days</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700">1</div>
                        <p className="text-xs text-amber-600/80">Require immediate renewal</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Certification Roster</CardTitle>
                    <CardDescription>Monitor expiration timelines for mandatory training and external licenses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Certification Name</TableHead>
                                <TableHead>Expiration Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6}><TableSkeleton rows={4} /></TableCell></TableRow>
                            ) : certifications?.map((cert: any) => (
                                <TableRow key={cert.id}>
                                    <TableCell className="font-medium">{cert.employeeName}</TableCell>
                                    <TableCell>{cert.department}</TableCell>
                                    <TableCell>{cert.certName}</TableCell>
                                    <TableCell className={isPast(new Date(cert.expiresAt)) ? 'text-red-500 font-bold' : ''}>
                                        {format(new Date(cert.expiresAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            cert.status === 'EXPIRED' ? 'border-red-500 text-red-700 bg-red-100' :
                                                cert.status === 'CRITICAL' ? 'border-amber-500 text-amber-700 bg-amber-100' :
                                                    cert.status === 'WARNING' ? 'border-yellow-500 text-yellow-700 bg-yellow-100' :
                                                        'border-emerald-500 text-emerald-700 bg-emerald-100'
                                        }>
                                            {cert.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2"
                                            disabled={cert.status === 'VALID' || nudgeMut.isPending}
                                            onClick={() => nudgeMut.mutate(cert.id)}
                                        >
                                            <Send className="h-3 w-3" /> Send Nudge
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </StandardPage>
    );
}
