import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ReportBuilder() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Report Builder</h1>
          <p className="text-muted-foreground mt-1">Create and schedule custom reports</p>
        </div>
        <Button data-testid="button-new-report"><Plus className="h-4 w-4 mr-2" />New Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Monthly Sales Report", type: "Sales", frequency: "Monthly" },
          { name: "Revenue Report", type: "Finance", frequency: "Weekly" },
          { name: "Operations Report", type: "Operations", frequency: "Daily" },
        ].map((rep) => (
          <Card key={rep.name} className="hover:shadow-lg transition cursor-pointer">
            <CardContent className="pt-6">
              <h3 className="font-semibold">{rep.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{rep.type} • {rep.frequency}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
