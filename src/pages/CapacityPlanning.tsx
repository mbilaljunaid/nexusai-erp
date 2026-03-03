import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { BarChart3 } from "lucide-react";
export default function CapacityPlanning() {
  return (
    <StandardPage
      title="Capacit" />Capacity Planning</h1><p className="text-muted-foreground">Optimize resource allocation and planning</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Capacity</p><p className="text-2xl font-bold">2,400h</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Utilization</p><p className="text-2xl font-bold text-green-600">82%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Available</p><p className="text-2xl font-bold">432h</p></CardContent></Card>
      </div>
    </StandardPage>
  );
}
