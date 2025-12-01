import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";

export default function CourseManagement() {
  const courses = [
    { id: "CSE101", name: "Data Structures", faculty: "Dr. Sharma", credits: 4, students: 45 }
    { id: "CSE102", name: "Web Development", faculty: "Dr. Sharma", credits: 3, students: 38 }
  ];
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold">Courses & Curriculum</h1></div><Button data-testid="button-add-course"><Plus className="h-4 w-4 mr-2" /> Add Course</Button></div>
      <div className="grid gap-4">
        {courses.map(c => (
          <Card key={c.id} className="hover-elevate" data-testid={`card-course-${c.id}`}>
            <CardContent className="pt-6"><div className="flex justify-between"><div><h3 className="font-semibold">{c.name}</h3><p className="text-sm text-muted-foreground">{c.faculty}</p><p className="text-sm">{c.credits} Credits • {c.students} Students</p></div></div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
