
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, UploadCloud } from "lucide-react";

// MOCK USER
const MOCK_TENANT_ID = "test-tenant-wfm-001";
const MOCK_ADMIN_ID = "admin-user-001";

export default function PayrollTransfer() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPeriod, setSelectedPeriod] = useState<string>("");

    // 1. Fetch Periods
    const { data: periods } = useQuery({
        queryKey: ["wfm-periods"],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/time-periods?tenantId=${MOCK_TENANT_ID}`);
            if (!res.ok) throw new Error("Failed to fetch periods");
            return res.json();
        }
    });

    // 2. Fetch Batches (History)
    const { data: batches, isLoading } = useQuery({
        queryKey: ["wfm-payroll-batches"],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/payroll/batches?tenantId=${MOCK_TENANT_ID}`);
            if (!res.ok) throw new Error("Failed to fetch batches");
            return res.json();
        }
    });

    // 3. Transfer Action
    const transferMutation = useMutation({
        mutationFn: async () => {
            if (!selectedPeriod) return;
            const res = await fetch("/api/wfm/payroll/transfer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId: MOCK_TENANT_ID,
                    periodId: selectedPeriod,
                    userId: MOCK_ADMIN_ID
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Transfer failed");
            if (data.message) {
                toast({ title: "Notice", description: data.message });
                return null; // No batch created
            }
            return data;
        },
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: ["wfm-payroll-batches"] });
                toast({ title: "Success", description: `Batch ${data.id} created successfully.` });
            }
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Wait", description: err.message });
        }
    });

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payroll Integration</h1>
                    <p className="text-muted-foreground">Transfer approved time data to Payroll.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Run Integration</CardTitle>
                        <CardDescription>Select a period to process.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Time Period</label>
                            <Select onValueChange={setSelectedPeriod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periods?.map((p: any) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name} ({format(parseISO(p.periodStart || p.startDate), "MMM d")} - {format(parseISO(p.periodEnd || p.endDate), "MMM d")})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => transferMutation.mutate()}
                            disabled={!selectedPeriod || transferMutation.isPending}
                        >
                            <UploadCloud className="mr-2 h-4 w-4" />
                            {transferMutation.isPending ? "Processing..." : "Transfer to Payroll"}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Integration History</CardTitle>
                        <CardDescription>Recent transfer batches and status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Run Date</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Records</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">Loading...</TableCell>
                                    </TableRow>
                                ) : batches?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No integrations run yet.</TableCell>
                                    </TableRow>
                                ) : (
                                    batches?.map((batch: any) => (
                                        <TableRow key={batch.batch.id}>
                                            <TableCell className="font-medium">
                                                {format(parseISO(batch.batch.runDate), "PPP p")}
                                            </TableCell>
                                            <TableCell>{batch.period.name}</TableCell>
                                            <TableCell>{batch.batch.totalRecords}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    {batch.batch.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
