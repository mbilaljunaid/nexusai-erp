import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuditLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Track system activities and changes</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activities</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { action: "User login", user: "Alice", time: "10:30 AM" },
            { action: "Record updated", user: "Bob", time: "10:15 AM" },
          ].map((log, idx) => (
            <div key={idx} className="p-2 border rounded text-sm flex justify-between">
              <span>{log.action} by {log.user}</span>
              <span className="text-muted-foreground">{log.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
