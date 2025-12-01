import { Card, CardContent } from "@/components/ui/card";

export default function BatchOperations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Batch Operations</h1>
        <p className="text-muted-foreground mt-1">Execute bulk operations and jobs</p>
      </div>
      <div className="grid gap-4">
        {[
          { job: "Bulk Update Leads", status: "Completed", records: "5,420" }
          { job: "Batch Email Send", status: "In Progress", records: "1,245" }
        ].map((j) => (
          <Card key={j.job}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{j.job}</h3>
              <p className="text-sm text-muted-foreground">{j.records} records • {j.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
