import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FrontDeskOperations() {
  const { toast } = useToast();
  const [newFolio, setNewFolio] = useState({ folioId: "", guestName: "", roomId: "", checkIn: "", status: "checked-in" });

  const { data: folios = [], isLoading } = useQuery({
    queryKey: ["/api/hospitality-folios"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/hospitality-folios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-folios"] });
      setNewFolio({ folioId: "", guestName: "", roomId: "", checkIn: "", status: "checked-in" });
      toast({ title: "Guest checked in" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/hospitality-folios/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-folios"] });
      toast({ title: "Folio deleted" });
    }
  });

  const checkedIn = folios.filter((f: any) => f.status === "checked-in").length;
  const checkedOut = folios.filter((f: any) => f.status === "checked-out").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Key className="h-8 w-8" />
          Front Desk & Guest Folios
        </h1>
        <p className="text-muted-foreground mt-2">Check-in/check-out, guest folios, incidental charges, and settlements</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Folios</p>
            <p className="text-2xl font-bold">{folios.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Checked-In</p>
            <p className="text-2xl font-bold text-green-600">{checkedIn}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Checked-Out</p>
            <p className="text-2xl font-bold text-blue-600">{checkedOut}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Occupancy</p>
            <p className="text-2xl font-bold">{checkedIn}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-folio">
        <CardHeader><CardTitle className="text-base">Check-in Guest</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Folio ID" value={newFolio.folioId} onChange={(e) => setNewFolio({ ...newFolio, folioId: e.target.value })} data-testid="input-folioid" className="text-sm" />
            <Input placeholder="Guest Name" value={newFolio.guestName} onChange={(e) => setNewFolio({ ...newFolio, guestName: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Room ID" value={newFolio.roomId} onChange={(e) => setNewFolio({ ...newFolio, roomId: e.target.value })} data-testid="input-roomid" className="text-sm" />
            <Input placeholder="Check-in" type="date" value={newFolio.checkIn} onChange={(e) => setNewFolio({ ...newFolio, checkIn: e.target.value })} data-testid="input-checkin" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newFolio)} disabled={createMutation.isPending || !newFolio.folioId} size="sm" data-testid="button-checkin">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Guest Folios</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : folios.length === 0 ? <p className="text-muted-foreground text-center py-4">No folios</p> : folios.map((f: any) => (
            <div key={f.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`folio-${f.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{f.folioId} - {f.guestName}</p>
                <p className="text-xs text-muted-foreground">Room: {f.roomId}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={f.status === "checked-in" ? "default" : "secondary"} className="text-xs">{f.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(f.id)} data-testid={`button-delete-${f.id}`} className="h-7 w-7">
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
