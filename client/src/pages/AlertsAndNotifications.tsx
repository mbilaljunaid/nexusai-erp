import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function AlertsAndNotifications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const { data: alerts = [] } = useQuery<any[]>({ queryKey: ["/api/alerts"] });
  const formMetadata = getFormMetadata("alertsNotifications");

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      <FormSearchWithMetadata formMetadata={formMetadata} value={searchQuery} onChange={setSearchQuery} data={alerts} onFilter={setFiltered} />
      
      <div>
        <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
        <p className="text-muted-foreground mt-1">Configure system alerts and notifications</p>
      </div>
      <div className="grid gap-4">
        {[
          { alert: "High CPU Usage", threshold: ">80%", enabled: true },
          { alert: "Low Disk Space", threshold: "<10%", enabled: true },
        ].map((a) => (
          <Card key={a.alert}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{a.alert}</h3>
              <p className="text-sm text-muted-foreground">Threshold: {a.threshold}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
