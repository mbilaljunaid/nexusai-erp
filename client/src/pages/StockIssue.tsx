import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StockIssue() {
  const { toast } = useToast();
  const [newIssue, setNewIssue] = useState({ item: "Item A", quantity: "", location: "Bin-01", reason: "sales" });

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["/api/stock-issue"],
    queryFn: () => fetch("/api/stock-issue").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/stock-issue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-issue"] });
      setNewIssue({ item: "Item A", quantity: "", location: "Bin-01", reason: "sales" });
      toast({ title: "Stock issue created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/stock-issue/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-issue"] });
      toast({ title: "Issue deleted" });
    },
  });

  const totalIssued = issues.reduce((sum: number, i: any) => sum + (parseFloat(i.quantity) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ArrowUp className="h-8 w-8" />
          Stock Issues
        </h1>
        <p className="text-muted-foreground mt-2">Record inventory withdrawals and issues</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Issues</p>
            <p className="text-2xl font-bold">{issues.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Qty Issued</p>
            <p className="text-2xl font-bold">{totalIssued}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Per Issue</p>
            <p className="text-2xl font-bold">{issues.length > 0 ? (totalIssued / issues.length).toFixed(0) : "0"}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-issue">
        <CardHeader><CardTitle className="text-base">Issue Stock</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Select value={newIssue.item} onValueChange={(v) => setNewIssue({ ...newIssue, item: v })}>
              <SelectTrigger data-testid="select-item"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Item A">Item A</SelectItem>
                <SelectItem value="Item B">Item B</SelectItem>
                <SelectItem value="Item C">Item C</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Quantity" type="number" value={newIssue.quantity} onChange={(e) => setNewIssue({ ...newIssue, quantity: e.target.value })} data-testid="input-qty" />
            <Input placeholder="Location" value={newIssue.location} onChange={(e) => setNewIssue({ ...newIssue, location: e.target.value })} data-testid="input-location" />
            <Select value={newIssue.reason} onValueChange={(v) => setNewIssue({ ...newIssue, reason: v })}>
              <SelectTrigger data-testid="select-reason"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="scrap">Scrap</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newIssue)} disabled={createMutation.isPending || !newIssue.quantity} className="w-full" data-testid="button-create-issue">
            <Plus className="w-4 h-4 mr-2" /> Create Issue
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Issues</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : issues.length === 0 ? <p className="text-muted-foreground text-center py-4">No issues</p> : issues.map((i: any) => (
            <div key={i.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`issue-${i.id}`}>
              <div>
                <p className="font-semibold text-sm">{i.item}</p>
                <p className="text-xs text-muted-foreground">{i.quantity} qty from {i.location}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="secondary">{i.reason}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(i.id)} data-testid={`button-delete-${i.id}`}>
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
