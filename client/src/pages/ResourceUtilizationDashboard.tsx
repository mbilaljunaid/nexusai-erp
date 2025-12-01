import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export default function ResourceUtilizationDashboard() {
  const resources = [
    { id: "ru1", name: "Alice (Developer)", allocated: "100%", scheduled: "40h", used: "38h", utilization: "95%", status: "optimal" }
    { id: "ru2", name: "Bob (Designer)", allocated: "75%", scheduled: "30h", used: "25h", utilization: "83%", status: "optimal" }
    { id: "ru3", name: "Carol (Manager)", allocated: "50%", scheduled: "20h", used: "18h", utilization: "90%", status: "optimal" }
    { id: "ru4", name: "David (Developer)", allocated: "120%", scheduled: "48h", used: "45h", utilization: "94%", status: "over-allocated" }
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Resource Utilization Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Monitor resource capacity and allocation</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Resources</p>
            <p className="text-2xl font-bold">{resources.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Utilization</p>
            <p className="text-2xl font-bold text-green-600">90.5%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Over-Allocated</p>
            <p className="text-2xl font-bold text-yellow-600">1</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Available Capacity</p>
            <p className="text-2xl font-bold">15%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Resource Allocation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {resources.map((res) => (
            <div key={res.id} className="p-3 border rounded-lg hover-elevate" data-testid={`resource-${res.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{res.name}</h3>
                <Badge variant={res.status === "optimal" ? "default" : "destructive"}>{res.utilization}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Allocated: {res.allocated} • Scheduled: {res.scheduled} • Used: {res.used}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
