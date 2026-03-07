
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Separator } from "@/components/ui/separator";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useEnterpriseStore } from "@/lib/enterpriseStore";
import { StandardPage } from '@/components/layout/StandardPage';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatNumber } from '@/lib/formatters';

export default function ArPeriodClose() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("control");
    const [closingPeriodName, setClosingPeriodName] = useState<string | null>(null);
    const { legalEntityId } = useEnterpriseStore();

    const { data: periods, isLoading } = useQuery<any>({
        queryKey: ["ar-periods", legalEntityId],
        queryFn: api.ar.periods.list,
    });

    const { data: reconciliation } = useQuery<any>({
        queryKey: ["ar-reconciliation", legalEntityId],
        queryFn: api.ar.periods.getReconciliation,
    });

    const closeMutation = useMutation({
        mutationFn: (periodName: string) => api.ar.periods.close(periodName),
        onSuccess: (data) => {
            if (data.success) {
                toast({
                    title: "Period Closed",
                    description: "The accounting period has been successfully closed.",
                });
                queryClient.invalidateQueries({ queryKey: ["ar-periods"] });
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

    const handleClose = (periodName: string) => {
        setClosingPeriodName(periodName);
    };



    return (
        <StandardPage
            title="Period Close & Reconciliation"
            description="Manage AR accounting periods and validate subledger integrity."
        >
            <div className="space-y-6">

                {/* LE Context Banner */}
                {legalEntityId && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm">
                        <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                            AR Period Close scoped to Legal Entity: {legalEntityId}
                        </span>
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="control">Period Control</TabsTrigger>
                        <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="control" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Accounting Periods</CardTitle>
                                <CardDescription>
                                    View and manage the status of AR accounting periods. Linkage to GL periods is automatic.
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
                                                <TableHead>Status</TableHead>
                                                <TableHead>GL Status</TableHead>
                                                <TableHead>Last Updated By</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {periods?.map((period: any) => (
                                                <TableRow key={period.periodName}>
                                                    <TableCell className="font-medium flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {period.periodName}
                                                    </TableCell>
                                                    <TableCell><StatusBadge status={period.status} /></TableCell>
                                                    <TableCell>
                                                        {/* Mock GL Status for context */}
                                                        <Badge variant="outline">Open</Badge>
                                                    </TableCell>
                                                    <TableCell>{period.auditId || "-"}</TableCell>
                                                    <TableCell className="text-right">
                                                        {period.status === "Open" || period.status === "Never Opened" ? ( // Allow closing 'Never Opened' for demo simplicity if treated as open-able
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleClose(period.periodName)}
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
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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

                    <TabsContent value="reconciliation" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Subledger Balance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${formatNumber(reconciliation?.subledgerBalance)}</div>
                                    <p className="text-xs text-muted-foreground">Total of all AR TB items</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">GL Balance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${formatNumber(reconciliation?.glBalance)}</div>
                                    <p className="text-xs text-muted-foreground">Account: 11000 - Accounts Receivable</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Difference</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {reconciliation?.difference === 0 ? (
                                        <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                                            <CheckCircle className="h-6 w-6" />
                                            $0.00
                                        </div>
                                    ) : (
                                        <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
                                            <AlertTriangle className="h-6 w-6" />
                                            ${formatNumber(reconciliation?.difference)}
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground">Variance to investigate</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Reconciliation Report</CardTitle>
                                <CardDescription>Detailed breakdown of variance by account</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center py-8 text-muted-foreground">
                                    <AlertCircle className="h-10 w-10 mr-4 text-gray-300" />
                                    <p>No variance detected for the current period.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <AlertDialog open={!!closingPeriodName} onOpenChange={(open) => !open && setClosingPeriodName(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Close Period</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to close period {closingPeriodName}? This action cannot be easily undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            if (closingPeriodName) {
                                closeMutation.mutate(closingPeriodName);
                                setClosingPeriodName(null);
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
