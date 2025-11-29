import { Card, CardContent } from "@/components/ui/card";

export default function RecommendationEngine() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Recommendation Engine</h1>
        <p className="text-muted-foreground mt-1">Intelligent suggestions and insights</p>
      </div>
      <div className="grid gap-4">
        {[
          { rec: "Upsell Opportunity", confidence: "87%", potential: "$45K" },
          { rec: "At-Risk Account", confidence: "92%", action: "Engage" },
        ].map((r) => (
          <Card key={r.rec}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{r.rec}</h3>
              <p className="text-sm text-muted-foreground">Confidence: {r.confidence}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
