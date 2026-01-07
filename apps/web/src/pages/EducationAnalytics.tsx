import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";

export default function EducationAnalytics() {
  const metrics = [
    { label: "Total Students", value: "2,450", trend: "+5%" },
    { label: "Course Enrollment", value: "1,890", trend: "+12%" },
    { label: "Average Grade", value: "7.8", trend: "+0.3" },
    { label: "Fee Collection", value: "₹3.67 Cr", trend: "+8%" },
  ];
  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-3xl font-bold">Analytics & BI</h1><p className="text-muted-foreground">Education platform metrics and insights</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <Card key={i} className="hover-elevate" data-testid={`card-metric-${m.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">{m.label}</p><h3 className="text-2xl font-bold mt-2">{m.value}</h3><p className="text-xs text-green-600 mt-1">{m.trend}</p></div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
