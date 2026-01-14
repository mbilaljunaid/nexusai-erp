import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, CheckCircle, AlertCircle, ScanEye } from "lucide-react";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { BillingEvent } from "@shared/schema/billing_enterprise";

export default function BillingWorkbench() {
    const { toast } = useToast();
    const [page, setPage] = useState(1);
    const pageSize = 50; // Server-side pagination supported by StandardTable

    // Fetch Pending Events
    const { data: events = [], isLoading } = useQuery<BillingEvent[]>({
        queryKey: ["/api/billing/events/pending"],
        queryFn: () => fetch("/api/billing/events/pending").then(r => r.json()),
    });

    // Run Auto-Invoice Mutation
    const autoInvoiceMutation = useMutation({
        mutationFn: () => fetch("/api/billing/process-batch", { method: "POST" }).then(r => r.json()),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/billing/events/pending"] });
            toast({
                title: "Auto-Invoice Run Completed",
                description: `Created ${data.count} invoices in Batch ${data.batchId}`
            });
        },
        onError: (error) => {
            toast({ title: "Auto-Invoice Failed", description: error.message, variant: "destructive" });
        }
    });

    // Run AI Scan
    const aiScanMutation = useMutation({
        mutationFn: () => fetch("/api/billing/ai/detect-anomalies", { method: "POST" }).then(r => r.json()),
        onSuccess: (data) => {
            toast({ title: "AI Analysis Complete", description: `Scanned events. Found potential issues.` });
        }
    });

    const columns: Column<BillingEvent>[] = [
        {
            header: "Event Date",
            accessorKey: "eventDate",
            cell: (e) => new Date(e.eventDate).toLocaleDateString()
        },
        {
            header: "Source",
            accessorKey: "sourceSystem",
            cell: (e) => (
                <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="w-fit">{e.sourceSystem}</Badge>
                    {e.sourceSystem === 'Projects' && (
                        <Link href={`/projects/${e.sourceTransactionId}`} className="text-xs text-primary hover:underline">
                            View Project
                        </Link>
                    )}
                    {e.sourceSystem === 'Orders' && (
                        <Link href={`/crm/orders/${e.sourceTransactionId}`} className="text-xs text-primary hover:underline">
                            View Order
                        </Link>
                    )}
                </div>
            )
        },
        {
            header: "Customer",
            accessorKey: "customerId" // In real app, would join with Customer Name
        },
        {
            header: "Description",
            accessorKey: "description",
            className: "max-w-md truncate"
        },
        {
            header: "Amount",
            accessorKey: "amount",
            cell: (e) => `$${Number(e.amount).toFixed(2)}`,
            className: "font-mono font-bold text-right"
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (e) => <Badge variant={e.status === 'Pending' ? 'secondary' : 'default'}>{e.status}</Badge>
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing Workbench</h1>
                    <p className="text-muted-foreground">Manage unbilled events and generate invoices.</p>
                </div>
                <Button
                    onClick={() => autoInvoiceMutation.mutate()}
                    disabled={autoInvoiceMutation.isPending || events.length === 0}
                    className="gap-2"
                >
                    {autoInvoiceMutation.isPending ? <div className="animate-spin text-xl">◌</div> : <PlayCircle className="w-4 h-4" />}
                    Run Auto-Invoice
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => aiScanMutation.mutate()}
                    disabled={aiScanMutation.isPending}
                    className="gap-2"
                >
                    <ScanEye className="w-4 h-4" />
                    AI Scan
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Unbilled Events</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{events.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Unbilled Value</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${events.reduce((acc, e) => acc + Number(e.amount), 0).toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                            <CheckCircle className="w-4 h-4" /> Ready to Process
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    <StandardTable
                        data={events}
                        columns={columns}
                        isLoading={isLoading}
                        page={page}
                        pageSize={pageSize}
                        totalItems={events.length}
                        onPageChange={setPage}
                        keyExtractor={(e) => e.id}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
