import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ChurnRiskAnalysis() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Churn Risk Analysis</h1>
        <p className="text-muted-foreground mt-1">Customer churn prediction and prevention</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3">
          {[
            { customer: "Acme Corp", risk: "High", score: 78, action: "Contact manager" },
            { customer: "Global Inc", risk: "Medium", score: 52, action: "Review contract" },
            { customer: "TechStart", risk: "Low", score: 23, action: "Monitor" },
          ].map((item) => (
            <div key={item.customer} className="p-3 border rounded">
              <p className="font-semibold">{item.customer}</p>
              <p className="text-sm text-muted-foreground">Risk Score: {item.score}</p>
              <Badge className={item.risk === "High" ? "mt-2 bg-red-100 text-red-800" : item.risk === "Medium" ? "mt-2 bg-amber-100 text-amber-800" : "mt-2 bg-green-100 text-green-800"}>{item.risk} Risk</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
