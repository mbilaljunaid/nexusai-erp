import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function KPIDashboard() {
  const kpis = [
    { id: "kpi1", name: "Revenue", value: "$2.5M", target: "$3.0M", status: "warning", trend: "-5%" },
    { id: "kpi2", name: "Customer Acquisition", value: "125", target: "150", status: "on-track", trend: "+12%" },
    { id: "kpi3", name: "Project Delivery", value: "92%", target: "95%", status: "critical", trend: "-3%" },
    { id: "kpi4", name: "Employee Productivity", value: "88%", target: "90%", status: "on-track", trend: "+2%" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          KPI Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Monitor key performance indicators</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="hover-elevate" data-testid={`kpi-${kpi.id}`}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">{kpi.name}</h3>
                <Badge variant={kpi.status === "on-track" ? "default" : kpi.status === "warning" ? "secondary" : "destructive"}>
                  {kpi.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">Target: {kpi.target}</p>
                <p className={`text-sm font-semibold ${kpi.trend.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                  {kpi.trend}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
