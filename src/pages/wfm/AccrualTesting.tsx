
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";


const MOCK_TENANT_ID = "test-tenant-wfm-001";
const MOCK_PERSON_ID = "3ebd9ddb-1566-418d-a0d6-9c773861acc4"; // Same as MyTime mock

export default function AccrualTesting() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [accrualForm, setAccrualForm] = useState({
        leaveType: "VACATION",
        hours: "8"
    });

    // 1. Fetch Balances
    const { data: balances, isLoading } = useQuery<any>({
        queryKey: ["leave-balances", MOCK_PERSON_ID],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/balances/${MOCK_PERSON_ID}?tenantId=${MOCK_TENANT_ID}`);
            if (!res.ok) throw new Error("Failed to fetch balances");
            return res.json();
        }
    });

    // 2. Add Accrual Mutation
    const accrualMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/wfm/accruals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId: MOCK_TENANT_ID,
                    personId: MOCK_PERSON_ID,
                    leaveType: accrualForm.leaveType,
                    hours: parseFloat(accrualForm.hours)
                })
            });
            if (!res.ok) throw new Error("Failed to add accrual");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
            toast({ title: "Success", description: "Accrual processed." });
        }
    });

    const cycleMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/wfm/accruals/cycle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tenantId: MOCK_TENANT_ID })
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
            toast({ title: "Cycle Complete", description: data.message });
        }
    });

    return (
        <StandardPage title="Accrual Engine Testing">
            
            <p className="text-muted-foreground">Manually adjust leave balances for verification.</p>

            <div className="grid gap-6 md:grid-cols-2">
                {/* CURRENT BALANCES */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Balances</CardTitle>
                        <CardDescription>Person ID: ...{MOCK_PERSON_ID.slice(-6)}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? <p>Loading...</p> :
                            balances?.length > 0 ? (
                                balances.map((b: any) => (
                                    <div key={b.id} className="flex justify-between items-center border p-3 rounded">
                                        <span className="font-medium">{b.leaveType}</span>
                                        <span className={`text-lg font-bold ${Number(b.balanceHours) < 0 ? "text-red-500" : "text-green-600"}`}>
                                            {b.balanceHours} hrs
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">No balances found.</p>
                            )
                        }
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Batch Processing</CardTitle>
                        <CardDescription>Run Monthly Accrual Cycle for ALL employees.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => cycleMutation.mutate()}
                            disabled={cycleMutation.isPending}
                        >
                            {cycleMutation.isPending ? "Running Batch..." : "Run Global Accrual Cycle"}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Manual Adjustment</CardTitle>
                        <CardDescription>Add/Deduct balance for specific person.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Leave Type</label>
                            <Select value={accrualForm.leaveType} onValueChange={v => setAccrualForm({ ...accrualForm, leaveType: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VACATION">Vacation</SelectItem>
                                    <SelectItem value="SICK">Sick</SelectItem>
                                    <SelectItem value="PERSONAL">Personal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Hours to Add</label>
                            <Input
                                type="number"
                                value={accrualForm.hours}
                                onChange={e => setAccrualForm({ ...accrualForm, hours: e.target.value })}
                            />
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => accrualMutation.mutate()}
                            disabled={accrualMutation.isPending}
                        >
                            {accrualMutation.isPending ? "Processing..." : "Process Accrual"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
