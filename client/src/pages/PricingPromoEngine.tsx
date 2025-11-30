import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PricingPromoEngine() {
  const { toast } = useToast();
  const [newPromo, setNewPromo] = useState({ name: "", type: "discount", discountPct: "10", startDate: "", endDate: "", status: "draft" });

  const { data: promos = [], isLoading } = useQuery({
    queryKey: ["/api/promotions"],
    queryFn: () => fetch("/api/promotions").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/promotions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      setNewPromo({ name: "", type: "discount", discountPct: "10", startDate: "", endDate: "", status: "draft" });
      toast({ title: "Promotion created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/promotions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      toast({ title: "Promotion deleted" });
    },
  });

  const active = promos.filter((p: any) => p.status === "active").length;
  const avgDiscount = promos.length > 0 ? (promos.reduce((sum: number, p: any) => sum + (parseFloat(p.discountPct) || 0), 0) / promos.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Tag className="h-8 w-8" />
          Pricing & Promotion Engine
        </h1>
        <p className="text-muted-foreground mt-2">Price lists, discounts, BOGO, bundles, and promo scheduling</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Promos</p>
            <p className="text-2xl font-bold">{promos.length}</p>
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
            <p className="text-xs text-muted-foreground">Avg Discount</p>
            <p className="text-2xl font-bold">{avgDiscount}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-yellow-600">{promos.length - active}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-promo">
        <CardHeader><CardTitle className="text-base">Create Promotion</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-6 gap-2">
            <Input placeholder="Name" value={newPromo.name} onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })} data-testid="input-name" className="text-sm" />
            <Select value={newPromo.type} onValueChange={(v) => setNewPromo({ ...newPromo, type: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">Discount %</SelectItem>
                <SelectItem value="bogo">BOGO</SelectItem>
                <SelectItem value="bundle">Bundle</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Discount %" type="number" value={newPromo.discountPct} onChange={(e) => setNewPromo({ ...newPromo, discountPct: e.target.value })} data-testid="input-discount" className="text-sm" />
            <Input type="date" value={newPromo.startDate} onChange={(e) => setNewPromo({ ...newPromo, startDate: e.target.value })} data-testid="input-start" className="text-sm" />
            <Input type="date" value={newPromo.endDate} onChange={(e) => setNewPromo({ ...newPromo, endDate: e.target.value })} data-testid="input-end" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newPromo)} disabled={createMutation.isPending || !newPromo.name} size="sm" data-testid="button-add-promo">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Promotions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : promos.length === 0 ? <p className="text-muted-foreground text-center py-4">No promotions</p> : promos.map((p: any) => (
            <div key={p.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`promo-${p.id}`}>
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.type} • {p.discountPct}% • {p.startDate} to {p.endDate}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-${p.id}`} className="h-7 w-7">
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
