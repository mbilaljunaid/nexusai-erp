import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EventBanquetingManagement() {
  const { toast } = useToast();
  const [newEvent, setNewEvent] = useState({ eventId: "", eventName: "", venue: "", pax: "100", status: "proposal" });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/hospitality-events"],
    queryFn: () => fetch("/api/hospitality-events").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/hospitality-events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-events"] });
      setNewEvent({ eventId: "", eventName: "", venue: "", pax: "100", status: "proposal" });
      toast({ title: "Event created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/hospitality-events/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hospitality-events"] });
      toast({ title: "Event deleted" });
    },
  });

  const confirmed = events.filter((e: any) => e.status === "confirmed").length;
  const executed = events.filter((e: any) => e.status === "executed").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8" />
          Events, Banqueting & MICE Management
        </h1>
        <p className="text-muted-foreground mt-2">Event proposals, BEOs, resource booking, and event billing</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Events</p>
            <p className="text-2xl font-bold">{events.length}</p>
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
            <p className="text-xs text-muted-foreground">Executed</p>
            <p className="text-2xl font-bold text-blue-600">{executed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Pax</p>
            <p className="text-2xl font-bold">{events.reduce((sum: number, e: any) => sum + (parseInt(e.pax) || 0), 0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-event">
        <CardHeader><CardTitle className="text-base">Create Event</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Event ID" value={newEvent.eventId} onChange={(e) => setNewEvent({ ...newEvent, eventId: e.target.value })} data-testid="input-eid" className="text-sm" />
            <Input placeholder="Event Name" value={newEvent.eventName} onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Venue" value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} data-testid="input-venue" className="text-sm" />
            <Input placeholder="Pax" type="number" value={newEvent.pax} onChange={(e) => setNewEvent({ ...newEvent, pax: e.target.value })} data-testid="input-pax" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newEvent)} disabled={createMutation.isPending || !newEvent.eventId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Events</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : events.length === 0 ? <p className="text-muted-foreground text-center py-4">No events</p> : events.map((e: any) => (
            <div key={e.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`event-${e.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{e.eventId} - {e.eventName}</p>
                <p className="text-xs text-muted-foreground">{e.venue} • {e.pax} pax</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={e.status === "executed" ? "default" : "secondary"} className="text-xs">{e.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(e.id)} data-testid={`button-delete-${e.id}`} className="h-7 w-7">
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
