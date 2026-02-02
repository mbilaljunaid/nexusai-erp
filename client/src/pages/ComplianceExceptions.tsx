import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ComplianceExceptions() {
  const { toast } = useToast();
  const [newException, setNewException] = useState({ rule: "", user: "", reason: "", status: "pending" });

  const { data: exceptions = [], isLoading } = useQuery({
    queryKey: ["/api/compliance/exceptions"],
    queryFn: () => fetch("/api/compliance/exceptions").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/compliance/exceptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/exceptions"] });
      setNewException({ rule: "", user: "", reason: "", status: "pending" });
      toast({ title: "Exception requested" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/compliance/exceptions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/exceptions"] });
      toast({ title: "Exception deleted" });
    },
  });

  const pending = exceptions.filter((e: any) => e.status === "pending").length;
  const approved = exceptions.filter((e: any) => e.status === "approved").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertCircle className="h-8 w-8" />
          Compliance Exceptions
        </h1>
        <p className="text-muted-foreground mt-2">Manage compliance rule exceptions and approvals</p>
      </div>

      <Card data-testid="card-new-exception">
        <CardHeader><CardTitle className="text-base">Request Exception</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Rule name" value={newException.rule} onChange={(e) => setNewException({ ...newException, rule: e.target.value })} data-testid="input-rule" />
            <Input placeholder="User" value={newException.user} onChange={(e) => setNewException({ ...newException, user: e.target.value })} data-testid="input-user" />
            <Input placeholder="Reason" value={newException.reason} onChange={(e) => setNewException({ ...newException, reason: e.target.value })} data-testid="input-reason" />
            <Select value={newException.status} onValueChange={(v) => setNewException({ ...newException, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newException)} disabled={createMutation.isPending || !newException.rule} className="w-full gap-2" data-testid="button-request-exception">
            <Plus className="h-4 w-4" />
            Request Exception
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Exceptions</p><p className="text-2xl font-bold">{exceptions.length}</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Pending Approval</p><p className="text-2xl font-bold text-yellow-600">{pending}</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Approved</p><p className="text-2xl font-bold text-green-600">{approved}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Exception Requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : exceptions.length === 0 ? <p className="text-muted-foreground text-center py-4">No exceptions</p> : exceptions.map((exc: any) => (
            <div key={exc.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`exception-${exc.id}`}>
              <div>
                <h3 className="font-semibold text-sm">{exc.rule}</h3>
                <p className="text-sm text-muted-foreground">User: {exc.user} • Reason: {exc.reason}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={exc.status === "approved" ? "default" : "secondary"}>{exc.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(exc.id)} data-testid={`button-delete-${exc.id}`}>
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
