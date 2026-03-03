import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function PurchaseOrder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPOs, setFilteredPOs] = useState<any[]>([]);
  const { data: purchaseOrders = [] } = useQuery<any[]>({ queryKey: ["/api/purchase-orders"] });
  const formMetadata = getFormMetadata("purchaseOrder");

  return (
    <StandardPage
      title="Purchase Orders"
      description="Manage purchase orders and vendor management"
      className="space-y-6"
    >
      <Breadcrumb items={formMetada          <p className="text-muted-foreground mt-1">Manage purchase orders and vendor management</p>
        </div>
        <SmartAddButton formId="purchaseOrder" formMetadata={formMetadata} />
      </div>

      <FormSearchWithMetadata
        formMetadata={formMetadata}
        value={searchQuery}
        onChange={setSearchQuery}
        data={purchaseOrders}
        onFilter={setFilteredPOs}
      />

      <Card>
        <CardHeader><CardTitle className="text-base">Recent POs</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPOs.length > 0 ? filteredPOs.map((po: any) => (
              <div key={po.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{po.id}</p>
                  <p className="text-sm text-muted-foreground">{po.vendor}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${po.amount}</p>
                  <Badge>{po.status}</Badge>
                </div>
              </div>
            )) : <p className="text-muted-foreground">No purchase orders found</p>}
          </div>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
