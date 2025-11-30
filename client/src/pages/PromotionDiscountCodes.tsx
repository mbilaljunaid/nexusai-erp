import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Percent, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PromotionDiscountCodes() {
  const { toast } = useToast();
  const [newPromo, setNewPromo] = useState({ code: "", discountPercent: "10", usageLimit: "100", status: "active" });

  const { data: promos = [], isLoading } = useQuery({
    queryKey: ["/api/promotions"],
    queryFn: () => fetch("/api/promotions").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/promotions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      setNewPromo({ code: "", discountPercent: "10", usageLimit: "100", status: "active" });
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
  const avgDiscount = promos.length > 0 ? (promos.reduce((sum: number, p: any) => sum + (parseFloat(p.discountPercent) || 0), 0) / promos.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Percent className="h-8 w-8" />
          Promotions & Discount Codes
        </h1>
        <p className="text-muted-foreground mt-2">Coupon management, seasonal sales, flash deals, and campaign tracking</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Promotions</p>
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
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{promos.length - active}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-promo">
        <CardHeader><CardTitle className="text-base">Create Promotion</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Code" value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })} data-testid="input-code" className="text-sm" />
            <Input placeholder="Discount %" type="number" value={newPromo.discountPercent} onChange={(e) => setNewPromo({ ...newPromo, discountPercent: e.target.value })} data-testid="input-discount" className="text-sm" />
            <Input placeholder="Usage Limit" type="number" value={newPromo.usageLimit} onChange={(e) => setNewPromo({ ...newPromo, usageLimit: e.target.value })} data-testid="input-limit" className="text-sm" />
            <Select value={newPromo.status} onValueChange={(v) => setNewPromo({ ...newPromo, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newPromo)} disabled={createMutation.isPending || !newPromo.code} size="sm" data-testid="button-create-promo">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Active Promotions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : promos.length === 0 ? <p className="text-muted-foreground text-center py-4">No promotions</p> : promos.map((p: any) => (
            <div key={p.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`promo-${p.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{p.code}</p>
                <p className="text-xs text-muted-foreground">{p.discountPercent}% off • Limit: {p.usageLimit}</p>
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
