import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ThirdPartyLogistics() {
  const { toast } = useToast();
  const [new3PL, setNew3PL] = useState({ partner: "3PL-001", storageRate: "10", status: "active", vmiEnabled: false });

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["/api/3pl"],
    queryFn: () => fetch("/api/3pl").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/3pl", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/3pl"] });
      setNew3PL({ partner: "3PL-001", storageRate: "10", status: "active", vmiEnabled: false });
      toast({ title: "3PL partner created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/3pl/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/3pl"] });
      toast({ title: "Partner deleted" });
    },
  });

  const vmiCount = partners.filter((p: any) => p.vmiEnabled).length;
  const avgRate = partners.length > 0 ? (partners.reduce((sum: number, p: any) => sum + (parseFloat(p.storageRate) || 0), 0) / partners.length).toFixed(2) : "0";

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          3PL & Vendor Managed Inventory (VMI)
        </h1>
        <p className="text-muted-foreground mt-2">Manage third-party logistics and VMI agreements</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">3PL Partners</p>
            <p className="text-2xl font-bold">{partners.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">VMI Enabled</p>
            <p className="text-2xl font-bold text-green-600">{vmiCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Storage Rate</p>
            <p className="text-2xl font-bold">${avgRate}/m</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-3pl">
        <CardHeader><CardTitle className="text-base">Add 3PL Partner</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Partner ID" value={new3PL.partner} onChange={(e) => setNew3PL({ ...new3PL, partner: e.target.value })} data-testid="input-partner" />
            <Input placeholder="Storage Rate ($/m)" type="number" value={new3PL.storageRate} onChange={(e) => setNew3PL({ ...new3PL, storageRate: e.target.value })} data-testid="input-rate" />
            <Select value={new3PL.status} onValueChange={(v) => setNew3PL({ ...new3PL, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(new3PL)} disabled={createMutation.isPending || !new3PL.partner} className="w-full" data-testid="button-add-3pl">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">3PL Partners</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : partners.length === 0 ? <p className="text-muted-foreground text-center py-4">No partners</p> : partners.map((p: any) => (
            <div key={p.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`partner-${p.id}`}>
              <div>
                <p className="font-semibold text-sm">{p.partner}</p>
                <p className="text-xs text-muted-foreground">${p.storageRate}/m {p.vmiEnabled && "• VMI"}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="default">{p.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-${p.id}`}>
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
