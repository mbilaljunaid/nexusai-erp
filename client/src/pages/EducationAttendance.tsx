import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";

export default function EducationAttendance() {
  const attendance = [
    { id: "ATT001", student: "Rajesh Kumar", course: "CSE101", date: "2025-01-21", status: "PRESENT" },
    { id: "ATT002", student: "Priya Singh", course: "CSE101", date: "2025-01-21", status: "ABSENT" },
  ];
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold">Attendance Tracking</h1></div><Button data-testid="button-mark-attendance"><Plus className="h-4 w-4 mr-2" /> Mark Attendance</Button></div>
      <div className="grid gap-4">
        {attendance.map(a => (
          <Card key={a.id} className="hover-elevate" data-testid={`card-attendance-${a.id}`}>
            <CardContent className="pt-6"><div className="flex justify-between items-start"><div><h3 className="font-semibold">{a.student}</h3><p className="text-sm text-muted-foreground">{a.course}</p><p className="text-sm">{a.date}</p></div><Badge variant={a.status === "PRESENT" ? "default" : "secondary"}>{a.status}</Badge></div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
