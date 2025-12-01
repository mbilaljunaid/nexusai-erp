import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function APILogs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Logs</h1>
        <p className="text-muted-foreground mt-1">View API request and response logs</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent API Calls</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { endpoint: "GET /api/leads", status: 200, time: "10ms" }
            { endpoint: "POST /api/deals", status: 201, time: "45ms" }
          ].map((log, idx) => (
            <div key={idx} className="p-2 border rounded font-mono text-sm flex justify-between">
              <span>{log.endpoint}</span>
              <span>{log.status} ({log.time})</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
