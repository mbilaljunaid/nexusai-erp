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

export default function PLMEngineeringChangeControl() {
  const { toast } = useToast();
  const [newCR, setNewCR] = useState({ crId: "", title: "", changeType: "design", impactedParts: "", status: "submitted" });

  const { data: changes = [], isLoading } = useQuery({
    queryKey: ["/api/engineering-changes"],
    queryFn: () => fetch("/api/engineering-changes").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/engineering-changes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/engineering-changes"] });
      setNewCR({ crId: "", title: "", changeType: "design", impactedParts: "", status: "submitted" });
      toast({ title: "Change request created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/engineering-changes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/engineering-changes"] });
      toast({ title: "CR deleted" });
    },
  });

  const approved = changes.filter((c: any) => c.status === "approved").length;
  const pending = changes.filter((c: any) => c.status === "submitted" || c.status === "under-review").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          PLM & Engineering Change Control
        </h1>
        <p className="text-muted-foreground mt-2">ECO/CR workflows, DRB reviews, BOM versioning, and document management</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total CRs</p>
            <p className="text-2xl font-bold">{changes.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
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
            <p className="text-xs text-muted-foreground">Approval Rate</p>
            <p className="text-2xl font-bold">{changes.length > 0 ? ((approved / changes.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-cr">
        <CardHeader><CardTitle className="text-base">Submit Change Request</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="CR ID" value={newCR.crId} onChange={(e) => setNewCR({ ...newCR, crId: e.target.value })} data-testid="input-crid" className="text-sm" />
            <Input placeholder="Title" value={newCR.title} onChange={(e) => setNewCR({ ...newCR, title: e.target.value })} data-testid="input-title" className="text-sm" />
            <Select value={newCR.changeType} onValueChange={(v) => setNewCR({ ...newCR, changeType: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="process">Process</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Impacted Parts" value={newCR.impactedParts} onChange={(e) => setNewCR({ ...newCR, impactedParts: e.target.value })} data-testid="input-parts" className="text-sm" />
            <Button disabled={createMutation.isPending || !newCR.crId} size="sm" data-testid="button-submit-cr">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Change Requests</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : changes.length === 0 ? <p className="text-muted-foreground text-center py-4">No requests</p> : changes.map((c: any) => (
            <div key={c.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`cr-${c.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{c.crId} - {c.title}</p>
                <p className="text-xs text-muted-foreground">{c.changeType} • {c.impactedParts}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={c.status === "approved" ? "default" : "secondary"} className="text-xs">{c.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${c.id}`} className="h-7 w-7">
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
