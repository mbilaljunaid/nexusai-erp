import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search } from "lucide-react";
import { StandardTable } from "@/components/ui/StandardTable";
import { StandardPage } from "@/components/ui/StandardPage";
import { ColumnDef } from "@tanstack/react-table";

export default function StudentManagement() {
  // Mock data for now
  const [students] = useState([
    { id: "STU001", name: "Rajesh Kumar", email: "rajesh@school.edu", status: "ACTIVE", program: "B.Tech CS" },
    { id: "STU002", name: "Priya Singh", email: "priya@school.edu", status: "ACTIVE", program: "B.Tech ECE" },
    { id: "STU003", name: "Arjun Patel", email: "arjun@school.edu", status: "INACTIVE", program: "B.Tech ME" },
  ]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "Student ID",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
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
      cell: ({ row }) => (
        <Badge variant={row.original.status === "ACTIVE" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
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
      <StandardTable
        data={students}
        columns={columns}
        filterColumn="name"
        filterPlaceholder="Search students..."
      />
    </StandardPage>
  );
}
