import { Card, CardContent } from "@/components/ui/card";

export default function CustomerJourneyMap() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Journey Map</h1>
        <p className="text-muted-foreground mt-1">Track customer interactions across channels</p>
      </div>
      <div className="grid gap-4">
        {[
          { stage: "Awareness", count: "850", conversion: "12%" },
          { stage: "Consideration", count: "245", conversion: "28%" },
          { stage: "Decision", count: "85", conversion: "75%" },
        ].map((s) => (
          <Card key={s.stage}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{s.stage}</h3>
              <p className="text-sm text-muted-foreground">{s.count} leads • {s.conversion} conversion</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
