import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { FormDialog } from "@/components/FormDialog";
import { Users, Briefcase } from "lucide-react";

export default function HRModule() {
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const { data: employees = [] } = useQuery<any[]>({ queryKey: ["/api/hr/employees"], retry: false });
  const employeeFormMetadata = getFormMetadata("employee");

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb items={employeeFormMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR Module</h1>
          <p className="text-muted-foreground">Manage recruitment, employees, and training programs</p>
        </div>
        <SmartAddButton formMetadata={employeeFormMetadata} onClick={() => setShowEmployeeForm(true)} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold mt-1">45</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-2xl font-bold mt-1">5</p>
              </div>
              <Briefcase className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Active Candidates</p>
              <p className="text-2xl font-bold mt-1">23</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Training Programs</p>
              <p className="text-2xl font-bold mt-1">8</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <FormSearchWithMetadata
            formMetadata={employeeFormMetadata}
            value={searchQuery}
            onChange={setSearchQuery}
            data={employees}
            onFilter={setFilteredEmployees}
          />
        </div>
        
        <div className="space-y-2">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee: any, idx: number) => (
              <Card key={employee.id || idx} className="hover-elevate cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                      <p className="text-xs text-muted-foreground">{employee.department} - {employee.role}</p>
                    </div>
                    <Badge variant="secondary">{employee.department}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card><CardContent className="p-4"><p className="text-muted-foreground">No employees found</p></CardContent></Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Job Postings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Senior Developer</p>
                  <p className="text-sm text-muted-foreground">Engineering</p>
                </div>
                <Badge>7 applications</Badge>
              </div>
            </div>
            <div className="p-3 border rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Product Manager</p>
                  <p className="text-sm text-muted-foreground">Product</p>
                </div>
                <Badge>12 applications</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Training</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded">
              <p className="font-medium text-sm">Leadership Development</p>
              <p className="text-xs text-muted-foreground mt-1">Start: Jan 15, 2024</p>
            </div>
            <div className="p-3 border rounded">
              <p className="font-medium text-sm">Technical Skills Workshop</p>
              <p className="text-xs text-muted-foreground mt-1">Start: Jan 22, 2024</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
