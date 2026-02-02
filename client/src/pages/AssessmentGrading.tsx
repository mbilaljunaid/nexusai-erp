import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare } from "lucide-react";

export default function AssessmentGrading() {
  const exams = [
    { id: "EXM001", name: "Midterm - Data Structures", course: "CSE101", date: "2025-02-10", status: "SCHEDULED" },
    { id: "EXM002", name: "Quiz 1 - Web Dev", course: "CSE102", date: "2025-02-05", status: "COMPLETED" },
  ];
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold">Assessment & Grading</h1></div><Button data-testid="button-create-exam"><Plus className="h-4 w-4 mr-2" /> Create Exam</Button></div>
      <div className="grid gap-4">
        {exams.map(e => (
          <Card key={e.id} className="hover-elevate" data-testid={`card-exam-${e.id}`}>
            <CardContent className="pt-6"><div className="flex justify-between items-start"><div><h3 className="font-semibold">{e.name}</h3><p className="text-sm text-muted-foreground">{e.course}</p><p className="text-sm">{e.date}</p></div><Badge variant={e.status === "COMPLETED" ? "default" : "secondary"}>{e.status}</Badge></div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
