import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function WorkOrder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<any[]>([]);
  const { data: workOrders = [] } = useQuery<any[]>({
    queryKey: ["/api/work-orders"],
  });
  const formMetadata = getFormMetadata("workOrder");

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground mt-1">Track production work orders and status</p>
        </div>
        <SmartAddButton formId="workOrder" formMetadata={formMetadata} formId="workOrder" />
      </div>

      <FormSearchWithMetadata
        formMetadata={formMetadata}
        value={searchQuery}
        onChange={setSearchQuery}
        data={workOrders}
        onFilter={setFilteredWorkOrders}
      />

      <div className="grid gap-4">
        {filteredWorkOrders.length > 0 ? filteredWorkOrders.map((wo: any) => (
          <Card key={wo.id} className="hover:bg-muted/50 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{wo.id} - {wo.product}</p>
                </div>
                <div className="text-right">
                  <Badge>{wo.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : <Card><CardContent className="p-4"><p className="text-muted-foreground">No work orders found</p></CardContent></Card>}
      </div>
    </div>
  );
}
