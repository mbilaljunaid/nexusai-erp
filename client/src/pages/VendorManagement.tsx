import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function VendorManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendors</h1>
          <p className="text-muted-foreground mt-1">Manage supplier relationships and performance</p>
        </div>
        <Button data-testid="button-new-vendor"><Plus className="h-4 w-4 mr-2" />Add Vendor</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Supplier Inc", category: "Electronics", rating: 4.8, purchases: "$150K" },
          { name: "Parts Co", category: "Components", rating: 4.5, purchases: "$120K" },
          { name: "Materials Ltd", category: "Raw Materials", rating: 4.2, purchases: "$200K" },
          { name: "Services Pro", category: "Outsourcing", rating: 4.6, purchases: "$80K" },
        ].map((vendor) => (
          <Card key={vendor.name} className="hover:shadow-lg transition">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg">{vendor.name}</h3>
              <p className="text-sm text-muted-foreground">{vendor.category}</p>
              <div className="mt-3 space-y-1">
                <p className="text-sm"><strong>Rating:</strong> ⭐ {vendor.rating}/5</p>
                <p className="text-sm"><strong>YTD Purchases:</strong> {vendor.purchases}</p>
              </div>
              <Badge className="mt-3 bg-green-100 text-green-800">Active</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
