import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Plus } from "lucide-react";

export default function DataSourceConfiguration() {
  const dataSources = [
    { id: "ds1", name: "ERP System", type: "ERP", status: "active", lastSync: "2025-11-30 06:12 AM", frequency: "Every 1 hour" }
    { id: "ds2", name: "CRM Database", type: "CRM", status: "active", lastSync: "2025-11-30 06:10 AM", frequency: "Every 30 minutes" }
    { id: "ds3", name: "Finance API", type: "API", status: "active", lastSync: "2025-11-30 05:45 AM", frequency: "Every 2 hours" }
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-8 w-8" />
          Data Source Configuration
        </h1>
        <p className="text-muted-foreground mt-2">Manage data connections and sources</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-add-datasource">
            <Plus className="h-4 w-4" />
            Add Data Source
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Sources</p><p className="text-2xl font-bold">{dataSources.length}</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Errors</p><p className="text-2xl font-bold text-red-600">0</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Last Sync</p><p className="text-lg font-bold">2 min ago</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Data Sources</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {dataSources.map((ds) => (
            <div key={ds.id} className="p-3 border rounded-lg hover-elevate" data-testid={`datasource-${ds.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{ds.name}</h3>
                <Badge variant="default">{ds.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Type: {ds.type} • Frequency: {ds.frequency} • Last Sync: {ds.lastSync}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
