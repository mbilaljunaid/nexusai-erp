import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search } from "lucide-react";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";

export default function StudentManagement() {
  // Mock data for now
  const [students] = useState([
    { id: "STU001", name: "Rajesh Kumar", email: "rajesh@school.edu", status: "ACTIVE", program: "B.Tech CS" },
    { id: "STU002", name: "Priya Singh", email: "priya@school.edu", status: "ACTIVE", program: "B.Tech ECE" },
    { id: "STU003", name: "Arjun Patel", email: "arjun@school.edu", status: "INACTIVE", program: "B.Tech ME" },
  ]);

  const columns = [
    {
      id: "id",
      header: "Student ID",
      width: "150px",
      cell: (item: any) => <div className="px-2 h-full flex items-center font-mono text-xs">{item.id}</div>
    },
    {
      id: "name",
      header: "Name",
      width: "250px",
      cell: (item: any) => (
        <div className="px-2 h-full flex flex-col justify-center">
          <div className="font-medium">{item.name}</div>
          <div className="text-xs text-muted-foreground">{item.email}</div>
        </div>
      )
    },
    {
      id: "program",
      header: "Program",
      width: "200px",
      cell: (item: any) => <div className="px-2 h-full flex items-center">{item.program}</div>
    },
    {
      id: "status",
      header: "Status",
      width: "150px",
      cell: (item: any) => (
        <div className="px-2 h-full flex items-center">
          <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>
            {item.status}
          </Badge>
        </div>
      )
    }
  ];

  return (
    <StandardPage
      title="Student Management"
      description="Manage student profiles and enrollment"
      actions={
        <Button data-testid="button-add-student">
          <Plus className="h-4 w-4 mr-2" /> Add Student
        </Button>
      }
    >
      <div className="bg-card w-full rounded-md border shadow-sm">
        <InteractiveSpreadsheet
          data={students}
          columns={columns}
          onChange={() => { }}
          virtualized={true}
          containerHeight="500px"
        />
      </div>
    </StandardPage>
  );
}
