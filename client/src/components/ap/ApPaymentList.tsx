import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreditCard, Calendar, Clock, DollarSign, ArrowRight } from "lucide-react";

export function ApPaymentList() {
    const { data: payments, isLoading } = useQuery({
        queryKey: ['/api/ap/payments'],
        queryFn: () => api.ap.payments.list()
    });

    if (isLoading) {
        return <div className="p-4 text-center">Loading payment runs...</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'default'; // primary
            case 'Scheduled': return 'outline';
            case 'Failed': return 'destructive';
            case 'Cancelled': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {payments?.map((payment: any) => (
                <Card key={payment.id} className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-green-500" />
                                    Payment Run
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">
                                    ID: {payment.id.substring(0, 8)}...
                                </CardDescription>
                            </div>
                            <Badge variant={getStatusColor(payment.status) as any}>
                                {payment.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 mt-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" /> Total
                                </span>
                                <span className="font-bold text-lg">
                                    ${Number(payment.amount).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Scheduled:
                                </span>
                                <span>
                                    {payment.scheduledDate ? new Date(payment.scheduledDate).toLocaleDateString() : 'Immediate'}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button variant="ghost" size="sm" className="text-xs h-6">
                                View Run Details <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {(!payments || payments.length === 0) && (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                    No payments scheduled. Use "Pay Invoices" to create a run.
                </div>
            )}
        </div>
    );
}
