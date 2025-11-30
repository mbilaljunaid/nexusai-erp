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

export default function PricingPromotionManagement() {
  const { toast } = useToast();
  const [newPrice, setNewPrice] = useState({ productId: "", basePrice: "100", discountPercent: "0", status: "active" });

  const { data: prices = [], isLoading } = useQuery({
    queryKey: ["/api/pricing-promotion"],
    queryFn: () => fetch("/api/pricing-promotion").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/pricing-promotion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-promotion"] });
      setNewPrice({ productId: "", basePrice: "100", discountPercent: "0", status: "active" });
      toast({ title: "Price rule created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/pricing-promotion/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-promotion"] });
      toast({ title: "Price deleted" });
    },
  });

  const active = prices.filter((p: any) => p.status === "active").length;
  const avgDiscount = prices.length > 0 ? (prices.reduce((sum: number, p: any) => sum + (parseFloat(p.discountPercent) || 0), 0) / prices.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Tag className="h-8 w-8" />
          Pricing & Promotion Management
        </h1>
        <p className="text-muted-foreground mt-2">Price rules, promotions, dynamic pricing, and discount strategies</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Prices</p>
            <p className="text-2xl font-bold">{prices.length}</p>
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
            <p className="text-2xl font-bold text-gray-600">{prices.length - active}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-price">
        <CardHeader><CardTitle className="text-base">Create Price Rule</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Product ID" value={newPrice.productId} onChange={(e) => setNewPrice({ ...newPrice, productId: e.target.value })} data-testid="input-prodid" className="text-sm" />
            <Input placeholder="Base Price" type="number" value={newPrice.basePrice} onChange={(e) => setNewPrice({ ...newPrice, basePrice: e.target.value })} data-testid="input-baseprice" className="text-sm" />
            <Input placeholder="Discount %" type="number" value={newPrice.discountPercent} onChange={(e) => setNewPrice({ ...newPrice, discountPercent: e.target.value })} data-testid="input-discount" className="text-sm" />
            <Select value={newPrice.status} onValueChange={(v) => setNewPrice({ ...newPrice, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newPrice)} disabled={createMutation.isPending || !newPrice.productId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Price Rules</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : prices.length === 0 ? <p className="text-muted-foreground text-center py-4">No rules</p> : prices.map((p: any) => {
            const finalPrice = (parseFloat(p.basePrice) || 0) * (1 - (parseFloat(p.discountPercent) || 0) / 100);
            return (
              <div key={p.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`price-${p.id}`}>
                <div className="flex-1">
                  <p className="font-semibold">{p.productId}</p>
                  <p className="text-xs text-muted-foreground">${p.basePrice} → ${finalPrice.toFixed(2)} (-{p.discountPercent}%)</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-${p.id}`} className="h-7 w-7">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
