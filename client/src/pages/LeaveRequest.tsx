import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function LeaveRequest() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Requests</h1>
          <p className="text-muted-foreground mt-1">Manage and track employee leave requests</p>
        </div>
        <Button data-testid="button-new-request"><Plus className="h-4 w-4 mr-2" />New Request</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Available Days</p>
            <p className="text-3xl font-bold mt-1">15</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Used Days</p>
            <p className="text-3xl font-bold mt-1">5</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending Approvals</p>
            <p className="text-3xl font-bold mt-1">2</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Leave History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { type: "Annual Leave", from: "Jan 15", to: "Jan 20", status: "Approved" },
            { type: "Sick Leave", from: "Feb 10", to: "Feb 12", status: "Approved" },
            { type: "Casual Leave", from: "Mar 1", to: "Mar 3", status: "Pending" },
          ].map((req, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 border rounded">
              <div>
                <p className="font-medium text-sm">{req.type}</p>
                <p className="text-xs text-muted-foreground">{req.from} to {req.to}</p>
              </div>
              <Badge className={req.status === "Approved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>{req.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
