import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Calendar, Package, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";


export default function SubscriptionManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPlan, setSelectedPlan] = useState("");

    const { data: subscription } = useQuery<any>({
        queryKey: ["/api/portal/subscription"],
        queryFn: () => apiRequest("GET", "/api/portal/subscription").then(res => res.json()),
    });

    const { data: availablePlans } = useQuery<any>({
        queryKey: ["/api/portal/subscription-plans"],
        queryFn: () => apiRequest("GET", "/api/portal/subscription-plans").then(res => res.json()),
    });

    const upgradeMutation = useMutation({
        mutationFn: (planId: string) =>
            apiRequest("POST", "/api/portal/subscription/upgrade", { planId }),
        onSuccess: () => {
            toast({ title: "Success", description: "Subscription upgraded successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/portal/subscription"] });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: () => apiRequest("POST", "/api/portal/subscription/cancel"),
        onSuccess: () => {
            toast({ title: "Success", description: "Subscription cancelled" });
            queryClient.invalidateQueries({ queryKey: ["/api/portal/subscription"] });
        },
    });

    const columns: SpreadsheetColumn<any>[] = [
        { id: "date", header: "Date", width: "150px", cell: (bill: any) => <span>{new Date(bill.date).toLocaleDateString()}</span> },
        { id: "description", header: "Description", width: "300px", cell: (bill: any) => <span>{bill.description}</span> },
        { id: "amount", header: "Amount", width: "120px", cell: (bill: any) => <span>${bill.amount}</span> },
        {
            id: "status", header: "Status", width: "120px", cell: (bill: any) => (
                <Badge variant={bill.status === 'PAID' ? 'default' : 'secondary'}>
                    {bill.status}
                </Badge>
            )
        }
    ];

    return (
        <StandardPage title="Subscription Management">
            <div>
                
                <p className="text-muted-foreground">Manage your subscription plan and billing</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-3xl font-bold">{subscription?.planName}</div>
                            <div className="text-muted-foreground mt-1">${subscription?.monthlyPrice}/month</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Next billing date:</span>
                                <span className="font-medium">
                                    {subscription?.nextBillingDate && new Date(subscription.nextBillingDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Users:</span>
                                <span className="font-medium">{subscription?.users} / {subscription?.maxUsers}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Status:</span>
                                <Badge variant={subscription?.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {subscription?.status}
                                </Badge>
                            </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => cancelMutation.mutate()}>
                            Cancel Subscription
                        </Button>
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Available Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            {availablePlans?.map((plan: any) => (
                                <Card key={plan.id} className={plan.id === subscription?.planId ? "border-primary" : ""}>
                                    <CardContent className="pt-6 space-y-4">
                                        <div>
                                            <div className="text-2xl font-bold">{plan.name}</div>
                                            <div className="text-3xl font-bold text-primary mt-2">${plan.price}</div>
                                            <div className="text-muted-foreground">/month</div>
                                        </div>
                                        <ul className="space-y-2 text-sm">
                                            {plan.features?.map((feature: string, i: number) => (
                                                <li key={i}>✓ {feature}</li>
                                            ))}
                                        </ul>
                                        {plan.id !== subscription?.planId && (
                                            <Button
                                                className="w-full"
                                                onClick={() => upgradeMutation.mutate(plan.id)}
                                                disabled={upgradeMutation.isPending}
                                            >
                                                {plan.price > subscription?.monthlyPrice ? 'Upgrade' : 'Downgrade'}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <InteractiveSpreadsheet
                            data={subscription?.billingHistory || []}
                            columns={columns}
                            virtualized={true}
                            containerHeight="300px"
                            onChange={() => { }}
                        />
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
