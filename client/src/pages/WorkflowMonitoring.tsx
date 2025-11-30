import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertCircle } from "lucide-react";

export default function WorkflowMonitoring() {
  const { data: executions = [] } = useQuery({
    queryKey: ["/api/workflow-executions"],
    queryFn: () => fetch("/api/workflow-executions").then(r => r.json()).catch(() => [
      { id: "we1", workflow: "Auto-assign leads", status: "success", executionTime: "145ms", records: 42, timestamp: "Nov 30, 10:15 AM" },
      { id: "we2", workflow: "Send approval notification", status: "success", executionTime: "234ms", records: 18, timestamp: "Nov 30, 10:10 AM" },
      { id: "we3", workflow: "Create task on ticket", status: "failed", executionTime: "5023ms", records: 1, timestamp: "Nov 30, 09:45 AM" },
    ]),
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Workflow Monitoring
        </h1>
        <p className="text-muted-foreground mt-2">Monitor workflow executions and performance</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Executions</p>
            <p className="text-2xl font-bold">12,547</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold text-green-600">99.2%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg. Time</p>
            <p className="text-2xl font-bold">234ms</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Failed Today</p>
            <p className="text-2xl font-bold text-red-600">3</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recent Executions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {executions.map((exec) => (
            <div key={exec.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`execution-${exec.id}`}>
              <div className="flex-1">
                <p className="font-medium text-sm">{exec.workflow}</p>
                <p className="text-xs text-muted-foreground">Execution time: {exec.executionTime} • {exec.records} records processed • {exec.timestamp}</p>
              </div>
              <Badge variant={exec.status === "success" ? "default" : "destructive"}>{exec.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
