import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { Mail, Phone } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export default function EmployeeDirectory() {
  const { legalEntityId } = useEnterpriseStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const { data: responseData } = useQuery<any>({
    queryKey: ["/api/hr/persons", legalEntityId],
    queryFn: () => fetch("/api/hr/persons", { headers: legalEntityId ? { "x-legal-entity-id": legalEntityId } : undefined }).then(r => r.json())
  });

  const employees = responseData?.data || [];
  const formMetadata = getFormMetadata("employee");

  return (
    <StandardPage
      title="Employee Directory"
      description="Find and manage employee information"
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb items={formMetadata?.breadcrumbs || []} />
        <SmartAddButton formId="employee" formMetadata={formMetadata} />
      </div>

      <FormSearchWithMetadata formMetadata={formMetadata} value={searchQuery} onChange={setSearchQuery} data={employees} onFilter={setFiltered} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? filtered.map((emp: any) => (
          <Card key={emp.id} className="hover:shadow-lg transition">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg">{emp.firstName} {emp.lastName}</h3>
              <p className="text-sm text-muted-foreground">{emp.job || 'No Job Assigned'}</p>
              <p className="text-xs text-muted-foreground">{emp.department || 'No Department'}</p>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{emp.email || 'N/A'}</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{emp.phone || 'N/A'}</div>
              </div>
              <Badge className="mt-3">{emp.assignmentStatus || 'ACTIVE'}</Badge>
            </CardContent>
          </Card>
        )) : <Card><CardContent className="p-4"><p className="text-muted-foreground">No employees found</p></CardContent></Card>}
      </div>
    </StandardPage>
  );
}
