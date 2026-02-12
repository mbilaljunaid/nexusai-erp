import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Play } from "lucide-react";

export default function PaymentAutomation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [paymentMethod, setPaymentMethod] = useState("ACH");

    const runAutomationMutation = useMutation({
        mutationFn: (data: any) =>
            apiRequest("/ap/automation/run", {
                method: "POST",
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            toast({ title: "Success", description: "Payment automation executed successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/ap/automation"] });
        },
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Advanced Payment Automation</h1>
                <p className="text-muted-foreground">Batch optimization, early pay discounts, virtual cards</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Automation Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Payment Method</label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACH">ACH</SelectItem>
                                <SelectItem value="WIRE">Wire Transfer</SelectItem>
                                <SelectItem value="VIRTUAL_CARD">Virtual Card</SelectItem>
                                <SelectItem value="CHECK">Check</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="earlyPay" defaultChecked />
                        <label htmlFor="earlyPay" className="text-sm">
                            Enable Early Payment Discounts
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="batchOptimize" defaultChecked />
                        <label htmlFor="batchOptimize" className="text-sm">
                            Batch Optimization (Group payments to same vendor)
                        </label>
                    </div>
                    <Button
                        className="w-full"
                        onClick={() => runAutomationMutation.mutate({ paymentMethod })}
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Run Payment Automation
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
