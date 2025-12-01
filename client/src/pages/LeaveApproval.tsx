import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

export default function LeaveApproval() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Approval Queue</h1>
        <p className="text-muted-foreground mt-1">Approve or reject pending leave requests</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Pending Requests (3)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { emp: "Alice Johnson", type: "Annual Leave", days: 5, from: "Mar 1", to: "Mar 5" }
            { emp: "Bob Smith", type: "Sick Leave", days: 2, from: "Mar 8", to: "Mar 9" }
            { emp: "Carol Davis", type: "Casual Leave", days: 3, from: "Mar 15", to: "Mar 17" }
          ].map((req, idx) => (
            <div key={idx} className="p-3 border rounded">
              <p className="font-semibold">{req.emp} - {req.type}</p>
              <p className="text-sm text-muted-foreground">{req.days} days ({req.from} to {req.to})</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" data-testid={`button-approve-${idx}`}><Check className="h-4 w-4 mr-1" />Approve</Button>
                <Button size="sm" variant="outline" data-testid={`button-reject-${idx}`}><X className="h-4 w-4 mr-1" />Reject</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
