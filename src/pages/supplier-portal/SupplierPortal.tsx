import { formatDate } from "@/lib/dateUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";


export default function SupplierPortal() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPO, setSelectedPO] = useState<any>(null);

    const { data: orders } = useQuery<any>({
        queryKey: ["/api/supplier-portal/purchase-orders"],
        queryFn: () => apiRequest("GET", "/api/supplier-portal/purchase-orders").then(res => res.json()),
    });

    const confirmMutation = useMutation({
        mutationFn: (poId: number) =>
            apiRequest("POST", `/api/supplier-portal/purchase-orders/${poId}/confirm`),
        onSuccess: () => {
            toast({ title: "Success", description: "Purchase order confirmed" });
            queryClient.invalidateQueries({ queryKey: ["/api/supplier-portal/purchase-orders"] });
        },
    });

    return (
        <StandardPage title="Supplier Portal">
            <div>
                
                <p className="text-muted-foreground">Purchase orders and shipment notifications</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Purchase Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {orders?.map((order: any) => (
                        <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-medium">{order.poNumber}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {formatDate(order.orderDate)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">${order.amount?.toLocaleString()}</div>
                                    <Badge variant={order.status === "CONFIRMED" ? "default" : "secondary"}>
                                        {order.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <Button size="sm" onClick={() => confirmMutation.mutate(order.id)}>
                                    Confirm PO
                                </Button>
                                <Button size="sm" variant="outline">
                                    <Upload className="h-3 w-3 mr-1" />
                                    Submit ASN
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </StandardPage>
    );
}
