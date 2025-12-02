import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function VendorManagement() {
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const { data: vendors = [] } = useQuery<any[]>({
    queryKey: ["/api/vendors"],
  });
  const formMetadata = getFormMetadata("vendor");

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendors</h1>
          <p className="text-muted-foreground mt-1">Manage supplier relationships and performance</p>
        </div>
        <SmartAddButton formMetadata={formMetadata} onClick={() => setShowVendorForm(true)} />
      </div>

      <FormSearchWithMetadata
        formMetadata={formMetadata}
        value={searchQuery}
        onChange={setSearchQuery}
        data={vendors}
        onFilter={setFilteredVendors}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.length > 0 ? filteredVendors.map((vendor: any) => (
          <Card key={vendor.id} className="hover:shadow-lg transition">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg">{vendor.name}</h3>
              <p className="text-sm text-muted-foreground">{vendor.category}</p>
              <Badge className="mt-3 bg-green-100 text-green-800">Active</Badge>
            </CardContent>
          </Card>
        )) : <Card><CardContent className="p-4"><p className="text-muted-foreground">No vendors found</p></CardContent></Card>}
      </div>
    </div>
  );
}
