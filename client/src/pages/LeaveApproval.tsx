import { StandardDashboard } from "@/components/ui/StandardDashboard";
import { DashboardWidget } from "@/components/ui/DashboardWidget";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck } from "lucide-react";

export default function LeaveApproval() {
  return (
    <StandardDashboard
      header={{
        title: "Leave Approval",
        description: "Enterprise module loaded"
      }}
    >
      <div className="grid gap-4 md:grid-cols-1">
        <DashboardWidget
          title="Module Status"
          type="metric"
          icon={CalendarCheck}
          value={<Badge variant="default" className="text-base px-4 py-1">Ready</Badge>}
          description="Module active and operational"
        />
      </div>
    </StandardDashboard>
  );
}
