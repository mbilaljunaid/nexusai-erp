import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContextualSearch } from "@/components/ContextualSearch";
import { generateBreadcrumbs, getSearchFields } from "@/lib/pageConfig";

export default function HREmployeesDetail() {
  const [searchFilters, setSearchFilters] = useState<Record<string, string>>({});
  const [employees] = useState([
    { id: 1, name: "Alice Brown", department: "Engineering", status: "active" },
    { id: 2, name: "Bob Wilson", department: "Sales", status: "active" },
    { id: 3, name: "Carol Davis", department: "HR", status: "on_leave" },
  ]);

  const filteredEmployees = employees.filter((emp) => {
    if (searchFilters.name && !emp.name.toLowerCase().includes(searchFilters.name.toLowerCase())) return false;
    if (searchFilters.department && !emp.department.toLowerCase().includes(searchFilters.department.toLowerCase())) return false;
    if (searchFilters.status && emp.status !== searchFilters.status) return false;
    return true;
  });

  const breadcrumbs = generateBreadcrumbs("HR", "Employees");
  const searchFields = getSearchFields("HR");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Employees</h1>
          <p className="text-muted-foreground text-sm">Manage employee records and information</p>
        </div>
        <Button data-testid="button-new-employee">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <ContextualSearch 
        fields={searchFields}
        onSearch={setSearchFilters}
        placeholder="Search employees..."
        testId="search-employees"
      />

      <div className="space-y-2">
        {filteredEmployees.map((emp) => (
          <Card key={emp.id} className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold" data-testid={`text-employee-${emp.id}`}>{emp.name}</p>
                  <p className="text-sm text-muted-foreground">{emp.department}</p>
                </div>
                <Badge variant={emp.status === "active" ? "default" : "secondary"} data-testid={`badge-status-${emp.id}`}>
                  {emp.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
