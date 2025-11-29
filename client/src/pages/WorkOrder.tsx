import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function WorkOrder() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground mt-1">Track production work orders and status</p>
        </div>
        <Button data-testid="button-new-wo"><Plus className="h-4 w-4 mr-2" />Create Work Order</Button>
      </div>

      <div className="grid gap-4">
        {[
          { id: "WO-001", product: "Widget A", qty: 500, status: "In Progress", complete: "85%" },
          { id: "WO-002", product: "Gadget B", qty: 200, status: "Scheduled", complete: "0%" },
          { id: "WO-003", product: "Component X", qty: 1000, status: "Completed", complete: "100%" },
        ].map((wo) => (
          <Card key={wo.id} className="hover:bg-muted/50 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{wo.id} - {wo.product}</p>
                  <p className="text-sm text-muted-foreground">Qty: {wo.qty} units</p>
                </div>
                <div className="text-right">
                  <Badge>{wo.status}</Badge>
                  <p className="text-sm mt-2">{wo.complete} Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
