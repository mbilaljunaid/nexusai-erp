import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone } from "lucide-react";

export default function EmployeeDirectory() {
  const { data: employees = [] } = useQuery({ queryKey: ["/api/employees"] });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employee Directory</h1>
          <p className="text-muted-foreground mt-1">Find and manage employee information</p>
        </div>
        <Button data-testid="button-new-employee"><Plus className="h-4 w-4 mr-2" />Add Employee</Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search employees..." className="pl-10" data-testid="input-search" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: "Alice Johnson", role: "VP Sales", dept: "Sales", email: "alice@company.com", phone: "(555) 111-1111" },
          { name: "Bob Smith", role: "Engineer", dept: "Engineering", email: "bob@company.com", phone: "(555) 222-2222" },
          { name: "Carol Davis", role: "HR Manager", dept: "HR", email: "carol@company.com", phone: "(555) 333-3333" },
          { name: "David Wilson", role: "Accountant", dept: "Finance", email: "david@company.com", phone: "(555) 444-4444" },
          { name: "Eve Martinez", role: "Manager", dept: "Operations", email: "eve@company.com", phone: "(555) 555-5555" },
          { name: "Frank Brown", role: "Analyst", dept: "Analytics", email: "frank@company.com", phone: "(555) 666-6666" },
        ].map((emp) => (
          <Card key={emp.name} className="hover:shadow-lg transition">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg">{emp.name}</h3>
              <p className="text-sm text-muted-foreground">{emp.role}</p>
              <p className="text-xs text-muted-foreground">{emp.dept}</p>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{emp.email}</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{emp.phone}</div>
              </div>
              <Badge className="mt-3">Active</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
