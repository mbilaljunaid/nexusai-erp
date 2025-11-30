import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus } from "lucide-react";

export default function LeaveManagement() {
  const leaves = [
    { id: "l1", employee: "Alice Johnson", type: "Vacation", start: "2025-12-01", end: "2025-12-05", duration: "5 days", status: "approved" },
    { id: "l2", employee: "Bob Smith", type: "Sick", start: "2025-11-30", end: "2025-11-30", duration: "1 day", status: "pending" },
    { id: "l3", employee: "Carol Davis", type: "Casual", start: "2025-12-10", end: "2025-12-10", duration: "1 day", status: "approved" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Leave Management
        </h1>
        <p className="text-muted-foreground mt-2">Manage employee leave requests</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-request-leave">
            <Plus className="h-4 w-4" />
            Request Leave
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Requests</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Approved</p><p className="text-2xl font-bold text-green-600">2</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-600">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Days Used</p><p className="text-2xl font-bold">7</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Leave Requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {leaves.map((leave) => (
            <div key={leave.id} className="p-3 border rounded-lg hover-elevate" data-testid={`leave-${leave.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{leave.employee}</h3>
                <Badge variant={leave.status === "approved" ? "default" : "secondary"}>{leave.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Type: {leave.type} • {leave.start} to {leave.end} ({leave.duration})</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
