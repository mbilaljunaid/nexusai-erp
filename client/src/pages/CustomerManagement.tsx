import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CustomerManagement() {
  const { toast } = useToast();
  const [newCustomer, setNewCustomer] = useState({ name: "", contact: "", email: "", terms: "Net 30", status: "active" });

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/crm/customers"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/crm/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/customers"] });
      setNewCustomer({ name: "", contact: "", email: "", terms: "Net 30", status: "active" });
      toast({ title: "Customer created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/crm/customers/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/customers"] });
      toast({ title: "Customer deleted" });
    }
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Customer Management
        </h1>
        <p className="text-muted-foreground mt-2">Manage customer master data</p>
      </div>

      <Card data-testid="card-new-customer">
        <CardHeader><CardTitle className="text-base">Add Customer</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <Input placeholder="Company" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} data-testid="input-name" />
            <Input placeholder="Contact" value={newCustomer.contact} onChange={(e) => setNewCustomer({ ...newCustomer, contact: e.target.value })} data-testid="input-contact" />
            <Input placeholder="Email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} data-testid="input-email" />
            <Select value={newCustomer.terms} onValueChange={(v) => setNewCustomer({ ...newCustomer, terms: v })}>
              <SelectTrigger data-testid="select-terms"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Net 30">Net 30</SelectItem>
                <SelectItem value="Net 45">Net 45</SelectItem>
                <SelectItem value="Net 60">Net 60</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newCustomer.status} onValueChange={(v) => setNewCustomer({ ...newCustomer, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newCustomer)} disabled={createMutation.isPending || !newCustomer.name} className="w-full" data-testid="button-create-customer">
            <Plus className="h-4 w-4 mr-2" /> Add Customer
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
            <p className="text-2xl font-bold text-green-600">{customers.filter((c: any) => c.status === "active").length}</p>
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
          {isLoading ? <p>Loading...</p> : customers.length === 0 ? <p className="text-muted-foreground text-center py-4">No customers</p> : customers.map((customer: any) => (
            <div key={customer.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`customer-${customer.id}`}>
              <div className="flex-1">
                <h3 className="font-semibold">{customer.name}</h3>
                <p className="text-sm text-muted-foreground">Contact: {customer.contact} • Email: {customer.email} • Terms: {customer.terms}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={customer.status === "active" ? "default" : "secondary"}>{customer.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(customer.id)} data-testid={`button-delete-${customer.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
