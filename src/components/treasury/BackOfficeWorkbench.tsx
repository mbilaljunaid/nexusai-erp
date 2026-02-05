
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ShieldAlert, CreditCard } from "lucide-react";
import { TreasuryDeal, TreasuryFxDeal } from "@shared/schema/treasury";

export function BackOfficeWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch PENDING deals
    const { data: pendingDeals, isLoading: loadingDeals } = useQuery<TreasuryDeal[]>({
        queryKey: ["/api/treasury/deals", { status: "DRAFT" }],
    });

    const { data: pendingFxDeals, isLoading: loadingFxDeals } = useQuery<TreasuryFxDeal[]>({
        queryKey: ["/api/treasury/fx-deals"],
    });

    const confirmMutation = useMutation({
        mutationFn: async ({ id, isFx }: { id: string; isFx: boolean }) => {
            const endpoint = isFx ? `/api/treasury/fx-deals/${id}/confirm` : `/api/treasury/deals/${id}/confirm`;
            const res = await apiRequest("POST", endpoint, {});
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/treasury/deals"] });
            queryClient.invalidateQueries({ queryKey: ["/api/treasury/fx-deals"] });
            toast({ title: "Deal Confirmed", description: "The deal has been legally confirmed by Back-Office." });
        },
        onError: (error: any) => {
            toast({
                title: "Compliance Error",
                description: error.message || "Failed to confirm deal due to SoD violation.",
                variant: "destructive"
            });
        }
    });

    if (loadingDeals || loadingFxDeals) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20" />;

    const allPendingFx = pendingFxDeals?.filter(d => d.confirmationStatus === 'PENDING') || [];
    const allPendingTreasury = pendingDeals?.filter(d => d.confirmationStatus === 'PENDING') || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-orange-500" />
                <div>
                    <h2 className="text-xl font-bold">Back-Office Hub</h2>
                    <p className="text-sm text-muted-foreground">Legal validation and settlement of treasury instruments.</p>
                </div>
            </div>

            <Card className="border-orange-500/20 bg-orange-500/5">
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        Control Registry: Segregation of Duties
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        In accordance with Tier-1 compliance standards (SOX/COSO), the trader who booked the deal is restricted from confirming or settling it.
                        All actions here are logged for external audit.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Confirmations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Deal #</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Counterparty</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Trader</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allPendingTreasury.map((deal) => (
                                <TableRow key={deal.id}>
                                    <TableCell className="font-medium">{deal.dealNumber}</TableCell>
                                    <TableCell><Badge variant="outline">{deal.type}</Badge></TableCell>
                                    <TableCell>CP-{deal.counterpartyId.substring(0, 8)}</TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {Number(deal.principalAmount).toLocaleString()} {deal.currency}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{deal.traderId || 'SYSTEM'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            onClick={() => confirmMutation.mutate({ id: deal.id, isFx: false })}
                                            disabled={confirmMutation.isPending}
                                        >
                                            Confirm
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {allPendingFx.map((deal) => (
                                <TableRow key={deal.id}>
                                    <TableCell className="font-medium">{deal.dealNumber}</TableCell>
                                    <TableCell><Badge variant="secondary">{deal.dealType}</Badge></TableCell>
                                    <TableCell>CP-{deal.counterpartyId.substring(0, 8)}</TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {Number(deal.buyAmount).toLocaleString()} {deal.buyCurrency}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{deal.traderId || 'SYSTEM'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            onClick={() => confirmMutation.mutate({ id: deal.id, isFx: true })}
                                            disabled={confirmMutation.isPending}
                                        >
                                            Confirm
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {allPendingTreasury.length === 0 && allPendingFx.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                                        All deals are confirmed. Back-office queue is clear.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
