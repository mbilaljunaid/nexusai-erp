import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CarrierProcurement() {
  const { toast } = useToast();
  const [newRate, setNewRate] = useState({ rateId: "", lane: "", rate: "100", effectiveFrom: "", status: "active" });

  const { data: rates = [], isLoading } = useQuery({
    queryKey: ["/api/tl-rates"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/tl-rates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tl-rates"] });
      setNewRate({ rateId: "", lane: "", rate: "100", effectiveFrom: "", status: "active" });
      toast({ title: "Rate card created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/tl-rates/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tl-rates"] });
      toast({ title: "Rate deleted" });
    }
  });

  const active = rates.filter((r: any) => r.status === "active").length;
  const avgRate = rates.length > 0 ? (rates.reduce((sum: number, r: any) => sum + (parseFloat(r.rate) || 0), 0) / rates.length).toFixed(2) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Truck className="h-8 w-8" />
          Carrier Procurement & Rate Management
        </h1>
        <p className="text-muted-foreground mt-2">RFQ, rate tendering, contract rates, dynamic pricing, and carrier scorecards</p>
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
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{active}</p>
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
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{rates.length - active}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-rate">
        <CardHeader><CardTitle className="text-base">Create Rate Card</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Rate ID" value={newRate.rateId} onChange={(e) => setNewRate({ ...newRate, rateId: e.target.value })} data-testid="input-rid" className="text-sm" />
            <Input placeholder="Lane" value={newRate.lane} onChange={(e) => setNewRate({ ...newRate, lane: e.target.value })} data-testid="input-lane" className="text-sm" />
            <Input placeholder="Rate/kg" type="number" value={newRate.rate} onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })} data-testid="input-rate" className="text-sm" />
            <Input placeholder="Effective From" type="date" value={newRate.effectiveFrom} onChange={(e) => setNewRate({ ...newRate, effectiveFrom: e.target.value })} data-testid="input-from" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newRate)} disabled={createMutation.isPending || !newRate.rateId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Rate Cards</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : rates.length === 0 ? <p className="text-muted-foreground text-center py-4">No rates</p> : rates.map((r: any) => (
            <div key={r.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`rate-${r.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{r.rateId}</p>
                <p className="text-xs text-muted-foreground">Lane: {r.lane} • ${r.rate}/kg</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={r.status === "active" ? "default" : "secondary"} className="text-xs">{r.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-${r.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
