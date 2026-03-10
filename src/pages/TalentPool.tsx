import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function TalentPool() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const { data: talents = [] } = useQuery<any[]>({ queryKey: ["/api/talent"] });
  const formMetadata = getFormMetadata("talentPool");

  return (
    <StandardPage
      title="Talent Pool & Succession Planning"
      description="Identify and develop future leaders"
      className="space-y-6"
    >
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      <FormSearchWithMetadata formMetadata={formMetadata} value={searchQuery} onChange={setSearchQuery} data={talents} onFilter={setFiltered} />

      <Card>
        <CardHeader><CardTitle className="text-base">High-Potential Employees</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { emp: "Sarah Chen", current: "Senior Engineer", potential: "VP Engineering", readiness: "12 months" },
            { emp: "Mike Rodriguez", current: "Sales Manager", potential: "VP Sales", readiness: "18 months" },
            { emp: "Jessica Lee", current: "Analyst", potential: "Manager", readiness: "6 months" },
          ].map((emp, idx) => (
            <div key={idx} className="p-3 border rounded">
              <p className="font-semibold">{emp.emp}</p>
              <p className="text-sm text-muted-foreground">{emp.current} → {emp.potential}</p>
              <StatusBadge status="info" label={`Ready in ${emp.readiness}`} className="mt-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </StandardPage>
  );
}
