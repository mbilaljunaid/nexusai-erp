import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus } from "lucide-react";

export default function TimesheetManagement() {
  const timesheets = [
    { id: "ts1", week: "Nov 24-30", user: "Alice", hours: 40, project: "Project A", status: "submitted", approval: "pending" },
    { id: "ts2", week: "Nov 17-23", user: "Bob", hours: 38, project: "Project B", status: "approved", approval: "approved" },
    { id: "ts3", week: "Nov 10-16", user: "Carol", hours: 42, project: "Project C", status: "submitted", approval: "pending" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8" />
          Timesheet Management
        </h1>
        <p className="text-muted-foreground mt-2">Track and manage project timesheets</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-submit-timesheet">
            <Plus className="h-4 w-4" />
            Submit Timesheet
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold">120</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Billable Hours</p>
            <p className="text-2xl font-bold text-green-600">115</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-600">2</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">1</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Timesheets</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {timesheets.map((ts) => (
            <div key={ts.id} className="p-3 border rounded-lg hover-elevate" data-testid={`timesheet-${ts.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{ts.week}</h3>
                <div className="flex gap-2">
                  <Badge variant={ts.approval === "approved" ? "default" : "secondary"}>{ts.approval}</Badge>
                  <Badge variant="outline">{ts.status}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">User: {ts.user} • Project: {ts.project} • Hours: {ts.hours}h</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
