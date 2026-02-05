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

export default function BOQManagementConstruction() {
  const { toast } = useToast();
  const [newBOQ, setNewBOQ] = useState({ project: "Project-A", item: "Excavation", qty: "1000", uom: "m3", rate: "50", costCode: "CC-001", status: "active" });

  const { data: boqs = [], isLoading } = useQuery({
    queryKey: ["/api/boq-construction"],
    queryFn: () => fetch("/api/boq-construction").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/boq-construction", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boq-construction"] });
      setNewBOQ({ project: "Project-A", item: "Excavation", qty: "1000", uom: "m3", rate: "50", costCode: "CC-001", status: "active" });
      toast({ title: "BOQ line added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/boq-construction/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boq-construction"] });
      toast({ title: "BOQ line deleted" });
    },
  });

  const totalAmount = boqs.reduce((sum: number, b: any) => sum + ((parseFloat(b.qty) || 0) * (parseFloat(b.rate) || 0)), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Bill of Quantities (Construction)
        </h1>
        <p className="text-muted-foreground mt-2">WBS, cost codes, and BOQ management</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">BOQ Lines</p>
            <p className="text-2xl font-bold">{boqs.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">${(totalAmount / 1000000).toFixed(2)}M</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Rate</p>
            <p className="text-2xl font-bold">${boqs.length > 0 ? (boqs.reduce((sum: number, b: any) => sum + (parseFloat(b.rate) || 0), 0) / boqs.length).toFixed(0) : 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-boq">
        <CardHeader><CardTitle className="text-base">Add BOQ Line</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-6 gap-2">
            <Input placeholder="Item" value={newBOQ.item} onChange={(e) => setNewBOQ({ ...newBOQ, item: e.target.value })} data-testid="input-item" className="text-sm" />
            <Input placeholder="Qty" type="number" value={newBOQ.qty} onChange={(e) => setNewBOQ({ ...newBOQ, qty: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Input placeholder="UoM" value={newBOQ.uom} onChange={(e) => setNewBOQ({ ...newBOQ, uom: e.target.value })} data-testid="input-uom" className="text-sm" />
            <Input placeholder="Rate" type="number" value={newBOQ.rate} onChange={(e) => setNewBOQ({ ...newBOQ, rate: e.target.value })} data-testid="input-rate" className="text-sm" />
            <Input placeholder="Cost Code" value={newBOQ.costCode} onChange={(e) => setNewBOQ({ ...newBOQ, costCode: e.target.value })} data-testid="input-cc" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newBOQ)} disabled={createMutation.isPending} size="sm" data-testid="button-add-boq">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">BOQ Lines</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : boqs.length === 0 ? <p className="text-muted-foreground text-center py-4">No lines</p> : boqs.map((b: any) => {
            const amount = (parseFloat(b.qty) || 0) * (parseFloat(b.rate) || 0);
            return (
              <div key={b.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`boq-${b.id}`}>
                <div className="flex-1">
                  <p className="font-semibold">{b.item}</p>
                  <p className="text-xs text-muted-foreground">{b.qty} {b.uom} @ ${b.rate} = ${amount.toFixed(0)} | CC: {b.costCode}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(b.id)} data-testid={`button-delete-${b.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
