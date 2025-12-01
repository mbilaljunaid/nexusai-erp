import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown } from "lucide-react";

export default function ChurnPrediction() {
  const { data: predictions = [] } = useQuery({ queryKey: ["/api/analytics/churn-prediction"], queryFn: () => fetch("/api/analytics/churn-prediction").then(r => r.json()).catch(() => []) });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingDown className="h-8 w-8" />
          Churn Prediction
        </h1>
        <p className="text-muted-foreground mt-2">Identify at-risk customers and take preventive action</p>
      </div>

      <div className="grid gap-4">
        {predictions.map((pred: any) => (
          <Card key={pred.id} className="hover-elevate" data-testid={`prediction-${pred.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{pred.customerId}</CardTitle>
                {pred.riskScore > 70 ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    High Risk
                  </Badge>
                ) : (
                  <Badge variant="secondary">Low Risk</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Risk Score</span>
                  <span className="font-bold">{pred.riskScore}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-red-500 h-full" style={{ width: `${pred.riskScore}%` }} />
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Risk Factors</h4>
                <div className="flex flex-wrap gap-2">
                  {pred.factors?.map((factor: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Recommended Actions</h4>
                <div className="space-y-1">
                  {pred.recommendedActions?.map((action: string, idx: number) => (
                    <div key={idx} className="text-sm text-muted-foreground">• {action}</div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
