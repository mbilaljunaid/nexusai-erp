import { Card, CardContent } from "@/components/ui/card";

export default function ProcurementManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Procurement Management</h1>
        <p className="text-muted-foreground mt-1">Supplier and purchase order management</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Active POs</p><p className="text-3xl font-bold mt-1">45</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Suppliers</p><p className="text-3xl font-bold mt-1">128</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Avg Lead Time</p><p className="text-3xl font-bold mt-1">8 days</p></CardContent></Card>
      </div>
    </div>
  );
}
