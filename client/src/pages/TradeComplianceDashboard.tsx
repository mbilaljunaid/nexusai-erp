import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Trash2, AlertCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TradeComplianceDashboard() {
  const { toast } = useToast();
  const [newTrade, setNewTrade] = useState({ hsCode: "8471.30", country: "China", dutyPct: "5", status: "cleared" });

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ["/api/trade-compliance"],
    queryFn: () => fetch("/api/trade-compliance").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/trade-compliance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trade-compliance"] });
      setNewTrade({ hsCode: "8471.30", country: "China", dutyPct: "5", status: "cleared" });
      toast({ title: "Trade record created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/trade-compliance/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trade-compliance"] });
      toast({ title: "Record deleted" });
    },
  });

  const heldCount = trades.filter((t: any) => t.status === "held").length;
  const clearedCount = trades.filter((t: any) => t.status === "cleared").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe className="h-8 w-8" />
          Global Trade & Compliance
        </h1>
        <p className="text-muted-foreground mt-2">Manage HS codes, duties, and customs clearance</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Records</p>
            <p className="text-2xl font-bold">{trades.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Cleared</p>
            <p className="text-2xl font-bold text-green-600">{clearedCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">Held</p>
                <p className="text-2xl font-bold">{heldCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Clearance Rate</p>
            <p className="text-2xl font-bold">{trades.length > 0 ? ((clearedCount / trades.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-trade">
        <CardHeader><CardTitle className="text-base">Add Trade Record</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="HS Code" value={newTrade.hsCode} onChange={(e) => setNewTrade({ ...newTrade, hsCode: e.target.value })} data-testid="input-hs" />
            <Input placeholder="Country" value={newTrade.country} onChange={(e) => setNewTrade({ ...newTrade, country: e.target.value })} data-testid="input-country" />
            <Input placeholder="Duty %" type="number" value={newTrade.dutyPct} onChange={(e) => setNewTrade({ ...newTrade, dutyPct: e.target.value })} data-testid="input-duty" />
            <Select value={newTrade.status} onValueChange={(v) => setNewTrade({ ...newTrade, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cleared">Cleared</SelectItem>
                <SelectItem value="held">Held</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newTrade)} disabled={createMutation.isPending} className="w-full" data-testid="button-add-trade">
            <Plus className="w-4 h-4 mr-2" /> Add Record
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Trade Records</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : trades.length === 0 ? <p className="text-muted-foreground text-center py-4">No records</p> : trades.map((t: any) => (
            <div key={t.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`trade-${t.id}`}>
              <div>
                <p className="font-semibold text-sm">HS {t.hsCode}</p>
                <p className="text-xs text-muted-foreground">{t.country} • {t.dutyPct}% duty</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={t.status === "cleared" ? "default" : t.status === "held" ? "destructive" : "secondary"}>{t.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(t.id)} data-testid={`button-delete-${t.id}`}>
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
