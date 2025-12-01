import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CommunicationCenter() {
  const { toast } = useToast();
  const [newComm, setNewComm] = useState({ commType: "Email", recipient: "", subject: "" });

  const { data: communications = [], isLoading } = useQuery({
    queryKey: ["/api/communications"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/communications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communications"] });
      setNewComm({ commType: "Email", recipient: "", subject: "" });
      toast({ title: "Message sent" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/communications/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communications"] });
      toast({ title: "Message deleted" });
    }
  });

  const metrics = {
    total: communications.length
    sent: communications.filter((c: any) => c.status === "sent").length
    pending: communications.filter((c: any) => c.status === "pending").length
    deliveryRate: communications.length > 0 ? Math.round((communications.filter((c: any) => c.status === "sent").length / communications.length) * 100) : 0
  };

  return (
    <div className="space-y-6 p-4" data-testid="communication-center">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Send className="h-8 w-8" />Communication Center</h1>
        <p className="text-muted-foreground mt-2">Manage multi-channel communications</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3" data-testid="card-total-messages">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Messages</p>
            <p className="text-2xl font-bold">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-sent">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Sent</p>
            <p className="text-2xl font-bold text-green-600">{metrics.sent}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-pending">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{metrics.pending}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-delivery-rate">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Delivery Rate</p>
            <p className="text-2xl font-bold">{metrics.deliveryRate}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-message">
        <CardHeader>
          <CardTitle className="text-base">Send Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Select value={newComm.commType} onValueChange={(v) => setNewComm({ ...newComm, commType: v })}>
              <SelectTrigger data-testid="select-comm-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="Push">Push</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Recipient" value={newComm.recipient} onChange={(e) => setNewComm({ ...newComm, recipient: e.target.value })} data-testid="input-recipient" />
            <Input placeholder="Subject" value={newComm.subject} onChange={(e) => setNewComm({ ...newComm, subject: e.target.value })} data-testid="input-subject" />
          </div>
          <Button onClick={() => createMutation.mutate(newComm)} disabled={createMutation.isPending || !newComm.recipient} className="w-full" data-testid="button-send">
            <Send className="w-4 h-4 mr-2" /> Send Message
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Communications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : communications.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No messages sent</div>
          ) : (
            communications.map((c: any) => (
              <div key={c.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`comm-item-${c.id}`}>
                <div className="flex-1">
                  <h3 className="font-semibold">{c.subject}</h3>
                  <p className="text-sm text-muted-foreground">Type: {c.commType} • To: {c.recipient}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={c.status === "sent" ? "default" : "secondary"}>{c.status}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-${c.id}`}>
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
