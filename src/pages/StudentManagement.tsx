// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search } from "lucide-react";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { StandardPage } from "@/components/layout/StandardPage";

export default function StudentManagement() {
  // Mock data for now
  const [students] = useState([
    { id: "STU001", name: "Rajesh Kumar", email: "rajesh@school.edu", status: "ACTIVE", program: "B.Tech CS" },
    { id: "STU002", name: "Priya Singh", email: "priya@school.edu", status: "ACTIVE", program: "B.Tech ECE" },
    { id: "STU003", name: "Arjun Patel", email: "arjun@school.edu", status: "INACTIVE", program: "B.Tech ME" },
  ]);

  const columns: Column<any>[] = [
    {
      accessorKey: "id",
      header: "Student ID",
      cell: (item) => <span className="font-mono text-xs">{item.id}</span>
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: (item) => (
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-xs text-muted-foreground">{item.email}</div>
        </div>
      )
    },
    {
      accessorKey: "program",
      header: "Program",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (item) => (
        <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>
          {item.status}
        </Badge>
      )
    }
  ];

  return (
    <StandardPage
      title="Student Management"
      subtitle="Manage student profiles and enrollment"
      actions={
        <Button data-testid="button-add-student">
          <Plus className="h-4 w-4 mr-2" /> Add Student
        </Button>
      }
    >
      <StandardTable
        data={students}
        columns={columns}
        filterColumn="name"
        filterPlaceholder="Search students..."
      />
    </StandardPage>
  );
}
