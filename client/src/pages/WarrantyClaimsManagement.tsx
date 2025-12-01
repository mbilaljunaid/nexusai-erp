import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WarrantyClaimsManagement() {
  const { toast } = useToast();
  const [newClaim, setNewClaim] = useState({ claimId: "", vin: "", claimAmount: "0", status: "pending" });

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ["/api/auto-warranty"],
    queryFn: () => fetch("/api/auto-warranty").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/auto-warranty", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-warranty"] });
      setNewClaim({ claimId: "", vin: "", claimAmount: "0", status: "pending" });
      toast({ title: "Warranty claim created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/auto-warranty/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-warranty"] });
      toast({ title: "Claim deleted" });
    },
  });

  const approved = claims.filter((c: any) => c.status === "approved").length;
  const totalAmount = claims.reduce((sum: number, c: any) => sum + (parseFloat(c.claimAmount) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Warranty, Claims & Recall Management
        </h1>
        <p className="text-muted-foreground mt-2">Warranty policies, claim submission, tracking, and recall campaigns</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Claims</p>
            <p className="text-2xl font-bold">{claims.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approved}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{claims.filter((c: any) => c.status === "pending").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">${(totalAmount / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-claim">
        <CardHeader><CardTitle className="text-base">Create Warranty Claim</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Claim ID" value={newClaim.claimId} onChange={(e) => setNewClaim({ ...newClaim, claimId: e.target.value })} data-testid="input-claimid" className="text-sm" />
            <Input placeholder="VIN" value={newClaim.vin} onChange={(e) => setNewClaim({ ...newClaim, vin: e.target.value })} data-testid="input-vin" className="text-sm" />
            <Input placeholder="Claim Amount" type="number" value={newClaim.claimAmount} onChange={(e) => setNewClaim({ ...newClaim, claimAmount: e.target.value })} data-testid="input-amt" className="text-sm" />
            <Input placeholder="Status" disabled value={newClaim.status} data-testid="input-status" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newClaim)} disabled={createMutation.isPending || !newClaim.claimId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Claims</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : claims.length === 0 ? <p className="text-muted-foreground text-center py-4">No claims</p> : claims.map((c: any) => (
            <div key={c.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`claim-${c.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{c.claimId}</p>
                <p className="text-xs text-muted-foreground">{c.vin} • ${c.claimAmount}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={c.status === "approved" ? "default" : "secondary"} className="text-xs">{c.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-${c.id}`} className="h-7 w-7">
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
