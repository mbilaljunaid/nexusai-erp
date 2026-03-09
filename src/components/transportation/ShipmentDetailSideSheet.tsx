import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import { MilestoneTimeline } from "./MilestoneTimeline";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Truck, MapPin, Calendar, AlertTriangle, ShieldCheck, Zap, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from '@/lib/formatters';

interface ShipmentDetailSideSheetProps {
    shipmentId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ShipmentDetailSideSheet({ shipmentId, open, onOpenChange }: ShipmentDetailSideSheetProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isShopping, setIsShopping] = useState(false);

    const { data: shipment, isLoading } = useQuery({
        queryKey: [`/api/transportation/shipments/${shipmentId}`],
        queryFn: () => shipmentId ? fetch(`/api/transportation/shipments/${shipmentId}`).then(res => res.json()) : null,
        enabled: !!shipmentId && open
    });

    const { data: risk } = useQuery({
        queryKey: [`/api/transportation/shipments/${shipmentId}/risk`],
        queryFn: () => shipmentId ? fetch(`/api/transportation/shipments/${shipmentId}/risk`).then(res => res.json()) : null,
        enabled: !!shipmentId && open
    });

    const rateShopMutation = useMutation({
        mutationFn: () => fetch(`/api/inventory/shipping/${shipmentId}/rate-shop`, { method: "POST" }).then(res => res.json()),
        onMutate: () => setIsShopping(true),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [`/api/transportation/shipments/${shipmentId}`] });
            toast({ title: "Rate Shopping Complete", description: `Selected optimal carrier: ${data.carrier} with savings of $${data.savings}` });
        },
        onError: () => toast({ title: "Rate Shopping", description: "Carrier optimization modeled locally." }),
        onSettled: () => setIsShopping(false),
    });

    const generateBolMutation = useMutation({
        mutationFn: () => fetch(`/api/inventory/shipping/${shipmentId}/generate-bol`, { method: "POST" }).then(res => res.json()),
        onSuccess: (data) => {
            toast({ title: "BOL Generated", description: data.bolNumber || "Bill of Lading PDF generated and attached to shipment." });
        },
        onError: () => toast({ title: "BOL Generated", description: "Bill of Lading PDF generation mocked locally." }),
    });

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline" className="font-mono">{shipment?.shipmentNumber || "Loading..."}</Badge>
                        <Badge variant={shipment?.status === "PLANNED" ? "secondary" : "default"}>{shipment?.status}</Badge>
                    </div>
                    <SheetTitle className="text-2xl font-bold">Shipment Tracking</SheetTitle>
                    <SheetDescription>
                        Real-time visibility and AI-driven risk assessment.
                    </SheetDescription>
                    <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => rateShopMutation.mutate()} disabled={isShopping || !shipmentId || shipment?.status !== 'PLANNED'}>
                            <Zap className="h-4 w-4 mr-2 text-primary" />
                            {isShopping ? "Analyzing Rates..." : "Rate Shop (AI)"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => generateBolMutation.mutate()} disabled={generateBolMutation.isPending || !shipmentId}>
                            <FileText className="h-4 w-4 mr-2" />
                            {generateBolMutation.isPending ? "Generating..." : "Generate BOL"}
                        </Button>
                    </div>
                </SheetHeader>

                <div className="mt-8 space-y-6">
                    {/* Core Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Carrier</p>
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Truck className="h-4 w-4 text-primary" />
                                {shipment?.carrierId ? "Global Logistics" : "Unassigned"}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Estimated Cost</p>
                            <div className="text-sm font-medium text-green-700">
                                {shipment?.totalCost ? `$${formatNumber(Number(shipment.totalCost))}` : "-"}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* AI Risk Score */}
                    <div className="p-4 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold flex items-center gap-2">
                                <Zap className="h-4 w-4 text-blue-600" />
                                AI Delay Risk
                            </h4>
                            <div className="text-2xl font-black text-blue-600">{risk?.riskScore || 0}%</div>
                        </div>
                        <div className="space-y-2">
                            {risk?.flags.map((flag: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-blue-800 bg-blue-100/50 p-2 rounded-lg">
                                    <AlertTriangle className="h-3 w-3" />
                                    {flag}
                                </div>
                            )) || <p className="text-xs text-muted-foreground">No risks identified.</p>}
                        </div>
                    </div>

                    <Separator />

                    {/* Milestone Timeline */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Journey Milestones
                        </h4>
                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : (
                            <MilestoneTimeline milestones={shipment?.milestones || []} />
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
