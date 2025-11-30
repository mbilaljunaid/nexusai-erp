import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus } from "lucide-react";

export default function FacultyManagement() {
  const faculty = [
    { id: "FAC001", name: "Dr. Sharma", dept: "Computer Science", courses: 3, status: "ACTIVE" },
    { id: "FAC002", name: "Prof. Gupta", dept: "Electronics", courses: 2, status: "ACTIVE" },
  ];
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold">Faculty Management</h1></div><Button data-testid="button-add-faculty"><Plus className="h-4 w-4 mr-2" /> Add Faculty</Button></div>
      <div className="grid gap-4">
        {faculty.map(f => (
          <Card key={f.id} className="hover-elevate" data-testid={`card-faculty-${f.id}`}>
            <CardContent className="pt-6"><div className="flex justify-between items-start"><div><h3 className="font-semibold">{f.name}</h3><p className="text-sm text-muted-foreground">{f.dept}</p><p className="text-sm">{f.courses} Courses</p></div><Badge>{f.status}</Badge></div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
