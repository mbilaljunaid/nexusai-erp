import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, AlertCircle } from "lucide-react";

export default function ManufacturingModule() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manufacturing</h1>
          <p className="text-muted-foreground">Manage BOM, work orders, and production</p>
        </div>
        <Button data-testid="button-create-workorder">
          <Plus className="w-4 h-4 mr-2" />
          New Work Order
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Active Work Orders</p>
              <p className="text-3xl font-bold mt-2">18</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Production Rate</p>
              <p className="text-3xl font-bold mt-2">94%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quality Pass Rate</p>
                <p className="text-2xl font-bold mt-1">98.2%</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">On-Time Delivery</p>
              <p className="text-3xl font-bold mt-2">96%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Work Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { wo: "WO-001", product: "Assembly A", qty: "500", status: "in-progress" }
              { wo: "WO-002", product: "Component B", qty: "1200", status: "in-progress" }
              { wo: "WO-003", product: "Unit C", qty: "300", status: "scheduled" }
            ].map((order) => (
              <div key={order.wo} className="p-3 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{order.wo} - {order.product}</p>
                    <p className="text-xs text-muted-foreground">{order.qty} units</p>
                  </div>
                  <Badge variant={order.status === "in-progress" ? "default" : "outline"}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quality Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { issue: "Component Tolerance", severity: "medium", items: 5 }
              { issue: "Assembly Alignment", severity: "low", items: 2 }
            ].map((q) => (
              <div key={q.issue} className="p-3 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{q.issue}</p>
                    <p className="text-xs text-muted-foreground">{q.items} items affected</p>
                  </div>
                  <Badge variant={q.severity === "medium" ? "default" : "outline"}>
                    {q.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
