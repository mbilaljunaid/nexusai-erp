import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CheckCircle, XCircle, Clock, FileText, ArrowRight } from "lucide-react";

export function ApApprovalList() {
    const queryClient = useQueryClient();
    const { data: invoices, isLoading } = useQuery({
        queryKey: ['/api/ap/invoices'], // We filter locally for now, or use a dedicated endpoint
        queryFn: () => api.ap.invoices.list()
    });

    const pendingInvoices = invoices?.filter((i: any) => i.status === "PendingApproval") || [];

    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.ap.invoices.approve(id, "One-click approval from list");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/ap/invoices'] });
        }
    });

    if (isLoading) {
        return <div className="p-4 text-center">Loading approvals...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingInvoices.map((invoice: any) => (
                    <Card key={invoice.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-amber-500">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-amber-500" />
                                        Approval Required
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1">
                                        Invoice: {invoice.invoiceNumber}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="border-amber-500 text-amber-500">
                                    SLA: 2 Days Left
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 mt-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-bold text-lg">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(Number(invoice.amount))}
                                    </span>
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" size="sm" className="text-xs">
                                        <XCircle className="h-3 w-3 mr-1" /> Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="text-xs"
                                        disabled={approveMutation.isPending}
                                        onClick={() => approveMutation.mutate(invoice.id)}
                                    >
                                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {pendingInvoices.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <CheckCircle className="h-10 w-10 mb-2 text-green-500" />
                        <p>You're all caught up!</p>
                        <p className="text-sm">No pending approvals found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
