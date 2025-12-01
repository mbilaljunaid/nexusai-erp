import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TaxManagement() {
  const { toast } = useToast();
  const [newTax, setNewTax] = useState({ name: "", type: "Sales Tax", rate: "", jurisdiction: "" });

  const { data: taxCodes = [], isLoading } = useQuery({
    queryKey: ["/api/finance/tax-codes"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/finance/tax-codes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/tax-codes"] });
      setNewTax({ name: "", type: "Sales Tax", rate: "", jurisdiction: "" });
      toast({ title: "Tax code created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/finance/tax-codes/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/tax-codes"] });
      toast({ title: "Tax code deleted" });
    }
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Tax Management
        </h1>
        <p className="text-muted-foreground mt-2">Configure and manage tax codes</p>
      </div>

      <Card data-testid="card-new-tax">
        <CardHeader><CardTitle className="text-base">Add Tax Code</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Name" value={newTax.name} onChange={(e) => setNewTax({ ...newTax, name: e.target.value })} data-testid="input-name" />
            <Select value={newTax.type} onValueChange={(v) => setNewTax({ ...newTax, type: v })}>
              <SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Sales Tax">Sales Tax</SelectItem>
                <SelectItem value="VAT">VAT</SelectItem>
                <SelectItem value="GST">GST</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Rate %" value={newTax.rate} onChange={(e) => setNewTax({ ...newTax, rate: e.target.value })} data-testid="input-rate" />
            <Input placeholder="Jurisdiction" value={newTax.jurisdiction} onChange={(e) => setNewTax({ ...newTax, jurisdiction: e.target.value })} data-testid="input-jurisdiction" />
          </div>
          <Button onClick={() => createMutation.mutate(newTax)} disabled={createMutation.isPending || !newTax.name} className="w-full" data-testid="button-create-tax">
            <Plus className="h-4 w-4 mr-2" /> Add Tax Code
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
            <p className="text-2xl font-bold text-green-600">{taxCodes.filter((t: any) => t.status === "active").length}</p>
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
          {isLoading ? (
            <p className="text-center py-4">Loading...</p>
          ) : taxCodes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No tax codes</p>
          ) : (
            taxCodes.map((tax: any) => (
              <div key={tax.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`tax-${tax.id}`}>
                <div className="flex-1">
                  <h3 className="font-semibold">{tax.name}</h3>
                  <p className="text-sm text-muted-foreground">Type: {tax.type} • Jurisdiction: {tax.jurisdiction}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="default">{tax.rate || tax.rate}%</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(tax.id)} data-testid={`button-delete-${tax.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
