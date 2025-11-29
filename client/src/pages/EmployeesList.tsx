import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function EmployeesList() {
  const { data: employees = [] } = useQuery<any[]>({ queryKey: ["/api/hr/employees"] });

  const activeCount = employees.filter((e: any) => e.status === "active").length;
  const totalCount = employees.length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="w-8 h-8" />
          Employee Directory
        </h1>
        <p className="text-muted-foreground">Manage your workforce</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Employees</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Active</p>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {employees.map((emp: any) => (
              <div key={emp.id} className="flex items-center justify-between p-3 border rounded hover-elevate">
                <div>
                  <p className="font-semibold">{emp.firstName} {emp.lastName}</p>
                  <p className="text-sm text-muted-foreground">{emp.department} • {emp.designation}</p>
                </div>
                <Badge variant={emp.status === "active" ? "default" : "secondary"}>{emp.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
