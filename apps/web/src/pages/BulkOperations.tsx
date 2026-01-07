import { Card, CardContent } from "@/components/ui/card";

export default function BulkOperations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Operations</h1>
        <p className="text-muted-foreground mt-1">Mass update and bulk processing</p>
      </div>
      <div className="grid gap-4">
        {[
          { op: "Bulk Email Send", status: "Queued", records: "1,200" },
          { op: "Bulk Status Update", status: "Completed", records: "850" },
        ].map((b) => (
          <Card key={b.op}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{b.op}</h3>
              <p className="text-sm text-muted-foreground">{b.records} records • {b.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
