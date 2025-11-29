import { Card, CardContent } from "@/components/ui/card";

export default function ServiceLevelConfig() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Service Level Configuration</h1>
        <p className="text-muted-foreground mt-1">Configure SLA and service level targets</p>
      </div>
      <div className="grid gap-4">
        {[
          { level: "Premium", response: "1h", resolution: "4h" },
          { level: "Standard", response: "4h", resolution: "24h" },
        ].map((sla) => (
          <Card key={sla.level}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{sla.level}</h3>
              <p className="text-sm text-muted-foreground">Response: {sla.response} • Resolution: {sla.resolution}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
