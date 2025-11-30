import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";

export default function CustomerManagement() {
  const customers = [
    { id: "c1", name: "Acme Inc", contact: "Alice Green", email: "alice@acme.com", terms: "Net 30", status: "active" },
    { id: "c2", name: "TechCorp", contact: "Bob Wilson", email: "bob@techcorp.com", terms: "Net 45", status: "active" },
    { id: "c3", name: "Global Ltd", contact: "Carol Brown", email: "carol@global.com", terms: "Net 60", status: "inactive" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Customer Management
        </h1>
        <p className="text-muted-foreground mt-2">Manage customer master data</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-create-customer">
            <Plus className="h-4 w-4" />
            Add New Customer
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Customers</p>
            <p className="text-2xl font-bold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{customers.filter(c => c.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">YTD Revenue</p>
            <p className="text-2xl font-bold">$5.2M</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Customer List</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {customers.map((customer) => (
            <div key={customer.id} className="p-3 border rounded-lg hover-elevate" data-testid={`customer-${customer.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{customer.name}</h3>
                <Badge variant={customer.status === "active" ? "default" : "secondary"}>{customer.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Contact: {customer.contact} • Email: {customer.email} • Terms: {customer.terms}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
