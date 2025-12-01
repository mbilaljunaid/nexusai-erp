import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle } from "lucide-react";

export default function ProductionSchedulingGantt() {
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["/api/production-schedule"]
    
  });

  const onTime = schedules.filter((s: any) => s.status === "on-track").length;
  const bottlenecks = schedules.filter((s: any) => s.isBottleneck).length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Production Scheduling & APS (Gantt)
        </h1>
        <p className="text-muted-foreground mt-2">Finite capacity scheduling, bottleneck analysis, and what-if scenarios</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Jobs Scheduled</p>
            <p className="text-2xl font-bold">{schedules.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">On Track</p>
            <p className="text-2xl font-bold text-green-600">{onTime}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Bottlenecks</p>
                <p className="text-2xl font-bold">{bottlenecks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">At Risk</p>
            <p className="text-2xl font-bold text-red-600">{schedules.length - onTime}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Production Schedule</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : schedules.length === 0 ? <p className="text-muted-foreground text-center py-4">No schedules</p> : schedules.map((s: any) => (
            <div key={s.id} className="p-3 border rounded hover-elevate" data-testid={`sched-${s.id}`}>
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-sm">{s.workOrderId || "WO"}</p>
                <Badge variant={s.status === "on-track" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">{s.workCenter} • {s.estimatedHours || 0}h</p>
                {s.isBottleneck && <Badge variant="destructive" className="text-xs">Bottleneck</Badge>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
