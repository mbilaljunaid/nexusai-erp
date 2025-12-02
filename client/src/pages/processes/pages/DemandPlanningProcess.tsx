import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DemandPlanningProcess() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Demand Planning Process</h1>
        <p className="text-muted-foreground mt-2">Enterprise module loaded</p>
      </div>
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Demand Planning Process</h2>
            <p className="text-sm text-muted-foreground mt-1">Module status: Active</p>
          </div>
          <Badge variant="default">Ready</Badge>
        </div>
      </Card>
    </div>
  );
}
