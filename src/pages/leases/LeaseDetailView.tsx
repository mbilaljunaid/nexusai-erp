import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LeaseModificationDialog } from "@/components/lease/LeaseModificationDialog";
import { ApprovalTimeline } from "@/components/workflow/ApprovalTimeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface LeaseDetailProps {
    leaseId: string;
}

export function LeaseDetailView({ leaseId }: LeaseDetailProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isModDialogOpen, setIsModDialogOpen] = useState(false);

    const { data: lease, isLoading } = useQuery({
        queryKey: ["lease", leaseId],
        queryFn: async () => {
            const res = await fetch(`/api/lease/leases/${leaseId}`);
            if (!res.ok) throw new Error("Failed to fetch lease details");
            return res.json();
        }
    });

    const generateScheduleMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/lease/leases/${leaseId}/generate-schedule`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to generate schedule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lease", leaseId] });
            toast({ title: "Calculations Complete", description: "Amortization schedule regenerated." });
        }
    });

    // Mock Payment Creation
    const addPaymentMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/lease/leases/${leaseId}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: 5000,
                    startDate: lease.commencementDate,
                    endDate: lease.expirationDate,
                    frequency: "MONTHLY"
                })
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lease", leaseId] });
            toast({ title: "Payment Added", description: "Fixed payment stream added." });
        }
    });

    const postGlMutation = useMutation({
        mutationFn: async (period: number) => {
            const res = await fetch(`/api/lease/leases/${leaseId}/post-gl`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ period })
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["lease", leaseId] });
            toast({ title: "GL Posted", description: `Journal ${data.journalNumber} created successfully.` });
        },
        onError: (err) => {
            toast({ variant: "destructive", title: "Posting Failed", description: err.message });
        }
    });

    const createAssetMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/lease/leases/${leaseId}/create-asset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: (data) => {
            toast({ title: "Asset Capitalized", description: `Asset ${data.assetNumber} created in Fixed Assets.` });
        },
        onError: (err) => {
            toast({ variant: "destructive", title: "Capitalization Failed", description: err.message });
        }
    });

    if (isLoading) return <Skeleton className="h-[400px] w-full" />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">{lease.leaseNumber}</h2>
                    <p className="text-gray-500">{lease.description}</p>
                    {lease.isModified && <Badge variant="secondary" className="mt-1">Modified: {new Date(lease.modificationDate).toLocaleDateString()}</Badge>}
                </div>
                <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => addPaymentMutation.mutate()}>
                        Add Payment Term
                    </Button>
                    <Button size="sm" onClick={() => generateScheduleMutation.mutate()}>
                        Run Calculations
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setIsModDialogOpen(true)}>
                        Modify Terms
                    </Button>
                    <Button variant="default" className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => {
                        if (window.confirm("Create Fixed Asset from this ROU Liability?")) {
                            createAssetMutation.mutate();
                        }
                    }}>
                        Capitalize ROU
                    </Button>
                </div>
            </div>

            <ApprovalTimeline leaseId={leaseId} status={lease.status || "DRAFT"} />

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="schedule">Amortization Schedule</TabsTrigger>
                    <TabsTrigger value="accounting">Accounting Lines</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardHeader><CardTitle>Lease Terms</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between"><span>Start Date:</span> <span>{new Date(lease.commencementDate).toLocaleDateString()}</span></div>
                                <div className="flex justify-between"><span>End Date:</span> <span>{new Date(lease.expirationDate).toLocaleDateString()}</span></div>
                                <div className="flex justify-between"><span>Discount Rate:</span> <span>{(Number(lease.discountRate) * 100).toFixed(2)}%</span></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Financials (NPV)</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between font-bold"><span>Total Liability:</span> <span>${Number(lease.initialDirectCosts || 0).toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>Active Payments:</span> <span>{lease.payments?.length || 0}</span></div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="schedule">
                    <Card>
                        <CardHeader><CardTitle>Liability & ROU Amortization</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lease.schedules}>
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="closingLiability" stroke="#8884d8" name="Liability" />
                                        <Line type="monotone" dataKey="rouClosingBalance" stroke="#82ca9d" name="ROU Asset" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Interest</TableHead>
                                        <TableHead>Liability</TableHead>
                                        <TableHead>ROU Balance</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lease.schedules?.map((row: any) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.period}</TableCell>
                                            <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                                            <TableCell>${Number(row.paymentAmount).toFixed(2)}</TableCell>
                                            <TableCell className="text-red-500">${Number(row.interestExpense).toFixed(2)}</TableCell>
                                            <TableCell className="font-bold">${Number(row.closingLiability).toFixed(2)}</TableCell>
                                            <TableCell>${Number(row.rouClosingBalance).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant={row.isPosted ? "ghost" : "default"}
                                                    size="sm"
                                                    disabled={row.isPosted}
                                                    onClick={() => postGlMutation.mutate(row.period)}
                                                >
                                                    {row.isPosted ? "Posted" : "Post to GL"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {lease && (
                <LeaseModificationDialog
                    isOpen={isModDialogOpen}
                    onClose={() => setIsModDialogOpen(false)}
                    leaseId={leaseId}
                    currentTerms={{
                        discountRate: lease.discountRate || "0",
                        termMonths: lease.termMonths || 0,
                        paymentAmount: lease.payments?.[0]?.amount || 0
                    }}
                />
            )}
        </div>
    );
}
