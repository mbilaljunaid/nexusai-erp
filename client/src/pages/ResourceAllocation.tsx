import { Card, CardContent } from "@/components/ui/card";

export default function ResourceAllocation() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resource Allocation</h1>
        <p className="text-muted-foreground mt-1">Manage system resources and quotas</p>
      </div>
      <div className="grid gap-4">
        {[
          { resource: "Storage", allocated: "100 GB", used: "45 GB" },
          { resource: "API Calls", allocated: "10M/month", used: "7.2M" },
        ].map((r) => (
          <Card key={r.resource}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{r.resource}</h3>
              <p className="text-sm text-muted-foreground">{r.used} of {r.allocated}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
