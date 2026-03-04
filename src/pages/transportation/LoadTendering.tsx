import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function LoadTendering() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [shipmentId, setShipmentId] = useState("");
    const [tenderMode, setTenderMode] = useState<'SPOT' | 'CONTRACT'>('CONTRACT');

    const { data: shipments } = useQuery({
        queryKey: ["/api/transportation/shipments"],
        queryFn: () => apiRequest("/api/transportation/shipments?status=READY_TO_TENDER"),
    });

    const { data: carriers } = useQuery({
        queryKey: ["/api/transportation/carriers", tenderMode],
        queryFn: () => apiRequest(`/api/transportation/carriers?mode=${tenderMode}`),
    });

    const tenderMutation = useMutation({
        mutationFn: (params: any) =>
            apiRequest("/api/transportation/tender-load", {
                method: "POST",
                body: JSON.stringify(params),
            }),
        onSuccess: (data) => {
            toast({
                title: "Success",
                description: `Load tendered to ${data.carrierName}. Rate: $${data.rate}`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/transportation/shipments"] });
        },
    });

    const autoTenderMutation = useMutation({
        mutationFn: (shipmentId: string) =>
            apiRequest("/api/transportation/auto-tender", {
                method: "POST",
                body: JSON.stringify({ shipmentId }),
            }),
        onSuccess: (data) => {
            toast({
                title: "Success",
                description: `Auto-tendered to ${data.carrierName}. Savings: $${data.savings}`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/transportation/shipments"] });
        },
    });

    const columns: SpreadsheetColumn<any>[] = [
        {
            id: "carrier",
            header: "Carrier",
            width: "200px",
            cell: (carrier: any) => (
                <div>
                    <div className="font-medium">{carrier.name}</div>
                    <div className="text-sm text-muted-foreground">{carrier.serviceLevel}</div>
                </div>
            )
        },
        { id: "baseRate", header: "Base Rate", width: "120px", cell: (carrier: any) => <span>${carrier.baseRate}</span> },
        { id: "fuelSurcharge", header: "Fuel Surcharge", width: "150px", cell: (carrier: any) => <span>${carrier.fuelSurcharge}</span> },
        { id: "totalRate", header: "Total Rate", width: "120px", cell: (carrier: any) => <span className="font-bold">${carrier.totalRate}</span> },
        { id: "transitTime", header: "Transit Time", width: "150px", cell: (carrier: any) => <span>{carrier.transitDays} days</span> },
        {
            id: "performance", header: "Performance", width: "120px", cell: (carrier: any) => (
                <Badge variant={carrier.performanceScore >= 90 ? "default" : "secondary"}>
                    {carrier.performanceScore}%
                </Badge>
            )
        },
        {
            id: "actions", header: "Action", width: "120px", cell: (carrier: any) => (
                <Button
                    size="sm"
                    onClick={() =>
                        tenderMutation.mutate({
                            shipmentId,
                            carrierId: carrier.id,
                            rate: carrier.totalRate,
                        })
                    }
                    disabled={tenderMutation.isPending}
                >
                    <Send className="h-3 w-3 mr-1" />
                    Tender
                </Button>
            )
        }
    ];

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Load Tendering & Carrier Selection</h1>
                <p className="text-muted-foreground">Automated carrier selection and rate optimization</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label>Shipment</Label>
                    <Select value={shipmentId} onValueChange={setShipmentId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select shipment" />
                        </SelectTrigger>
                        <SelectContent>
                            {shipments?.map((shipment: any) => (
                                <SelectItem key={shipment.id} value={shipment.id.toString()}>
                                    {shipment.shipmentNumber} - {shipment.origin} → {shipment.destination}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Tender Mode</Label>
                    <Select value={tenderMode} onValueChange={(v: any) => setTenderMode(v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CONTRACT">Contract Carriers</SelectItem>
                            <SelectItem value="SPOT">Spot Market</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <Button
                        onClick={() => autoTenderMutation.mutate(shipmentId)}
                        disabled={!shipmentId || autoTenderMutation.isPending}
                        className="w-full"
                    >
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Auto-Tender (Best Rate)
                    </Button>
                </div>
            </div>

            {carriers && shipmentId && (
                <Card>
                    <CardHeader>
                        <CardTitle>Available Carriers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg">
                            <InteractiveSpreadsheet
                                data={carriers}
                                columns={columns}
                                virtualized={true}
                                containerHeight="400px"
                                onChange={() => { }}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
