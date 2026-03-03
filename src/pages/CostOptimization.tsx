import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { TrendingDown } from "lucide-react";
export default function CostOptimization() {
  return (
    <StandardPage
      title="Cost Op" />Cost Optimization</h1><p className="text-muted-foreground">Identify and realize cost savings opportunities</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Opportunities</p><p className="text-2xl font-bold">47</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Realized</p><p className="text-2xl font-bold text-green-600">$2.3M</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Pipeline</p><p className="text-2xl font-bold">$1.8M</p></CardContent></Card>
      </div>
    </StandardPage>
  );
}
