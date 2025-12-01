import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SystemLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Logs</h1>
        <p className="text-muted-foreground mt-1">View system event logs and errors</p>
      </div>
      <div className="flex gap-2 mb-4">
        <Input placeholder="Search logs..." data-testid="input-search-logs" className="flex-1" />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Logs</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { level: "INFO", msg: "System started", time: "10:00 AM" }
            { level: "WARN", msg: "High memory usage", time: "10:15 AM" }
          ].map((log, idx) => (
            <div key={idx} className="p-2 border rounded font-mono text-xs flex justify-between">
              <span>{log.level}: {log.msg}</span>
              <span className="text-muted-foreground">{log.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
