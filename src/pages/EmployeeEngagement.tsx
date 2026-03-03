import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Users } from "lucide-react";
export default function EmployeeEngagement() {
  return (
    <StandardPage
      title="Employe" />Employee Engagement</h1><p className="text-muted-foreground">Measure and improve workforce engagement</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Survey Score</p><p className="text-2xl font-bold">7.8/10</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Participation</p><p className="text-2xl font-bold text-green-600">87%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Action Items</p><p className="text-2xl font-bold">24</p></CardContent></Card>
      </div>
    </StandardPage>
  );
}
