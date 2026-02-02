import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function WorkflowExecution() {
  const execData = [{ month: "Jan", executions: 120 }, { month: "Feb", executions: 145 }];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workflow Execution History</h1>
        <p className="text-muted-foreground mt-1">Monitor workflow performance and logs</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Executions</p><p className="text-3xl font-bold mt-1">265</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Success Rate</p><p className="text-3xl font-bold mt-1">98.5%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Avg Duration</p><p className="text-3xl font-bold mt-1">2.3s</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Execution Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={execData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="executions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
