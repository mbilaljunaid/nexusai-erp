import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function PredictiveLeadScoring() {
  return (
    <StandardPage
      title="Predictcoring"
      description="ML-based lead quality prediction"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Avg Score</p><p className="text-3xl font-bold mt-1">72.4</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">High Quality</p><p className="text-3xl font-bold mt-1">156</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Conversion Rate</p><p className="text-3xl font-bold mt-1">32%</p></CardContent></Card>
      </div>
    </StandardPage>
  );
}
