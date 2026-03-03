import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Brain } from "lucide-react";
export default function BusinessIntelligence() {
  return (
    <StandardPage
      title="Busines" />Business Intelligence</h1><p className="text-muted-foreground">Advanced analytics and insights engine</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Dashboards</p><p className="text-2xl font-bold">42</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Reports</p><p className="text-2xl font-bold">156</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Insights/Day</p><p className="text-2xl font-bold">324</p></CardContent></Card>
      </div>
    </StandardPage>
  );
}
