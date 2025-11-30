import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ShopFloorDataCollection() {
  const { toast } = useToast();
  const [newEvent, setNewEvent] = useState({ woId: "", operation: "", eventType: "start", qty: "100", status: "recorded" });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/shop-floor-events"],
    queryFn: () => fetch("/api/shop-floor-events").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/shop-floor-events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop-floor-events"] });
      setNewEvent({ woId: "", operation: "", eventType: "start", qty: "100", status: "recorded" });
      toast({ title: "Event recorded" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/shop-floor-events/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop-floor-events"] });
      toast({ title: "Event deleted" });
    },
  });

  const completed = events.filter((e: any) => e.eventType === "complete").length;
  const inProcess = events.filter((e: any) => e.eventType === "start" && !events.some((c: any) => c.woId === e.woId && c.eventType === "complete")).length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8" />
          Shop Floor Data Collection & MES
        </h1>
        <p className="text-muted-foreground mt-2">Operator terminal, work order tracking, scrap/yield, and real-time WIP</p>
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
            <p className="text-xs text-muted-foreground">In Process</p>
            <p className="text-2xl font-bold text-blue-600">{inProcess}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold">{events.length > 0 ? ((completed / events.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-event">
        <CardHeader><CardTitle className="text-base">Record Operation Event</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="WO ID" value={newEvent.woId} onChange={(e) => setNewEvent({ ...newEvent, woId: e.target.value })} data-testid="input-woid" className="text-sm" />
            <Input placeholder="Operation" value={newEvent.operation} onChange={(e) => setNewEvent({ ...newEvent, operation: e.target.value })} data-testid="input-op" className="text-sm" />
            <Select value={newEvent.eventType} onValueChange={(v) => setNewEvent({ ...newEvent, eventType: v })}>
              <SelectTrigger data-testid="select-event" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="pause">Pause</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Qty Produced" type="number" value={newEvent.qty} onChange={(e) => setNewEvent({ ...newEvent, qty: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newEvent)} disabled={createMutation.isPending || !newEvent.woId} size="sm" data-testid="button-record-event">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Events</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : events.length === 0 ? <p className="text-muted-foreground text-center py-4">No events</p> : events.map((e: any) => (
            <div key={e.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`event-${e.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{e.woId} - {e.operation}</p>
                <p className="text-xs text-muted-foreground">{e.qty} units</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={e.eventType === "complete" ? "default" : "secondary"} className="text-xs">{e.eventType}</Badge>
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
