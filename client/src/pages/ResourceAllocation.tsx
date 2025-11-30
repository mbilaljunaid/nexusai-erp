import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ResourceAllocation() {
  const { toast } = useToast();
  const [newResource, setNewResource] = useState({ resourceName: "", role: "Developer", allocation: "" });

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["/api/resources"],
    queryFn: () => fetch("/api/resources").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/resources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setNewResource({ resourceName: "", role: "Developer", allocation: "" });
      toast({ title: "Resource added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/resources/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({ title: "Resource deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4" data-testid="resource-allocation">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Users className="h-8 w-8" />Resource Allocation</h1>
        <p className="text-muted-foreground mt-1">Manage team resources and allocations</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card data-testid="card-total-resources"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Resources</p><p className="text-3xl font-bold">{resources.length}</p></CardContent></Card>
        <Card data-testid="card-allocated"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Fully Allocated</p><p className="text-3xl font-bold text-green-600">{resources.filter((r: any) => r.allocation === "100").length}</p></CardContent></Card>
        <Card data-testid="card-available"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Available</p><p className="text-3xl font-bold text-blue-600">{resources.filter((r: any) => r.allocation < "100").length}</p></CardContent></Card>
      </div>

      <Card data-testid="card-new-resource">
        <CardHeader><CardTitle className="text-base">Add Resource</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Resource name" value={newResource.resourceName} onChange={(e) => setNewResource({ ...newResource, resourceName: e.target.value })} data-testid="input-resource-name" />
            <Select value={newResource.role} onValueChange={(v) => setNewResource({ ...newResource, role: v })}>
              <SelectTrigger data-testid="select-role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Developer">Developer</SelectItem>
                <SelectItem value="Designer">Designer</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Allocation %" type="number" value={newResource.allocation} onChange={(e) => setNewResource({ ...newResource, allocation: e.target.value })} data-testid="input-allocation" />
          </div>
          <Button onClick={() => createMutation.mutate(newResource)} disabled={createMutation.isPending || !newResource.resourceName} className="w-full" data-testid="button-create-resource">
            <Plus className="w-4 h-4 mr-2" /> Add Resource
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Resources</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <p>Loading...</p>
          ) : resources.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No resources</p>
          ) : (
            resources.map((res: any) => (
              <div key={res.id} className="flex items-center justify-between p-3 border rounded hover-elevate" data-testid={`resource-${res.id}`}>
                <div>
                  <p className="font-semibold">{res.resourceName}</p>
                  <p className="text-sm text-muted-foreground">{res.role}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge>{res.allocation}%</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(res.id)} data-testid={`button-delete-${res.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
