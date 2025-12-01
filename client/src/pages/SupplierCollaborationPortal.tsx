import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Handshake, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SupplierCollaborationPortal() {
  const { toast } = useToast();
  const [newInteraction, setNewInteraction] = useState({ supplier: "", type: "po-confirm", referenceId: "", status: "pending" });

  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ["/api/supplier-collab"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/supplier-collab", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-collab"] });
      setNewInteraction({ supplier: "", type: "po-confirm", referenceId: "", status: "pending" });
      toast({ title: "Interaction logged" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/supplier-collab/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-collab"] });
      toast({ title: "Interaction deleted" });
    }
  });

  const completed = interactions.filter((i: any) => i.status === "completed").length;
  const pending = interactions.filter((i: any) => i.status === "pending").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Handshake className="h-8 w-8" />
          Supplier Collaboration Portal
        </h1>
        <p className="text-muted-foreground mt-2">RFQ, PO confirmations, ASN tracking, and performance scorecards</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Interactions</p>
            <p className="text-2xl font-bold">{interactions.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold">{interactions.length > 0 ? ((completed / interactions.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-interaction">
        <CardHeader><CardTitle className="text-base">Log Supplier Interaction</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Supplier" value={newInteraction.supplier} onChange={(e) => setNewInteraction({ ...newInteraction, supplier: e.target.value })} data-testid="input-supplier" className="text-sm" />
            <Select value={newInteraction.type} onValueChange={(v) => setNewInteraction({ ...newInteraction, type: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rfq">RFQ</SelectItem>
                <SelectItem value="po-confirm">PO Confirm</SelectItem>
                <SelectItem value="asn">ASN</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Reference ID" value={newInteraction.referenceId} onChange={(e) => setNewInteraction({ ...newInteraction, referenceId: e.target.value })} data-testid="input-refid" className="text-sm" />
            <Select value={newInteraction.status} onValueChange={(v) => setNewInteraction({ ...newInteraction, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newInteraction)} disabled={createMutation.isPending || !newInteraction.supplier} size="sm" data-testid="button-log-int">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Interactions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : interactions.length === 0 ? <p className="text-muted-foreground text-center py-4">No interactions</p> : interactions.map((i: any) => (
            <div key={i.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`interaction-${i.id}`}>
              <div>
                <p className="font-semibold">{i.supplier}</p>
                <p className="text-xs text-muted-foreground">{i.type} • {i.referenceId}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={i.status === "completed" ? "default" : "secondary"} className="text-xs">{i.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(i.id)} data-testid={`button-delete-${i.id}`} className="h-7 w-7">
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
