import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ExceptionManagement() {
  const { toast } = useToast();
  const [newException, setNewException] = useState({ module: "Finance", variance: "", status: "pending", severity: "medium" });

  const { data: exceptions = [], isLoading } = useQuery({
    queryKey: ["/api/exceptions"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/exceptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exceptions"] });
      setNewException({ module: "Finance", variance: "", status: "pending", severity: "medium" });
      toast({ title: "Exception created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/exceptions/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exceptions"] });
      toast({ title: "Exception deleted" });
    }
  });

  const criticalCount = exceptions.filter((e: any) => e.severity === "critical").length;
  const reviewedCount = exceptions.filter((e: any) => e.status === "reviewed").length;
  const totalVariance = exceptions.reduce((sum: number, e: any) => sum + (parseFloat(e.variance) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8" />
          Exception Management
        </h1>
        <p className="text-muted-foreground mt-2">Track and manage variance and exception items</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Exceptions</p>
            <p className="text-2xl font-bold">{exceptions.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Reviewed</p>
            <p className="text-2xl font-bold text-green-600">{reviewedCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Variance</p>
            <p className="text-2xl font-bold font-mono">${(totalVariance / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-exception">
        <CardHeader><CardTitle className="text-base">Create Exception</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Select value={newException.module} onValueChange={(v) => setNewException({ ...newException, module: v })}>
              <SelectTrigger data-testid="select-module"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="CRM">CRM</SelectItem>
                <SelectItem value="Projects">Projects</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Variance Amount" type="number" value={newException.variance} onChange={(e) => setNewException({ ...newException, variance: e.target.value })} data-testid="input-variance" />
            <Select value={newException.severity} onValueChange={(v) => setNewException({ ...newException, severity: v })}>
              <SelectTrigger data-testid="select-severity"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newException.status} onValueChange={(v) => setNewException({ ...newException, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newException)} disabled={createMutation.isPending || !newException.variance} className="w-full" data-testid="button-create-exception">
            <Plus className="w-4 h-4 mr-2" /> Create Exception
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Exception List</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : exceptions.length === 0 ? <p className="text-muted-foreground text-center py-4">No exceptions</p> : exceptions.map((e: any) => (
            <div key={e.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`exception-${e.id}`}>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{e.module}</h3>
                <p className="text-xs text-muted-foreground">Variance: ${e.variance} • Status: {e.status}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={e.severity === "critical" ? "destructive" : e.severity === "high" ? "secondary" : "default"}>{e.severity}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(e.id)} data-testid={`button-delete-${e.id}`}>
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
