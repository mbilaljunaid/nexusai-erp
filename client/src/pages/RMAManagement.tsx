import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Plus, Trash2, DollarSign } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RMAManagement() {
  const { toast } = useToast();
  const [newRMA, setNewRMA] = useState({ rmaId: "", reason: "defective", status: "open", disposition: "replace", refundAmount: "0" });

  const { data: rmas = [], isLoading } = useQuery({
    queryKey: ["/api/rma"],
    queryFn: () => fetch("/api/rma").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/rma", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rma"] });
      setNewRMA({ rmaId: "", reason: "defective", status: "open", disposition: "replace", refundAmount: "0" });
      toast({ title: "RMA created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/rma/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rma"] });
      toast({ title: "RMA deleted" });
    },
  });

  const closed = rmas.filter((r: any) => r.status === "closed").length;
  const totalRefunds = rmas.reduce((sum: number, r: any) => sum + (parseFloat(r.refundAmount) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <RotateCcw className="h-8 w-8" />
          Returns Management (RMA)
        </h1>
        <p className="text-muted-foreground mt-2">Manage returns, refunds, and replacements</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total RMAs</p>
            <p className="text-2xl font-bold">{rmas.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Closed</p>
            <p className="text-2xl font-bold text-green-600">{closed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total Refunds</p>
                <p className="text-2xl font-bold">${(totalRefunds / 1000).toFixed(1)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-yellow-600">{rmas.length - closed}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-rma">
        <CardHeader><CardTitle className="text-base">Create RMA</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <Input placeholder="RMA ID" value={newRMA.rmaId} onChange={(e) => setNewRMA({ ...newRMA, rmaId: e.target.value })} data-testid="input-rma-id" />
            <Select value={newRMA.reason} onValueChange={(v) => setNewRMA({ ...newRMA, reason: v })}>
              <SelectTrigger data-testid="select-reason"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="defective">Defective</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="wrong-item">Wrong Item</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newRMA.disposition} onValueChange={(v) => setNewRMA({ ...newRMA, disposition: v })}>
              <SelectTrigger data-testid="select-disposition"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="replace">Replace</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Refund $" type="number" value={newRMA.refundAmount} onChange={(e) => setNewRMA({ ...newRMA, refundAmount: e.target.value })} data-testid="input-refund" />
            <Select value={newRMA.status} onValueChange={(v) => setNewRMA({ ...newRMA, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newRMA)} disabled={createMutation.isPending || !newRMA.rmaId} className="w-full" data-testid="button-create-rma">
            <Plus className="w-4 h-4 mr-2" /> Create RMA
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">RMAs</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : rmas.length === 0 ? <p className="text-muted-foreground text-center py-4">No RMAs</p> : rmas.map((r: any) => (
            <div key={r.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`rma-${r.id}`}>
              <div>
                <p className="font-semibold text-sm">{r.rmaId}</p>
                <p className="text-xs text-muted-foreground">{r.reason} • {r.disposition}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={r.status === "closed" ? "default" : "secondary"}>{r.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-${r.id}`}>
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
