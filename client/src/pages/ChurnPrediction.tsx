import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown } from "lucide-react";

export default function ChurnPrediction() {
  const { data: predictions = [] } = useQuery({ queryKey: ["/api/analytics/churn-prediction"],  idx: number) => (
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
