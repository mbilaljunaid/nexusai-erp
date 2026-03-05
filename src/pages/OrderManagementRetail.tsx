import { useQuery } from "@tanstack/react-query";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";

export default function OrderManagementRetail() {
    const { data: orders = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/retail-orders"],
        queryFn: () => fetch("/api/retail-orders").then(r => r.json()).catch(() => []),
    });
    const completed = orders.filter((o: any) => o.status === "completed").length;
    const totalValue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.totalAmount) || 0), 0);
    return (
        <StandardPage
            title="Order Management"
            description="Order capture, fulfillment, shipment, returns, cancellations, tracking, notifications"
            className="space-y-6"
        >
            <div className="grid grid-cols-4 gap-3">
                <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{orders.length}</p></CardContent></Card>
                <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold text-green-600">{completed}</p></CardContent></Card>
                <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-600">{orders.filter((o: any) => o.status === "pending").length}</p></CardContent></Card>
                <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Value</p><p className="text-2xl font-bold text-blue-600">${(totalValue / 1000).toFixed(0)}K</p></CardContent></Card>
            </div>
            <Card> <CardHeader><CardTitle className="text-base">Orders</CardTitle></CardHeader> <CardContent className="space-y-2"> {isLoading ? <TableSkeleton rows={4} /> : orders.length === 0 ? <p className="text-muted-foreground text-center py-4">No orders</p> : orders.slice(0, 10).map((o: any) => (<div key={o.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`order-${o.id}`}> <div className="flex-1"><p className="font-semibold">{o.orderId}</p><p className="text-xs text-muted-foreground">${o.totalAmount}</p></div> <Badge variant={o.status === "completed" ? "default" : "secondary"} className="text-xs">{o.status}</Badge> </div>))} </CardContent> </Card>
        </StandardPage>
    );
}
