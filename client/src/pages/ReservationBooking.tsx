import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ReservationBooking() {
  const { toast } = useToast();
  const [newRes, setNewRes] = useState({ reservationId: "", guestName: "", checkIn: "", checkOut: "", roomType: "standard", status: "confirmed" });

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["/api/hospitality-reservations"],
    queryFn: () => fetch("/api/hospitality-reservations").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/hospitality-reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-reservations"] });
      setNewRes({ reservationId: "", guestName: "", checkIn: "", checkOut: "", roomType: "standard", status: "confirmed" });
      toast({ title: "Reservation created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/hospitality-reservations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-reservations"] });
      toast({ title: "Reservation deleted" });
    },
  });

  const confirmed = reservations.filter((r: any) => r.status === "confirmed").length;
  const pending = reservations.filter((r: any) => r.status === "pending").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Reservations & Booking Engine
        </h1>
        <p className="text-muted-foreground mt-2">Channel management, rate parity, group blocks, and amendments</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Reservations</p>
            <p className="text-2xl font-bold">{reservations.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">{confirmed}</p>
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
            <p className="text-xs text-muted-foreground">Occupancy %</p>
            <p className="text-2xl font-bold">{reservations.length > 0 ? ((confirmed / reservations.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-res">
        <CardHeader><CardTitle className="text-base">Create Reservation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Res ID" value={newRes.reservationId} onChange={(e) => setNewRes({ ...newRes, reservationId: e.target.value })} data-testid="input-resid" className="text-sm" />
            <Input placeholder="Guest Name" value={newRes.guestName} onChange={(e) => setNewRes({ ...newRes, guestName: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Check-in" type="date" value={newRes.checkIn} onChange={(e) => setNewRes({ ...newRes, checkIn: e.target.value })} data-testid="input-checkin" className="text-sm" />
            <Input placeholder="Check-out" type="date" value={newRes.checkOut} onChange={(e) => setNewRes({ ...newRes, checkOut: e.target.value })} data-testid="input-checkout" className="text-sm" />
            <Button disabled={createMutation.isPending || !newRes.reservationId} size="sm" data-testid="button-book">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Reservations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : reservations.length === 0 ? <p className="text-muted-foreground text-center py-4">No reservations</p> : reservations.map((r: any) => (
            <div key={r.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`res-${r.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{r.reservationId} - {r.guestName}</p>
                <p className="text-xs text-muted-foreground">{r.checkIn} → {r.checkOut} • {r.roomType}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={r.status === "confirmed" ? "default" : "secondary"} className="text-xs">{r.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${r.id}`} className="h-7 w-7">
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
