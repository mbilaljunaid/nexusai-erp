import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function TimeAttendance() {
  const [viewType, setViewType] = useState("entries");
  const { data: entries = [] } = useQuery<any[]>({ queryKey: ["/api/time/entries"] });
  const { data: attendance = [] } = useQuery<any[]>({ queryKey: ["/api/time/attendance"] });

  const presentCount = attendance.filter((a: any) => a.status === "present").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Time & Attendance</h1>
        <p className="text-muted-foreground mt-2">Track employee time and attendance</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Present Today</p>
              <p className="text-3xl font-bold">{presentCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant={viewType === "entries" ? "default" : "outline"} onClick={() => setViewType("entries")} data-testid="button-view-entries">
          <Clock className="h-4 w-4 mr-2" />
          Time Entries ({entries.length})
        </Button>
        <Button variant={viewType === "attendance" ? "default" : "outline"} onClick={() => setViewType("attendance")} data-testid="button-view-attendance">
          <CheckCircle className="h-4 w-4 mr-2" />
          Attendance ({attendance.length})
        </Button>
      </div>

      {viewType === "entries" && (
        <div className="space-y-3">
          {entries.map((entry: any) => (
            <Card key={entry.id} data-testid={`card-entry-${entry.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{entry.employeeId}</h4>
                    <p className="text-sm text-muted-foreground">{new Date(entry.entryDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{entry.hoursWorked}h</p>
                    <Badge variant="outline">{entry.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewType === "attendance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attendance.map((att: any) => (
            <Card key={att.id} data-testid={`card-attendance-${att.id}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{att.employeeId}</span>
                  <Badge variant={att.status === "present" ? "default" : "outline"}>{att.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{att.reason}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
