import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { AlertTriangle, Clock, CalendarCheck, FileEdit, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function TimeCardAudit() {
    const tenantId = "default-tenant";
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: audits, isLoading } = useQuery<any>({
        queryKey: ["wfm-timecard-audit", tenantId],
        queryFn: async () => {
            return [
                { id: "AUD-001", employeeName: "Emily Chen", exceptionType: "Unscheduled OT", date: "2026-03-05", originalHrs: 8, overrideHrs: 10, reason: "Coverage for sick call", status: "PENDING" },
                { id: "AUD-002", employeeName: "John Smith", exceptionType: "Missed Punch", date: "2026-03-06", originalHrs: 0, overrideHrs: 8, reason: "Forgot badge", status: "PENDING" },
                { id: "AUD-003", employeeName: "Jane Doe", exceptionType: "Late In", date: "2026-03-07", originalHrs: 8.5, overrideHrs: 8, reason: "Traffic accident", status: "REVIEWED" }
            ];
        }
    });

    const approveMut = useMutation({
        mutationFn: async (id: string) => {
            await new Promise(r => setTimeout(r, 600));
            return { success: true };
        },
        onSuccess: () => {
            toast({ title: "Audit Approved", description: "Exception has been cleared." });
            // queryClient.invalidateQueries(...)
        }
    });

    return (
        <StandardPage title="Time Card Audit">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Review manual punches, overrides, and schedule exceptions before period close.</p>
                <Button variant="outline" className="gap-2"><CalendarCheck className="h-4 w-4" /> Close Period</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Exceptions</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">Require manager review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Auto-Adjusted</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">14</div>
                        <p className="text-xs text-muted-foreground">Rounding rules applied</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Manual Overrides</CardTitle>
                        <FileEdit className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">Timesheets edited post-punch</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Exception Log</CardTitle>
                    <CardDescription>Detailed list of anomalies across your team&apos;s active timesheets.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Audit ID</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Exception Type</TableHead>
                                <TableHead>Orig → New</TableHead>
                                <TableHead>Justification</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={8}><TableSkeleton rows={3} /></TableCell></TableRow>
                            ) : audits?.map((audit: any) => (
                                <TableRow key={audit.id}>
                                    <TableCell className="text-xs text-muted-foreground font-mono">{audit.id}</TableCell>
                                    <TableCell className="font-medium">{audit.employeeName}</TableCell>
                                    <TableCell>{format(new Date(audit.date), "MMM d")}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={audit.exceptionType === 'Missed Punch' ? 'border-red-200 text-red-700 bg-red-50' : 'border-amber-200 text-amber-700 bg-amber-50'}>
                                            {audit.exceptionType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 items-center text-sm">
                                            <span className="line-through text-muted-foreground">{audit.originalHrs}h</span>
                                            <span className="font-bold">{audit.overrideHrs}h</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{audit.reason}</TableCell>
                                    <TableCell>
                                        <Badge variant={audit.status === 'PENDING' ? 'secondary' : 'default'}>{audit.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {audit.status === 'PENDING' ? (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() => approveMut.mutate(audit.id)}
                                                disabled={approveMut.isPending}
                                            >
                                                <CheckCircle2 className="h-4 w-4" /> Approve
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Cleared</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {audits?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Timesheets are fully compliant. No exceptions found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
