import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Play } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function PaymentAutomation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [paymentMethod, setPaymentMethod] = useState("ACH");

    const runAutomationMutation = useMutation({
        mutationFn: (data: any) =>
            apiRequest("POST", "/ap/automation/run", data),
        onSuccess: () => {
            toast({ title: "Success", description: "Payment automation executed successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/ap/automation"] });
        },
    });

    return (
        <StandardPage
            title="Advanced Payment Automation"
            description="Batch optimization, early pay discounts, virtual cards"
        >

            <Card>
                <CardHeader>
                    <CardTitle>Automation Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium">Payment Method</Label>
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
                        <Checkbox id="earlyPay" defaultChecked />
                        <Label htmlFor="earlyPay" className="text-sm cursor-pointer leading-none">
                            Enable Early Payment Discounts
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="batchOptimize" defaultChecked />
                        <Label htmlFor="batchOptimize" className="text-sm cursor-pointer leading-none">
                            Batch Optimization (Group payments to same vendor)
                        </Label>
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
        </StandardPage>
    );
}
