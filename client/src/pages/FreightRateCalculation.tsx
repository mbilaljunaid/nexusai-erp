import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FreightRateCalculation() {
  const { toast } = useToast();
  const [newRate, setNewRate] = useState({ carrier: "UPS", weight: "50", origin: "US", destination: "US", rate: "25.00" });

  const { data: rates = [], isLoading } = useQuery({
    queryKey: ["/api/freight-rates"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/freight-rates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/freight-rates"] });
      setNewRate({ carrier: "UPS", weight: "50", origin: "US", destination: "US", rate: "25.00" });
      toast({ title: "Rate added" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/freight-rates/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/freight-rates"] });
      toast({ title: "Rate deleted" });
    }
  });

  const totalRevenue = rates.reduce((sum: number, r: any) => sum + (parseFloat(r.rate) || 0), 0);
  const avgRate = rates.length > 0 ? (totalRevenue / rates.length).toFixed(2) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Freight Rate Calculation
        </h1>
        <p className="text-muted-foreground mt-2">Carrier rates, tariff tables, weight-based pricing, and cost optimization</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Rates</p>
            <p className="text-2xl font-bold">{rates.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Rate</p>
            <p className="text-2xl font-bold">${avgRate}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Carriers</p>
            <p className="text-2xl font-bold">{new Set(rates.map((r: any) => r.carrier)).size}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-rate">
        <CardHeader><CardTitle className="text-base">Add Freight Rate</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Select value={newRate.carrier} onValueChange={(v) => setNewRate({ ...newRate, carrier: v })}>
              <SelectTrigger data-testid="select-carrier" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UPS">UPS</SelectItem>
                <SelectItem value="FedEx">FedEx</SelectItem>
                <SelectItem value="DHL">DHL</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Weight (lbs)" type="number" value={newRate.weight} onChange={(e) => setNewRate({ ...newRate, weight: e.target.value })} data-testid="input-weight" className="text-sm" />
            <Input placeholder="Origin" value={newRate.origin} onChange={(e) => setNewRate({ ...newRate, origin: e.target.value })} data-testid="input-origin" className="text-sm" />
            <Input placeholder="Destination" value={newRate.destination} onChange={(e) => setNewRate({ ...newRate, destination: e.target.value })} data-testid="input-dest" className="text-sm" />
            <Input placeholder="Rate ($)" type="number" value={newRate.rate} onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })} data-testid="input-rate" className="text-sm" />
          </div>
          <Button onClick={() => createMutation.mutate(newRate)} disabled={createMutation.isPending} size="sm" data-testid="button-add" className="w-full">
            <Plus className="w-3 h-3 mr-1" /> Add Rate
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Rates</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : rates.length === 0 ? <p className="text-muted-foreground text-center py-4">No rates</p> : rates.map((r: any) => (
            <div key={r.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`rate-${r.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{r.carrier}</p>
                <p className="text-xs text-muted-foreground">{r.origin} → {r.destination} • {r.weight}lbs • ${r.rate}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-${r.id}`} className="h-7 w-7">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
