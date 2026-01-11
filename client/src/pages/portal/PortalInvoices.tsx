
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { FileText, Download, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PortalInvoices() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: invoices, isLoading } = useQuery({
        queryKey: ["/api/portal/invoices"],
        queryFn: async () => (await apiRequest("GET", "/api/portal/invoices")).json()
    });

    const payMutation = useMutation({
        mutationFn: async (invoiceId: string) => {
            const invoice = invoices.find((i: any) => i.id === invoiceId);
            return apiRequest("POST", "/api/portal/pay", {
                invoiceId,
                amount: invoice.totalAmount // Pay full for now
            });
        },
        onSuccess: () => {
            toast({ title: "Payment Successful", description: "Thank you for your payment!" });
            queryClient.invalidateQueries({ queryKey: ["/api/portal/invoices"] });
            queryClient.invalidateQueries({ queryKey: ["/api/portal/me"] });
        },
        onError: (err: any) => {
            toast({ title: "Payment Failed", description: err.message, variant: "destructive" });
        }
    });

    if (isLoading) return <div>Loading invoices...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>

            <div className="space-y-4">
                {invoices?.map((inv: any) => (
                    <Card key={inv.id} className="group hover:border-emerald-300 transition-colors">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                    <FileText className="h-5 w-5 text-slate-500 group-hover:text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{inv.invoiceNumber}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Due {inv.dueDate ? format(new Date(inv.dueDate), "MMM dd, yyyy") : "N/A"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xl font-bold text-slate-900">${Number(inv.totalAmount).toLocaleString()}</div>
                                    <Badge variant={inv.status === "Paid" ? "default" : inv.status === "Overdue" ? "destructive" : "secondary"}>
                                        {inv.status}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" /> PDF
                                    </Button>

                                    {inv.status !== "Paid" && (
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            onClick={() => payMutation.mutate(inv.id)}
                                            disabled={payMutation.isPending}
                                        >
                                            {payMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <CreditCard className="mr-2 h-4 w-4" />}
                                            Pay Now
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
