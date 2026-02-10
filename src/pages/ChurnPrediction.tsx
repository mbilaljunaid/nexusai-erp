import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, Sparkles } from "lucide-react";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function ChurnPrediction() {
  const { open, sendMessage } = useNexusAI();
  const { data: predictions = [] } = useQuery<any[]>({ queryKey: ["/api/analytics/churn-prediction"], queryFn: () => fetch("/api/analytics/churn-prediction").then(r => r.json()).catch(() => []) });

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingDown className="h-8 w-8" />
            Churn Prediction
          </h1>
          <p className="text-muted-foreground mt-2">Identify at-risk customers and take preventive action (Converged)</p>
        </div>
        <Button
          onClick={() => {
            open();
            sendMessage("Analyze the current churn risk across all segments and identify the top 3 critical accounts needing immediate attention.");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-lg"
        >
          <Sparkles className="h-4 w-4" />
          NexusAI Churn Deep Dive
        </Button>
      </div>

      <div className="grid gap-4">
        {predictions.map((pred: any) => (
          <Card key={pred.id} className="hover-elevate" data-testid={`prediction-${pred.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{pred.customerId}</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-indigo-600 hover:bg-indigo-50"
                    onClick={() => {
                      open();
                      sendMessage(`Analyze churn risk factors for customer ${pred.customerId}. Current risk score is ${pred.riskScore}%. Provide a detailed retention plan.`);
                    }}
                    title="Analyze with NexusAI"
                  >
                    <Sparkles className="h-3 w-3" />
                  </Button>
                </div>
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
                <Progress value={pred.riskScore} className="h-2" indicatorClassName="bg-red-500" />
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
