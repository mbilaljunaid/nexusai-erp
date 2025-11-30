import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, CheckCircle, AlertCircle } from "lucide-react";

export default function IntegrationStatus() {
  const integrations = [
    { id: "i1", name: "Salesforce CRM", type: "Real-time", status: "connected", lastSync: "Nov 30, 10:15 AM", records: 5432 },
    { id: "i2", name: "QuickBooks", type: "Scheduled", status: "connected", lastSync: "Nov 30, 09:00 AM", records: 2156 },
    { id: "i3", name: "Stripe Payments", type: "Real-time", status: "disconnected", lastSync: "Nov 30, 08:30 AM", records: 0 },
    { id: "i4", name: "Google Workspace", type: "Batch", status: "connected", lastSync: "Nov 29, 06:00 PM", records: 8934 },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GitBranch className="h-8 w-8" />
          Integration Status
        </h1>
        <p className="text-muted-foreground mt-2">Monitor external system integrations</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Integrations</p>
            <p className="text-2xl font-bold">{integrations.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Connected</p>
            <p className="text-2xl font-bold text-green-600">{integrations.filter(i => i.status === "connected").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Disconnected</p>
            <p className="text-2xl font-bold text-red-600">{integrations.filter(i => i.status === "disconnected").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Records</p>
            <p className="text-2xl font-bold">{integrations.reduce((sum, i) => sum + i.records, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Integration Connections</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {integrations.map((integration) => (
            <div key={integration.id} className="p-3 border rounded-lg hover-elevate" data-testid={`integration-${integration.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  {integration.status === "connected" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  {integration.name}
                </h3>
                <Badge variant={integration.status === "connected" ? "default" : "destructive"}>{integration.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Type: {integration.type} • Last sync: {integration.lastSync} • Records: {integration.records}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
