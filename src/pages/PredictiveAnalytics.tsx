import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Brain, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function PredictiveAnalytics() {
  const { toast } = useToast();

  const { data: forecast, isLoading } = useQuery({
    queryKey: ["/api/hr/predictive/attrition"],
    queryFn: () => fetch("/api/hr/predictive/attrition").then(r => r.json()),
  });

  const trainMutation = useMutation({
    mutationFn: () => fetch("/api/hr/predictive/train", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kpiCode: "HR_ATTRITION_VOL" })
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/predictive/attrition"] });
      toast({ title: "HR Attrition Model Trained successfully" });
    },
  });

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const { currentRate, predictedRate, riskLevel, topdrivers } = forecast || {};

  // Placeholder for formMetadata, as it's used by Breadcrumb but not defined in the original snippet.
  // In a real application, this would likely come from a hook or prop.
  const formMetadata = {
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "HR", href: "/hr" },
      { label: "Predictive Analytics", href: "/hr/predictive" },
    ]
  };

  return (
    <StandardPage
      title="Workforce Predictions"
      description="AI-driven insights for attrition and headcount planning (Tier-1)"
    >
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
        <Button onClick={() => trainMutation.mutate()} disabled={trainMutation.isPending}>
          {trainMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Retrain Model
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attrition Risk Card */}
        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Attrition Forecast (Next Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{predictedRate?.toFixed(1)}%</span>
              <span className={predictedRate > currentRate ? "text-red-500 mb-1" : "text-green-500 mb-1"}>
                vs {currentRate?.toFixed(1)}% current
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Risk Level:</span>
              <Badge variant={riskLevel === "HIGH" ? "destructive" : "secondary"}>
                {riskLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Top Drivers */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Top Risk Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {topdrivers?.map((driver: string, idx: number) => (
                <div key={idx} className="p-3 bg-muted/50 rounded-lg border text-sm font-medium flex items-center justify-center text-center h-24">
                  {driver}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            The attrition prediction model uses a linear regression analysis based on historical snapshots from the last 90 days.
            It correlates voluntary turnover with variables such as compensation ratio, commute time, and manager effectiveness score.
            Retraining the model incorporates the latest daily snapshots into the dataset.
          </p>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
