import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GuestCRMManagement() {
  const { toast } = useToast();
  const [newGuest, setNewGuest] = useState({ guestId: "", name: "", email: "", tier: "standard", points: "0" });

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ["/api/hospitality-guests"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/hospitality-guests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-guests"] });
      setNewGuest({ guestId: "", name: "", email: "", tier: "standard", points: "0" });
      toast({ title: "Guest profile created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/hospitality-guests/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-guests"] });
      toast({ title: "Guest deleted" });
    }
  });

  const vip = guests.filter((g: any) => g.tier === "vip").length;
  const totalPoints = guests.reduce((sum: number, g: any) => sum + (parseInt(g.points) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="h-8 w-8" />
          Guest CRM & Loyalty Management
        </h1>
        <p className="text-muted-foreground mt-2">Guest profiles, preferences, loyalty programs, and personalization</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Guests</p>
            <p className="text-2xl font-bold">{guests.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">VIP</p>
            <p className="text-2xl font-bold text-purple-600">{vip}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Points</p>
            <p className="text-2xl font-bold">{(totalPoints / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Points</p>
            <p className="text-2xl font-bold">{guests.length > 0 ? (totalPoints / guests.length).toFixed(0) : 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-guest">
        <CardHeader><CardTitle className="text-base">Add Guest</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Guest ID" value={newGuest.guestId} onChange={(e) => setNewGuest({ ...newGuest, guestId: e.target.value })} data-testid="input-gid" className="text-sm" />
            <Input placeholder="Name" value={newGuest.name} onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Email" value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} data-testid="input-email" className="text-sm" />
            <Input placeholder="Points" type="number" value={newGuest.points} onChange={(e) => setNewGuest({ ...newGuest, points: e.target.value })} data-testid="input-points" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newGuest)} disabled={createMutation.isPending || !newGuest.guestId} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Guests</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : guests.length === 0 ? <p className="text-muted-foreground text-center py-4">No guests</p> : guests.map((g: any) => (
            <div key={g.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`guest-${g.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{g.guestId} - {g.name}</p>
                <p className="text-xs text-muted-foreground">{g.email} • {g.points} points</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={g.tier === "vip" ? "default" : "secondary"} className="text-xs">{g.tier}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(g.id)} data-testid={`button-delete-${g.id}`} className="h-7 w-7">
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
