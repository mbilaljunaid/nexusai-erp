import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus } from "lucide-react";

export default function TaxManagement() {
  const taxCodes = [
    { id: "t1", name: "Sales Tax 8%", type: "Sales Tax", rate: "8%", jurisdiction: "California", status: "active" },
    { id: "t2", name: "VAT 20%", type: "VAT", rate: "20%", jurisdiction: "UK", status: "active" },
    { id: "t3", name: "GST 10%", type: "GST", rate: "10%", jurisdiction: "Australia", status: "active" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Tax Management
        </h1>
        <p className="text-muted-foreground mt-2">Configure and manage tax codes</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-create-tax">
            <Plus className="h-4 w-4" />
            Add Tax Code
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Codes</p>
            <p className="text-2xl font-bold">{taxCodes.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active Codes</p>
            <p className="text-2xl font-bold text-green-600">{taxCodes.filter(t => t.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Jurisdictions</p>
            <p className="text-2xl font-bold">12</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Tax Codes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {taxCodes.map((tax) => (
            <div key={tax.id} className="p-3 border rounded-lg hover-elevate" data-testid={`tax-${tax.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{tax.name}</h3>
                <Badge variant="default">{tax.rate}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Type: {tax.type} • Jurisdiction: {tax.jurisdiction} • Status: {tax.status}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
