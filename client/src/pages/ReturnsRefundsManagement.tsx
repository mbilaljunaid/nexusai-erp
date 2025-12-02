import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ReturnsRefundsManagement() {
  const { toast } = useToast();
  const [newReturn, setNewReturn] = useState({ orderId: "", reason: "defective", status: "pending", refundAmount: "0" });

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ["/api/returns-refunds"],
    queryFn: () => fetch("/api/returns-refunds").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/returns-refunds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/returns-refunds"] });
      setNewReturn({ orderId: "", reason: "defective", status: "pending", refundAmount: "0" });
      toast({ title: "Return created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/returns-refunds/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/returns-refunds"] });
      toast({ title: "Return deleted" });
    },
  });

  const processed = returns.filter((r: any) => r.status === "processed").length;
  const totalRefunded = returns.reduce((sum: number, r: any) => sum + (parseFloat(r.refundAmount) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <RotateCcw className="h-8 w-8" />
          Returns & Refunds Management
        </h1>
        <p className="text-muted-foreground mt-2">Return requests, RMA processing, refund tracking, and reverse logistics</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Returns</p>
            <p className="text-2xl font-bold">{returns.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Processed</p>
            <p className="text-2xl font-bold text-green-600">{processed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Refunded</p>
            <p className="text-2xl font-bold">${totalRefunded.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{returns.length - processed}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-return">
        <CardHeader><CardTitle className="text-base">Create Return Request</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Order ID" value={newReturn.orderId} onChange={(e) => setNewReturn({ ...newReturn, orderId: e.target.value })} data-testid="input-orderid" className="text-sm" />
            <Select value={newReturn.reason} onValueChange={(v) => setNewReturn({ ...newReturn, reason: v })}>
              <SelectTrigger data-testid="select-reason" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="defective">Defective</SelectItem>
                <SelectItem value="wrong-item">Wrong Item</SelectItem>
                <SelectItem value="changed-mind">Changed Mind</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Refund Amount" type="number" value={newReturn.refundAmount} onChange={(e) => setNewReturn({ ...newReturn, refundAmount: e.target.value })} data-testid="input-refund" className="text-sm" />
            <Select value={newReturn.status} onValueChange={(v) => setNewReturn({ ...newReturn, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled={createMutation.isPending || !newReturn.orderId} size="sm" data-testid="button-create-return">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Returns</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : returns.length === 0 ? <p className="text-muted-foreground text-center py-4">No returns</p> : returns.map((r: any) => (
            <div key={r.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`return-${r.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{r.orderId}</p>
                <p className="text-xs text-muted-foreground">{r.reason} • Refund: ${r.refundAmount}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={r.status === "processed" ? "default" : "secondary"} className="text-xs">{r.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${r.id}`} className="h-7 w-7">
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
