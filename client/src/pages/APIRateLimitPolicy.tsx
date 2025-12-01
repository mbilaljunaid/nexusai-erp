import { Card, CardContent } from "@/components/ui/card";

export default function APIRateLimitPolicy() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Rate Limit Policy</h1>
        <p className="text-muted-foreground mt-1">Configure API rate limits per tier</p>
      </div>
      <div className="grid gap-4">
        {[
          { tier: "Free", rpm: "100", rph: "1000" }
          { tier: "Pro", rpm: "1000", rph: "10000" }
        ].map((t) => (
          <Card key={t.tier}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{t.tier}</h3>
              <p className="text-sm text-muted-foreground">{t.rpm} req/min • {t.rph} req/hour</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
