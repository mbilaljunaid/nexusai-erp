import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { ContextualSearch } from "@/components/ContextualSearch";

export default function SystemLogs() {
  return (
    <StandardPage title="System Logs" description="View system event logs and errors">
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <ContextualSearch
            placeholder="Search logs..."
            fields={[{ key: "query", label: "Search", type: "text" }]}
            onSearch={() => { }}
            testId="search-logs"
          />
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Logs</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { level: "INFO", msg: "System started", time: "10:00 AM" },
            { level: "WARN", msg: "High memory usage", time: "10:15 AM" },
          ].map((log, idx) => (
            <div key={idx} className="p-2 border rounded font-mono text-xs flex justify-between">
              <span>{log.level}: {log.msg}</span>
              <span className="text-muted-foreground">{log.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </StandardPage>
  );
}
