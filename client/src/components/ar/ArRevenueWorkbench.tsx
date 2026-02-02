import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArRevenueSchedule } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign, Calendar } from "lucide-react";

export function ArRevenueWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedIds, setSelectedIds] = useState<string[]>([]); // Note: schedule.id is string/varchar

    const { data: schedules, isLoading } = useQuery<ArRevenueSchedule[]>({
        queryKey: ["/api/ar/revenue/schedules"],
        queryFn: async () => {
            const res = await fetch("/api/ar/revenue/schedules");
            if (!res.ok) throw new Error("Failed to fetch schedules");
            return res.json();
        }
    });

    const recognizeMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const res = await fetch("/api/ar/revenue/recognize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scheduleIds: ids })
            });
            if (!res.ok) throw new Error("Failed to recognize revenue");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Revenue recognized successfully." });
            queryClient.invalidateQueries({ queryKey: ["/api/ar/revenue/schedules"] });
            setSelectedIds([]);
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to recognize revenue.", variant: "destructive" });
        }
    });

    const handleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleRecognize = () => {
        if (selectedIds.length === 0) return;
        recognizeMutation.mutate(selectedIds);
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>;

    const pendingSchedules = schedules?.filter(s => s.status === 'Pending') || [];
    const recognizedSchedules = schedules?.filter(s => s.status === 'Recognized') || [];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Recognition</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${pendingSchedules.reduce((acc, curr) => acc + Number(curr.amount), 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">{pendingSchedules.length} schedules pending</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recognized (Total)</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${recognizedSchedules.reduce((acc, curr) => acc + Number(curr.amount), 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">{recognizedSchedules.length} schedules completed</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Revenue Schedules</CardTitle>
                    <Button
                        onClick={handleRecognize}
                        disabled={selectedIds.length === 0 || recognizeMutation.isPending}
                    >
                        {recognizeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Recognize Selected ({selectedIds.length})
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Schedule Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Invoice ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules?.map((schedule) => (
                                <TableRow key={schedule.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(schedule.id)}
                                            onCheckedChange={(checked) => handleSelect(schedule.id, checked as boolean)}
                                            disabled={schedule.status === 'Recognized'}
                                        />
                                    </TableCell>
                                    <TableCell>{schedule.periodName}</TableCell>
                                    <TableCell>{new Date(schedule.scheduleDate).toLocaleDateString()}</TableCell>
                                    <TableCell>${Number(schedule.amount).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={schedule.status === 'Recognized' ? 'default' : 'secondary'}>
                                            {schedule.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{schedule.invoiceId}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
