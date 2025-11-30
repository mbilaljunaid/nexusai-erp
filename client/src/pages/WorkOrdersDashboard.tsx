import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hammer } from "lucide-react";

export default function WorkOrdersDashboard() {
  const { data: workOrders = [] } = useQuery<any[]>({ queryKey: ["/api/manufacturing/work-orders"] });
  const completed = workOrders.filter((w: any) => w.status === "completed").length;
  const inProgress = workOrders.filter((w: any) => w.status === "in_progress").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Hammer className="w-8 h-8" />Manufacturing Orders</h1>
        <p className="text-muted-foreground">Manage work orders and production</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Orders</p><p className="text-2xl font-bold">{workOrders.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">In Progress</p><p className="text-2xl font-bold text-blue-600">{inProgress}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Completed</p><p className="text-2xl font-bold text-green-600">{completed}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Work Orders</CardTitle></CardHeader><CardContent><div className="space-y-2">{workOrders.map((wo: any) => (<div key={wo.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{wo.orderNumber}</p><p className="text-sm text-muted-foreground">BOM: {wo.bomId}</p></div><div className="text-right"><p className="font-semibold">{wo.quantity} units</p><Badge variant={wo.status === "completed" ? "outline" : "default"}>{wo.status}</Badge></div></div>))}</div></CardContent></Card>
    </div>
  );
}
