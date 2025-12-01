import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export default function SupplierPerformance() {
  const suppliers = [
    { id: "sp1", name: "Acme Corp", onTime: "98%", quality: "96%", cost: "92%", rating: "4.9", status: "excellent" }
    { id: "sp2", name: "Global Supplies", onTime: "94%", quality: "89%", cost: "85%", rating: "4.2", status: "good" }
    { id: "sp3", name: "TechVendor Ltd", onTime: "87%", quality: "91%", cost: "78%", rating: "3.9", status: "fair" }
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Supplier Performance
        </h1>
        <p className="text-muted-foreground mt-2">Monitor supplier metrics and ratings</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Suppliers</p>
            <p className="text-2xl font-bold">{suppliers.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg On-Time %</p>
            <p className="text-2xl font-bold text-green-600">93%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Quality %</p>
            <p className="text-2xl font-bold text-green-600">92%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Supplier Scorecard</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="p-3 border rounded-lg hover-elevate" data-testid={`supplier-${supplier.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{supplier.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={supplier.status === "excellent" ? "default" : supplier.status === "good" ? "secondary" : "outline"}>{supplier.rating}★</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">On-Time: {supplier.onTime} • Quality: {supplier.quality} • Cost Competitiveness: {supplier.cost}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
