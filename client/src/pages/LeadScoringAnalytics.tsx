import { Card, CardContent } from "@/components/ui/card";

export default function LeadScoringAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lead Scoring Analytics</h1>
        <p className="text-muted-foreground mt-1">AI lead scoring insights and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Lead Score</p>
            <p className="text-3xl font-bold mt-1">62.4</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Model Accuracy</p>
            <p className="text-3xl font-bold mt-1">87.3%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">High-Quality Leads</p>
            <p className="text-3xl font-bold mt-1">42</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
