import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { Users, Briefcase } from "lucide-react";

export default function HRModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const { data: employees = [] } = useQuery<any[]>({ queryKey: ["/api/hr/employees"], retry: false });
  const formMetadata = getFormMetadata("employee");

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR Module</h1>
          <p className="text-muted-foreground">Manage recruitment, employees, and training programs</p>
        </div>
        <SmartAddButton formMetadata={formMetadata} formId="employee" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Employees</p><p className="text-2xl font-bold mt-1">45</p></div><Users className="w-8 h-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Open Positions</p><p className="text-2xl font-bold mt-1">5</p></div><Briefcase className="w-8 h-8 text-orange-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">Active Candidates</p><p className="text-2xl font-bold mt-1">23</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div><p className="text-sm text-muted-foreground">Training Programs</p><p className="text-2xl font-bold mt-1">8</p></div></CardContent></Card>
      </div>

      <FormSearchWithMetadata
        formMetadata={formMetadata}
        value={searchQuery}
        onChange={setSearchQuery}
        data={employees}
        onFilter={setFilteredEmployees}
      />

      <div className="grid gap-4">
        {filteredEmployees.length > 0 ? filteredEmployees.map((emp: any) => (
          <Card key={emp.id} className="hover:bg-muted/50 transition">
            <CardContent className="pt-6">
              <div className="flex justify-between"><div><p className="font-semibold">{emp.name}</p><p className="text-sm text-muted-foreground">{emp.role}</p></div><Badge>{emp.status}</Badge></div>
            </CardContent>
          </Card>
        )) : <p className="text-muted-foreground text-center py-4">No employees found</p>}
      </div>

