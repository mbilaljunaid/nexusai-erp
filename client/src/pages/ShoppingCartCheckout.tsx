import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ShoppingCartCheckout() {
  const { toast } = useToast();
  const [newItem, setNewItem] = useState({ productId: "", quantity: "1", price: "29.99" });

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/shopping-cart"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/shopping-cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-cart"] });
      setNewItem({ productId: "", quantity: "1", price: "29.99" });
      toast({ title: "Item added to cart" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/shopping-cart/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-cart"] });
      toast({ title: "Item removed from cart" });
    }
  });

  const subtotal = cartItems.reduce((sum: number, item: any) => sum + ((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0)), 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Shopping Cart & Checkout
        </h1>
        <p className="text-muted-foreground mt-2">Cart management, checkout flow, and order finalization</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Cart Items</p>
            <p className="text-2xl font-bold">{cartItems.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Subtotal</p>
            <p className="text-2xl font-bold">${subtotal.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Tax (10%)</p>
            <p className="text-2xl font-bold">${tax.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-green-600">${total.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-add-item">
        <CardHeader><CardTitle className="text-base">Add to Cart</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <Input placeholder="Product ID" value={newItem.productId} onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })} data-testid="input-prodid" className="text-sm" />
            <Input placeholder="Quantity" type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Input placeholder="Price" type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} data-testid="input-price" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newItem)} disabled={createMutation.isPending || !newItem.productId} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Cart Items</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : cartItems.length === 0 ? <p className="text-muted-foreground text-center py-4">Cart is empty</p> : cartItems.map((item: any) => (
            <div key={item.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`cart-item-${item.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{item.productId}</p>
                <p className="text-xs text-muted-foreground">{item.quantity} x ${item.price} = ${(item.quantity * item.price).toFixed(2)}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(item.id)} data-testid={`button-delete-${item.id}`} className="h-7 w-7">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" disabled={cartItems.length === 0} data-testid="button-checkout">Proceed to Checkout</Button>
    </div>
  );
}
