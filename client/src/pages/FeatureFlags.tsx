import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FeatureFlags() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Feature Flags</h1>
        <p className="text-muted-foreground mt-1">Control feature rollouts and experiments</p>
      </div>
      <div className="grid gap-4">
        {[
          { flag: "New Dashboard", status: "Enabled", rollout: "100%" },
          { flag: "AI Predictions", status: "Enabled", rollout: "50%" },
        ].map((flag) => (
          <Card key={flag.flag}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{flag.flag}</h3>
              <p className="text-sm text-muted-foreground">Rollout: {flag.rollout}</p>
              <Badge className="mt-2 bg-green-100 text-green-800">{flag.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
