import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function PurchaseOrder() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
        <p className="text-muted-foreground mt-1">Manage purchase orders and vendor management</p>
      </div>

      <Button data-testid="button-new-po"><Plus className="h-4 w-4 mr-2" />Create Purchase Order</Button>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent POs</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: "PO-2501", vendor: "Supplier Inc", amount: "$12,500", status: "Approved" },
              { id: "PO-2502", vendor: "Parts Co", amount: "$8,200", status: "Pending" },
              { id: "PO-2503", vendor: "Materials Ltd", amount: "$15,800", status: "Received" },
            ].map((po) => (
              <div key={po.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{po.id}</p>
                  <p className="text-sm text-muted-foreground">{po.vendor}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{po.amount}</p>
                  <Badge>{po.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
