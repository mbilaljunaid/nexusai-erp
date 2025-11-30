import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";

export default function CommunicationCenter() {
  const communications = [
    { id: "c1", type: "Email", recipient: "customer@example.com", subject: "Order Confirmation", status: "sent" },
    { id: "c2", type: "SMS", recipient: "+1234567890", subject: "Delivery Alert", status: "sent" },
    { id: "c3", type: "Push", recipient: "Mobile App", subject: "New Offer", status: "pending" },
  ];
  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><Send className="h-8 w-8" />Communication Center</h1><p className="text-muted-foreground mt-2">Manage multi-channel communications</p></div>
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Messages</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Sent</p><p className="text-2xl font-bold text-green-600">2</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-600">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Delivery Rate</p><p className="text-2xl font-bold">98%</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Recent Communications</CardTitle></CardHeader><CardContent className="space-y-3">{communications.map((c) => (<div key={c.id} className="p-3 border rounded-lg hover-elevate" data-testid={`comm-${c.id}`}><div className="flex justify-between mb-2"><h3 className="font-semibold">{c.subject}</h3><Badge variant={c.status === "sent" ? "default" : "secondary"}>{c.status}</Badge></div><p className="text-sm text-muted-foreground">Type: {c.type} • To: {c.recipient}</p></div>))}</CardContent></Card>
    </div>
  );
}
