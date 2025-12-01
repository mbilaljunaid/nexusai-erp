import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const { data: logs = [] } = useQuery<any[]>({ queryKey: ["/api/audit-logs"] });
  const formMetadata = getFormMetadata("auditLogs");

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      <FormSearchWithMetadata formMetadata={formMetadata} value={searchQuery} onChange={setSearchQuery} data={logs} onFilter={setFiltered} />
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Track system activities and changes</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activities</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { action: "User login", user: "Alice", time: "10:30 AM" }
            { action: "Record updated", user: "Bob", time: "10:15 AM" }
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
