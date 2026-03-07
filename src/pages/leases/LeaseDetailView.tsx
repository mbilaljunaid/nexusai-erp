import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LeaseModificationDialog } from "@/components/lease/LeaseModificationDialog";
import { LeaseAuditTrail } from "@/components/leases/LeaseAuditTrail";
import { LeaseGLPostingModal } from "@/components/leases/LeaseGLPostingModal";
import { ROUAssetCreatorModal } from "@/components/leases/ROUAssetCreatorModal";
import { ApprovalTimeline } from "@/components/workflow/ApprovalTimeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';

interface LeaseDetailProps {
    leaseId: string;
}

export function LeaseDetailView({ leaseId }: LeaseDetailProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isModDialogOpen, setIsModDialogOpen] = useState(false);
    const [glPostingState, setGlPostingState] = useState<{ isOpen: boolean; period: number | null }>({
        isOpen: false,
        period: null
    });
    const [showRouAssetModal, setShowRouAssetModal] = useState(false);

    const { data: lease, isLoading } = useQuery<any>({
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

    if (isLoading) return <Skeleton className="h-[400px] w-full" />;

    return (
        <StandardPage
            title={lease.leaseNumber || "Lease Details"}
            description={lease.description}
            breadcrumbs={[
                { label: "Leases", href: "/finance/leases" },
                { label: lease.leaseNumber }
            ]}
            actions={
                <div className="flex items-center gap-2">
                    {lease.isModified && <Badge variant="secondary">Modified: {format(new Date(lease.modificationDate), "MMM d, yyyy")}</Badge>}
                    <Button variant="outline" size="sm" onClick={() => addPaymentMutation.mutate()}>
                        Add Payment Term
                    </Button>
                    <Button size="sm" onClick={() => generateScheduleMutation.mutate()}>
                        Run Calculations
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setIsModDialogOpen(true)}>
                        Modify Terms
                    </Button>
                    <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                        onClick={() => setShowRouAssetModal(true)}
                    >
                        Capitalize ROU
                    </Button>
                </div>
            }
            className="space-y-6"
        >
            <ApprovalTimeline leaseId={leaseId} status={lease.status || "DRAFT"} />

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="schedule">Amortization Schedule</TabsTrigger>
                    <TabsTrigger value="accounting">Accounting Lines</TabsTrigger>
                    <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardHeader><CardTitle>Lease Terms</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between"><span>Start Date:</span> <span>{format(new Date(lease.commencementDate), "MMM d, yyyy")}</span></div>
                                <div className="flex justify-between"><span>End Date:</span> <span>{format(new Date(lease.expirationDate), "MMM d, yyyy")}</span></div>
                                <div className="flex justify-between"><span>Discount Rate:</span> <span>{(Number(lease.discountRate) * 100).toFixed(2)}%</span></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Financials (NPV)</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between font-bold"><span>Total Liability:</span> <span>${formatNumber(Number(lease.initialDirectCosts || 0))}</span></div>
                                <div className="flex justify-between"><span>Active Payments:</span> <span>{lease.payments?.length || 0}</span></div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Approval Workflow Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Approval Workflow</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={lease.status === 'Approved' ? 'default' : lease.status === 'Draft' ? 'secondary' : 'outline'} className="mt-1">
                                        {lease.status || 'Draft'}
                                    </Badge>
                                </div>
                                <div className="flex gap-2">
                                    {lease.status === 'Draft' && (
                                        <Button size="sm" variant="default">Submit for Approval</Button>
                                    )}
                                    {lease.status === 'Pending Approval' && (
                                        <>
                                            <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-500/10">
                                                Reject
                                            </Button>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                Approve
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule">
                    <Card>
                        <CardHeader><CardTitle>Liability & ROU Amortization</CardTitle></CardHeader>
                        <CardContent>
                            <div className="h-48 w-full mb-6">
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
                                            <TableCell>{format(new Date(row.date), "MMM d, yyyy")}</TableCell>
                                            <TableCell>${Number(row.paymentAmount).toFixed(2)}</TableCell>
                                            <TableCell className="text-red-500">${Number(row.interestExpense).toFixed(2)}</TableCell>
                                            <TableCell className="font-bold">${Number(row.closingLiability).toFixed(2)}</TableCell>
                                            <TableCell>${Number(row.rouClosingBalance).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant={row.isPosted ? "ghost" : "default"}
                                                    size="sm"
                                                    disabled={row.isPosted}
                                                    onClick={() => setGlPostingState({ isOpen: true, period: row.period })}
                                                >
                                                    {row.isPosted ? "✓ Posted" : "Post to GL"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audit">
                    <LeaseAuditTrail leaseId={leaseId} />
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

            {glPostingState.period !== null && (
                <LeaseGLPostingModal
                    leaseId={leaseId}
                    period={glPostingState.period}
                    isOpen={glPostingState.isOpen}
                    onClose={() => setGlPostingState({ isOpen: false, period: null })}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ["lease", leaseId] })}
                />
            )}

            {lease && (
                <ROUAssetCreatorModal
                    leaseId={leaseId}
                    leaseName={lease.leaseNumber || "Unknown Lease"}
                    rouValue={Number(lease.initialDirectCosts || 0)}
                    isOpen={showRouAssetModal}
                    onClose={() => setShowRouAssetModal(false)}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ["lease", leaseId] })}
                />
            )}
        </StandardPage>
    );
}
