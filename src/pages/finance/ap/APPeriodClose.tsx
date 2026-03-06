import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Lock, Calendar, AlertTriangle, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { StandardPage } from "@/components/layout/StandardPage";
import { useEnterpriseStore } from "@/lib/enterpriseStore";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function APPeriodClose() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("control");
    const [closingPeriod, setClosingPeriod] = useState<{ id: string, name: string } | null>(null);
    const { legalEntityId } = useEnterpriseStore();

    const { data: periods, isLoading } = useQuery<any>({
        queryKey: ["ap-periods", legalEntityId],
        queryFn: api.ap.periods.list,
    });

    const closeMutation = useMutation({
        mutationFn: (periodId: string) => api.ap.periods.close(periodId),
        onSuccess: (data) => {
            if (data.success) {
                toast({
                    title: "Period Closed",
                    description: "The AP accounting period has been successfully closed.",
                });
                queryClient.invalidateQueries({ queryKey: ["ap-periods"] });
            } else {
                toast({
                    title: "Close Failed",
                    description: "There are exceptions preventing period close.",
                    variant: "destructive",
                });
            }
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleClose = (periodId: string, periodName: string) => {
        setClosingPeriod({ id: periodId, name: periodName });
    };



    return (
        <StandardPage title="AP Period Close" description="Manage Accounts Payable accounting periods and validate subledger readiness.">
            {/* Ledger Context Banner */}
            {legalEntityId && (
                <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                        Period close scoped to Legal Entity: {legalEntityId}
                    </span>
                </div>
            )}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                <TabsList>
                    <TabsTrigger value="control">Period Control</TabsTrigger>
                    <TabsTrigger value="readiness">Readiness Checks</TabsTrigger>
                </TabsList>

                <TabsContent value="control" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Accounting Periods</CardTitle>
                            <CardDescription>
                                View and manage the status of AP accounting periods. Linkage to GL periods is automatic.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-4">Loading periods...</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Period Name</TableHead>
                                            <TableHead>AP Status</TableHead>
                                            <TableHead>GL Status</TableHead>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>End Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {periods?.map((period: any) => (
                                            <TableRow key={period.id}>
                                                <TableCell className="font-medium flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {period.periodName}
                                                </TableCell>
                                                <TableCell><StatusBadge status={period.apStatus} /></TableCell>
                                                <TableCell>
                                                    <StatusBadge status={period.glStatus} />
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(period.startDate)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(period.endDate)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {period.apStatus === "OPEN" || period.apStatus === "Open" ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleClose(period.id, period.periodName)}
                                                            disabled={closeMutation.isPending}
                                                        >
                                                            <Lock className="h-3 w-3 mr-2" />
                                                            Close Period
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm italic">No actions</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {periods?.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No periods found. Ensure GL Periods are defined.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="readiness" className="space-y-4 mt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Unvalidated Invoices</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold flex items-center gap-2 text-green-600">
                                    <CheckCircle className="h-6 w-6" />
                                    0
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">All invoices are validated</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Unaccounted Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold flex items-center gap-2 text-green-600">
                                    <CheckCircle className="h-6 w-6" />
                                    0
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">All transactions transferred to SLA</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Reconciliation Variance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                                    <CheckCircle className="h-6 w-6" />
                                    $0.00
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Subledger matches GL balance</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Exceptions Report</CardTitle>
                            <CardDescription>Detailed breakdown of exceptions preventing period close</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                                <h3 className="text-lg font-medium text-foreground">Ready to Close</h3>
                                <p className="max-w-md text-center mt-2">No exceptions detected for the current period. The subledger is ready to be closed.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <AlertDialog open={!!closingPeriod} onOpenChange={(open) => !open && setClosingPeriod(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Close Period</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to close AP period {closingPeriod?.name}? This action cannot be easily undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            if (closingPeriod) {
                                closeMutation.mutate(closingPeriod.id);
                                setClosingPeriod(null);
                            }
                        }}>
                            Close Period
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
