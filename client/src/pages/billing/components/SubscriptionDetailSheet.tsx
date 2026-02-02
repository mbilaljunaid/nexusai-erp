
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SubscriptionDetailSheetProps {
    subscriptionId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SubscriptionDetailSheet({ subscriptionId, open, onOpenChange }: SubscriptionDetailSheetProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetch Full Details
    const { data: sub, isLoading } = useQuery({
        queryKey: ["subscription", subscriptionId],
        queryFn: () => fetch(`/api/billing/subscriptions/${subscriptionId}`).then(res => res.json()),
        enabled: !!subscriptionId
    });

    const amendMutation = useMutation({
        mutationFn: async () => {
            if (!sub) return;
            // Demo Amendment: Add 5 Qty to first product
            const product = sub.products[0];
            const newQty = parseFloat(product.quantity) + 5;
            const newAmt = newQty * parseFloat(product.unitPrice);

            const res = await fetch(`/api/billing/subscriptions/${subscriptionId}/amend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reason: "Upsell Expansion",
                    mrrDelta: (5 * parseFloat(product.unitPrice)),
                    products: [
                        { id: product.id, quantity: newQty, amount: newAmt }
                    ]
                })
            });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Amended", description: "Subscription quantity increased." });
            queryClient.invalidateQueries({ queryKey: ["subscription", subscriptionId] });
        }
    });

    const renewMutation = useMutation({
        mutationFn: async () => fetch(`/api/billing/subscriptions/${subscriptionId}/renew`, { method: "POST" }),
        onSuccess: () => {
            toast({ title: "Renewed", description: "Subscription extended by 1 year." });
            queryClient.invalidateQueries({ queryKey: ["subscription", subscriptionId] });
        }
    });

    if (!sub) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[600px] sm:w-[700px]">
                <SheetHeader>
                    <SheetTitle>Subscription Details</SheetTitle>
                    <SheetDescription>
                        Contract: <span className="font-mono">{sub.contractNumber}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* Status Header */}
                    <div className="flex justify-between items-center bg-muted/20 p-4 rounded-md">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Status</Label>
                            <div><Badge>{sub.status}</Badge></div>
                        </div>
                        <div className="space-y-1 text-right">
                            <Label className="text-muted-foreground">Total MRR</Label>
                            <div className="text-2xl font-bold text-primary">${sub.totalMrr}</div>
                        </div>
                    </div>

                    <Separator />

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Start Date</Label>
                            <div className="font-medium">{new Date(sub.startDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">End Date</Label>
                            <div className="font-medium">{new Date(sub.endDate).toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Item</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sub.products?.map((p: any) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.itemName}</TableCell>
                                        <TableCell className="text-right">{p.quantity}</TableCell>
                                        <TableCell className="text-right">${p.unitPrice}</TableCell>
                                        <TableCell className="text-right">${p.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => amendMutation.mutate()} disabled={amendMutation.isPending}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {amendMutation.isPending ? "Amending..." : "Amend (+5 Qty)"}
                        </Button>
                        <Button variant="default" onClick={() => renewMutation.mutate()} disabled={renewMutation.isPending}>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            {renewMutation.isPending ? "Renewing..." : "Renew"}
                        </Button>
                    </div>

                    {/* Audit Trail */}
                    <div className="bg-muted/10 p-4 rounded-md">
                        <h4 className="text-sm font-semibold mb-3">Audit Trail</h4>
                        <div className="space-y-2 max-h-[150px] overflow-y-auto">
                            {sub.actions?.map((action: any) => (
                                <div key={action.id} className="text-xs flex justify-between border-b pb-1 last:border-0 border-muted">
                                    <span><span className="font-medium">{action.actionType}</span> - {action.reason}</span>
                                    <span className="text-muted-foreground">{new Date(action.actionDate).toLocaleDateString()}</span>
                                </div>
                            ))}
                            {!sub.actions?.length && <div className="text-xs text-muted-foreground">No history available.</div>}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
