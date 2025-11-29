import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function MRPDashboard() {
  const demandData = [
    { product: "Widget A", demand: 500, capacity: 600 },
    { product: "Gadget B", demand: 200, capacity: 300 },
    { product: "Component X", demand: 1000, capacity: 1200 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">MRP Planning</h1>
        <p className="text-muted-foreground mt-1">Material requirements planning and capacity analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Planned Orders</p>
            <p className="text-3xl font-bold mt-1">24</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Demand</p>
            <p className="text-3xl font-bold mt-1">1.7K units</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Capacity Utilization</p>
            <p className="text-3xl font-bold mt-1">82%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Demand vs Capacity</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demandData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="demand" fill="#ef4444" name="Demand" />
              <Bar dataKey="capacity" fill="#3b82f6" name="Capacity" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
