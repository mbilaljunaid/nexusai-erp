import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function QualityControl() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQC, setFilteredQC] = useState<any[]>([]);
  const { data: qcData = [] } = useQuery<any[]>({
    queryKey: ["/api/quality"],
  });
  const formMetadata = getFormMetadata("qualityControl");

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div>
        <h1 className="text-3xl font-bold">Quality Control</h1>
        <p className="text-muted-foreground mt-1">Manage QC inspections and defect tracking</p>
      </div>

      <FormSearchWithMetadata
        formMetadata={formMetadata}
        value={searchQuery}
        onChange={setSearchQuery}
        data={qcData}
        onFilter={setFilteredQC}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Inspected</p>
            <p className="text-3xl font-bold mt-1">2,450</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pass Rate</p>
            <p className="text-3xl font-bold mt-1">97.2%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Defects Found</p>
            <p className="text-3xl font-bold mt-1">68</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Inspections</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {filteredQC.length > 0 ? filteredQC.map((insp: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-2 border rounded">
              <span className="text-sm">{insp.product}</span>
              <div><Badge className={insp.status === "Pass" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{insp.status}</Badge></div>
            </div>
          )) : <p className="text-muted-foreground text-center py-4">No inspections found</p>}
        </CardContent>
      </Card>
    </div>
  );
}
