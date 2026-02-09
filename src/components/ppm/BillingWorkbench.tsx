// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, RefreshCw, FileText, CheckCircle, Send, DollarSign } from "lucide-react";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function BillingWorkbench() {
    const [activeTab, setActiveTab] = useState("unbilled");
    const [projectId, setProjectId] = useState<string>("default-project-001"); // Future: Selector
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Queries
    const { data: events, isLoading: isEventsLoading, refetch: refetchEvents } = useQuery({
        queryKey: ["/api/ppm/billing", projectId, "events"],
        queryFn: async () => {
            const res = await fetch(`/api/ppm/billing/${projectId}/events`);
            return res.json();
        }
    });

    const { data: invoices, isLoading: isInvoicesLoading, refetch: refetchInvoices } = useQuery({
        queryKey: ["/api/ppm/projects", projectId, "invoices"],
        queryFn: async () => {
            const res = await fetch(`/api/ppm/projects/${projectId}/invoices`);
            return res.json();
        }
    });

    // Mutations
    const generateEventsMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/ppm/billing/${projectId}/generate-events`, {});
            return res.json();
        },
        onSuccess: (data) => {
            toast({ title: "Events Generated", description: `Created ${(data as any).count} new billing events.` });
            refetchEvents();
        }
    });

    const generateInvoiceMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/ppm/billing/${projectId}/generate-invoice`, {});
            return res.json();
        },
        onSuccess: (data) => {
            if (data.success) {
                toast({ title: "Invoice Created", description: `${data.invoice.invoiceNumber} with ${data.lineCount} lines.` });
                refetchEvents(); // Events are now billed
                refetchInvoices(); // New invoice appearing
                setActiveTab("invoices"); // Switch tab
            } else {
                toast({ variant: "destructive", title: "Creation Failed", description: data.message });
            }
        }
    });

    const approveInvoiceMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("POST", `/api/ppm/invoices/${id}/approve`, {});
        },
        onSuccess: () => {
            toast({ title: "Invoice Approved", description: "Status updated to APPROVED." });
            refetchInvoices();
        }
    });

    const submitArMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("POST", `/api/ppm/invoices/${id}/submit-ar`, {});
        },
        onSuccess: () => {
            toast({ title: "Submitted to AR", description: "Invoice interfaced to Receivables." });
            refetchInvoices();
        }
    });

    // Columns
    const eventColumns: Column<any>[] = [
        { header: "Event Date", accessorKey: "eventDate", cell: (item) => format(new Date(item.eventDate), "MMM dd, yyyy") },
        { header: "Type", accessorKey: "eventType", cell: (item) => <Badge variant="outline">{item.eventType}</Badge> },
        { header: "Description", accessorKey: "description" },
        { header: "Amount", accessorKey: "amount", className: "text-right font-mono", cell: (item) => `$${Number(item.amount).toFixed(2)}` },
        { header: "Currency", accessorKey: "currency", className: "w-20" }
    ];

    const invoiceColumns: Column<any>[] = [
        { header: "Invoice #", accessorKey: "invoiceNumber", className: "font-bold" },
        { header: "Date", accessorKey: "invoiceDate", cell: (item) => format(new Date(item.invoiceDate), "MMM dd, yyyy") },
        {
            header: "Terms",
            accessorKey: "customerId",
            cell: () => <span className="text-muted-foreground text-xs">Net 30</span>
        },
        { header: "Amount", accessorKey: "amount", className: "text-right font-mono font-bold", cell: (item) => `$${Number(item.amount).toFixed(2)}` },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => {
                const colors: Record<string, string> = {
                    DRAFT: "bg-gray-100", APPROVED: "bg-blue-100 text-blue-700", TRANSFERRED: "bg-emerald-100 text-emerald-700"
                };
                return <Badge className={colors[item.status] || "bg-gray-100"}>{item.status}</Badge>
            }
        },
        {
            header: "Actions",
            accessorKey: "id",
            className: "text-right",
            cell: (item) => (
                <div className="flex justify-end gap-2">
                    {item.status === 'DRAFT' && (
                        <Button size="sm" variant="ghost" onClick={() => approveInvoiceMutation.mutate(item.id)}>
                            <CheckCircle className="w-4 h-4 text-blue-600 mr-1" /> Approve
                        </Button>
                    )}
                    {item.status === 'APPROVED' && (
                        <Button size="sm" variant="ghost" onClick={() => submitArMutation.mutate(item.id)}>
                            <Send className="w-4 h-4 text-emerald-600 mr-1" /> Submit AR
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Project Billing</h1>
                    <p className="text-lg text-slate-500 mt-2">Manage Contract Billing, Invoices, and Revenue Recognition</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => refetchEvents()}>
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="unbilled" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger value="unbilled" className="gap-2"><DollarSign className="w-4 h-4" /> Unbilled Events</TabsTrigger>
                    <TabsTrigger value="invoices" className="gap-2"><FileText className="w-4 h-4" /> Invoices</TabsTrigger>
                </TabsList>

                <TabsContent value="unbilled">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Unbilled Billing Events</CardTitle>
                                <CardDescription>Billable milestones and T&M items ready for invoicing.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => generateEventsMutation.mutate()} disabled={generateEventsMutation.isPending}>
                                    {generateEventsMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                    Generate Events
                                </Button>
                                <Button onClick={() => generateInvoiceMutation.mutate()} disabled={generateInvoiceMutation.isPending || events?.length === 0}>
                                    {generateInvoiceMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                    Create Draft Invoice
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <StandardTable
                                columns={eventColumns}
                                data={events || []}
                                isLoading={isEventsLoading}
                                pageSize={10}
                                emptyMessage="No unbilled events found. Try generating from costs."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invoices">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Invoices</CardTitle>
                            <CardDescription>Draft and Issued invoices.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <StandardTable
                                columns={invoiceColumns}
                                data={invoices || []}
                                isLoading={isInvoicesLoading}
                                pageSize={10}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
