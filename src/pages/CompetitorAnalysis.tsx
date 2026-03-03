import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function CompetitorAnalysis() {
  return (
    <StandardPage
      title="Competiis</h1>
        <p className="text-muted-foreground mt-1">Market intelligence and competitive insights</p>
      </div>
      <div className="grid gap-4">
        {[
          { competitor: "Competitor A", marketShare: "28%", trend: "↑" },
          { competitor: "Competitor B", marketShare: "22%", trend: "↓" },
        ].map((c) => (
          <Card key={c.competitor}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{c.competitor}</h3>
              <p className="text-sm text-muted-foreground">Market Share: {c.marketShare} {c.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
