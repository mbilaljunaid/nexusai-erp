import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { EmployeeEntryForm } from "@/components/forms/EmployeeEntryForm";

export default function EmployeesDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const employees = [{id: 1, name: "Sarah Johnson", dept: "Engineering", email: "sarah@company.com"}, {id: 2, name: "John Smith", dept: "Sales", email: "john@company.com"}];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/hr">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">Employees</h1>
          <p className="text-muted-foreground text-sm">Search, view, and manage employee records</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
          <Button>+ Add Employee</Button>
        </div>

        <div className="space-y-2">
          {employees.filter((e: any) => e.name.toLowerCase().includes(searchQuery.toLowerCase())).map((e: any) => (
            <Card key={e.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">{e.name}</p><p className="text-sm text-muted-foreground">{e.dept}</p></div><Badge>{e.email}</Badge></div></CardContent></Card>
          ))}
        </div>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">+ Add New Employee</h2>
          <EmployeeEntryForm />
        </div>
      </div>
    </div>
  );
}
