import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { FormDialog } from "@/components/FormDialog";
import { Mail, Phone } from "lucide-react";

export default function EmployeeDirectory() {
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const { data: employees = [] } = useQuery<any[]>({ queryKey: ["/api/hr/employees"] });
  const employeeFormMetadata = getFormMetadata("employee");

  const handleFormClose = () => setShowEmployeeForm(false);
  return (
    <div className="space-y-6">
      <Breadcrumb items={employeeFormMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employee Directory</h1>
          <p className="text-muted-foreground mt-1">Find and manage employee information</p>
              </div>

      <FormDialog
        isOpen={showEmployeeForm}
        onOpenChange={setShowEmployeeForm}
        formId="employeeForm"
        formTitle="Add Employee"
        formDescription="Create a new employee record"
      />
    </div>
  );
}
        <SmartAddButton formMetadata={employeeFormMetadata} onClick={() => setShowEmployeeForm(true)} />
            </div>

      <FormDialog
        isOpen={showEmployeeForm}
        onOpenChange={setShowEmployeeForm}
        formId="employeeForm"
        formTitle="Add Employee"
        formDescription="Create a new employee record"
      />
    </div>
  );
}

      <FormSearchWithMetadata
        formMetadata={employeeFormMetadata}
        value={searchQuery}
        onChange={setSearchQuery}
        data={employees}
        onFilter={setFilteredEmployees}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp: any) => (
            <Card key={emp.id} className="hover:shadow-lg transition">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg">{emp.name}</h3>
                <p className="text-sm text-muted-foreground">{emp.role}</p>
                <p className="text-xs text-muted-foreground">{emp.department}</p>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{emp.email || 'N/A'}      </div>

      <FormDialog
        isOpen={showEmployeeForm}
        onOpenChange={setShowEmployeeForm}
        formId="employeeForm"
        formTitle="Add Employee"
        formDescription="Create a new employee record"
      />
    </div>
  );
}
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4" />N/A      </div>

      <FormDialog
        isOpen={showEmployeeForm}
        onOpenChange={setShowEmployeeForm}
        formId="employeeForm"
        formTitle="Add Employee"
        formDescription="Create a new employee record"
      />
    </div>
  );
}
                      </div>

      <FormDialog
        isOpen={showEmployeeForm}
        onOpenChange={setShowEmployeeForm}
        formId="employeeForm"
        formTitle="Add Employee"
        formDescription="Create a new employee record"
      />
    </div>
  );
}
                <Badge className="mt-3">Active</Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card><CardContent className="p-4"><p className="text-muted-foreground">No employees found</p></CardContent></Card>
        )}
            </div>

      <FormDialog
        isOpen={showEmployeeForm}
        onOpenChange={setShowEmployeeForm}
        formId="employeeForm"
        formTitle="Add Employee"
        formDescription="Create a new employee record"
      />
    </div>
  );
}
          </div>

      <FormDialog
        isOpen={showEmployeeForm}
        onOpenChange={setShowEmployeeForm}
        formId="employeeForm"
        formTitle="Add Employee"
        formDescription="Create a new employee record"
      />
    </div>
  );
}
  );
}
