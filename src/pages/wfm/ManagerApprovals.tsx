
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TimesheetGrid } from "@/components/wfm/TimesheetGrid";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";


// MOCK MANAGER
const MOCK_TENANT_ID = "test-tenant-wfm-001";
const MOCK_MANAGER_ID = "manager-user-001";

export default function ManagerApprovals() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);

    // Fetch Pending Approvals
    const { data: pendingSheets, isLoading } = useQuery<any>({
        queryKey: ["approvals-pending"],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/approvals/pending?tenantId=${MOCK_TENANT_ID}`);
            if (!res.ok) throw new Error("Failed to fetch pending approvals");
            return res.json();
        }
    });

    // Fetch Details for Selected Sheet
    const { data: selectedSheetDetails } = useQuery<any>({
        queryKey: ["timesheet", selectedSheetId],
        enabled: !!selectedSheetId,
        queryFn: async () => {
            const res = await fetch(`/api/wfm/timesheets/${selectedSheetId}`);
            if (!res.ok) throw new Error("Failed to fetch details");
            return res.json();
        }
    });

    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/wfm/timesheets/${id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ approverId: MOCK_MANAGER_ID })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["approvals-pending"] });
            setSelectedSheetId(null);
            toast({ title: "Approved", description: "Timesheet approved successfully." });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/wfm/timesheets/${id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "Manager Rejection" })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["approvals-pending"] });
            setSelectedSheetId(null);
            toast({ title: "Rejected", description: "Timesheet returned to employee." });
        }
    });

    return (
        <StandardPage title="Approvals">
            <div className="flex justify-between items-center">
                <div>

                    <p className="text-muted-foreground">Review and approve team timesheets.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Timesheets</CardTitle>
                    <CardDescription>{pendingSheets?.length || 0} items requiring attention.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Total Hours</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5}><TableSkeleton rows={4} /></TableCell></TableRow>
                            ) : pendingSheets?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No pending approvals.</TableCell>
                                </TableRow>
                            ) : (
                                pendingSheets?.map((item: any) => (
                                    <TableRow key={item.timesheet.id}>
                                        <TableCell className="font-medium">
                                            {item.person.firstName} {item.person.lastName}
                                            <div className="text-xs text-muted-foreground">{item.person.personNumber}</div>
                                        </TableCell>
                                        <TableCell>{item.period.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={Number(item.timesheet.totalOvertime) > 0 ? "destructive" : "outline"}>
                                                {item.timesheet.totalHours} hrs
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{item.timesheet.submissionDate ? format(parseISO(item.timesheet.submissionDate), "PPP") : "-"}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedSheetId(item.timesheet.id)}>
                                                <Eye className="h-4 w-4 mr-2" /> Review
                                            </Button>
                                            <Button size="sm" onClick={() => approveMutation.mutate(item.timesheet.id)}>
                                                <Check className="h-4 w-4 mr-2" /> Approve
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* DETAIL MODAL */}
            <Dialog open={!!selectedSheetId} onOpenChange={() => setSelectedSheetId(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Timesheet Details</DialogTitle>
                    </DialogHeader>
                    {selectedSheetDetails && (
                        <div className="space-y-4">
                            <div className="flex gap-4 border p-4 rounded-md bg-muted/20">
                                <div>
                                    <div className="text-sm text-muted-foreground">Total Hours</div>
                                    <div className="text-2xl font-bold">{selectedSheetDetails.totalHours}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Overtime</div>
                                    <div className="text-2xl font-bold text-orange-600">{selectedSheetDetails.totalOvertime}</div>
                                </div>
                            </div>

                            {/* Assuming Period Start Date is available via join or we pass it.
                                Mocking for V1 modal based on 2026-01-01 for grid rendering 
                            */}
                            <TimesheetGrid
                                startDate="2026-01-01"
                                entries={selectedSheetDetails.entries}
                                onEntryChange={() => { }}
                                readOnly={true}
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => rejectMutation.mutate(selectedSheetId!)}>
                            <X className="h-4 w-4 mr-2" /> Reject
                        </Button>
                        <Button onClick={() => approveMutation.mutate(selectedSheetId!)}>
                            <Check className="h-4 w-4 mr-2" /> Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
