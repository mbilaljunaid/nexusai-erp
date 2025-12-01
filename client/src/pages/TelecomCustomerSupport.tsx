import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Headphones, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TelecomCustomerSupport() {
  const { toast } = useToast();
  const [newTicket, setNewTicket] = useState({ ticketId: "", subscriberId: "", category: "billing", priority: "normal", status: "open" });

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["/api/telecom-tickets"],
    queryFn: () => fetch("/api/telecom-tickets").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/telecom-tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telecom-tickets"] });
      setNewTicket({ ticketId: "", subscriberId: "", category: "billing", priority: "normal", status: "open" });
      toast({ title: "Support ticket created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/telecom-tickets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telecom-tickets"] });
      toast({ title: "Ticket deleted" });
    },
  });

  const resolved = tickets.filter((t: any) => t.status === "resolved").length;
  const critical = tickets.filter((t: any) => t.priority === "critical").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Headphones className="h-8 w-8" />
          Customer Support & Ticket Management
        </h1>
        <p className="text-muted-foreground mt-2">Customer complaints, support tickets, and issue resolution</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Tickets</p>
            <p className="text-2xl font-bold">{tickets.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-yellow-600">{tickets.filter((t: any) => t.status === "open").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{resolved}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold text-red-600">{critical}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-ticket">
        <CardHeader><CardTitle className="text-base">Create Support Ticket</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Ticket ID" value={newTicket.ticketId} onChange={(e) => setNewTicket({ ...newTicket, ticketId: e.target.value })} data-testid="input-tid" className="text-sm" />
            <Input placeholder="Subscriber ID" value={newTicket.subscriberId} onChange={(e) => setNewTicket({ ...newTicket, subscriberId: e.target.value })} data-testid="input-subid" className="text-sm" />
            <Select value={newTicket.category} onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}>
              <SelectTrigger data-testid="select-category" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}>
              <SelectTrigger data-testid="select-priority" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newTicket)} disabled={createMutation.isPending || !newTicket.ticketId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Tickets</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : tickets.length === 0 ? <p className="text-muted-foreground text-center py-4">No tickets</p> : tickets.map((t: any) => (
            <div key={t.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`ticket-${t.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{t.ticketId}</p>
                <p className="text-xs text-muted-foreground">{t.subscriberId} • {t.category}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={t.priority === "critical" ? "destructive" : "secondary"} className="text-xs">{t.priority}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(t.id)} data-testid={`button-delete-${t.id}`} className="h-7 w-7">
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
