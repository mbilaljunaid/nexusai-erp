import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Clock, AlertTriangle, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function ApMetricCards() {
    const { data: invoices } = useQuery({
        queryKey: ['/api/ap/invoices'],
        queryFn: () => api.ap.invoices.list()
    });

    const { data: payments } = useQuery({
        queryKey: ['/api/ap/payments'],
        queryFn: () => api.ap.payments.list()
    });

    // Calculate metrics
    const totalInvoices = invoices?.length || 0;
    const pendingApproval = invoices?.filter((i: any) => i.status === "PendingApproval").length || 0;
    const onHold = invoices?.filter((i: any) => i.status === "OnHold").length || 0;

    // Calculate cash outflow (sum of scheduled payments)
    const cashOutflow = payments
        ?.filter((p: any) => p.status === "Scheduled")
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalInvoices}</div>
                    <p className="text-xs text-muted-foreground">Across all periods</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                    <Clock className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingApproval}</div>
                    <p className="text-xs text-muted-foreground">Requires action</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Next 30 Days Outflow</CardTitle>
                    <DollarSign className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${cashOutflow.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Scheduled payments</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">On Hold</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{onHold}</div>
                    <p className="text-xs text-muted-foreground">Exceptions to resolve</p>
                </CardContent>
            </Card>
        </div>
    );
}
