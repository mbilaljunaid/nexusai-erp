import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search } from "lucide-react";

export default function StudentManagement() {
  const [search, setSearch] = useState("");
  const students = [
    { id: "STU001", name: "Rajesh Kumar", email: "rajesh@school.edu", status: "ACTIVE", program: "B.Tech CS" },
    { id: "STU002", name: "Priya Singh", email: "priya@school.edu", status: "ACTIVE", program: "B.Tech ECE" },
    { id: "STU003", name: "Arjun Patel", email: "arjun@school.edu", status: "INACTIVE", program: "B.Tech ME" },
  ];
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Student Management</h1><p className="text-muted-foreground">Manage student profiles and enrollment</p></div>
        <Button data-testid="button-add-student"><Plus className="h-4 w-4 mr-2" /> Add Student</Button>
      </div>
      <div className="flex gap-2"><Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-students" className="flex-1" /></div>
      <div className="grid gap-4">
        {students.map(s => (
          <Card key={s.id} className="hover-elevate" data-testid={`card-student-${s.id}`}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start"><div><h3 className="font-semibold">{s.name}</h3><p className="text-sm text-muted-foreground">{s.email}</p><p className="text-sm">{s.program}</p></div><Badge variant={s.status === "ACTIVE" ? "default" : "secondary"}>{s.status}</Badge></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
