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

export default function CustomerSubscriberManagement() {
  const { toast } = useToast();
  const [newSubscriber, setNewSubscriber] = useState({ subscriberId: "", name: "", email: "", phone: "", status: "active" });

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ["/api/telecom-subscribers"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/telecom-subscribers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telecom-subscribers"] });
      setNewSubscriber({ subscriberId: "", name: "", email: "", phone: "", status: "active" });
      toast({ title: "Subscriber created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/telecom-subscribers/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telecom-subscribers"] });
      toast({ title: "Subscriber deleted" });
    }
  });

  const active = subscribers.filter((s: any) => s.status === "active").length;
  const inactive = subscribers.filter((s: any) => s.status === "inactive").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Customer & Subscriber Management
        </h1>
        <p className="text-muted-foreground mt-2">Lifecycle management, onboarding, KYC, and customer profiles</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Subscribers</p>
            <p className="text-2xl font-bold">{subscribers.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{active}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{inactive}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Activation %</p>
            <p className="text-2xl font-bold">{subscribers.length > 0 ? ((active / subscribers.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-subscriber">
        <CardHeader><CardTitle className="text-base">Add Subscriber</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Subscriber ID" value={newSubscriber.subscriberId} onChange={(e) => setNewSubscriber({ ...newSubscriber, subscriberId: e.target.value })} data-testid="input-subid" className="text-sm" />
            <Input placeholder="Name" value={newSubscriber.name} onChange={(e) => setNewSubscriber({ ...newSubscriber, name: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Email" value={newSubscriber.email} onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })} data-testid="input-email" className="text-sm" />
            <Input placeholder="Phone" value={newSubscriber.phone} onChange={(e) => setNewSubscriber({ ...newSubscriber, phone: e.target.value })} data-testid="input-phone" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newSubscriber)} disabled={createMutation.isPending || !newSubscriber.subscriberId} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Subscribers</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : subscribers.length === 0 ? <p className="text-muted-foreground text-center py-4">No subscribers</p> : subscribers.map((s: any) => (
            <div key={s.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`subscriber-${s.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{s.subscriberId} - {s.name}</p>
                <p className="text-xs text-muted-foreground">{s.email} • {s.phone}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(s.id)} data-testid={`button-delete-${s.id}`} className="h-7 w-7">
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
