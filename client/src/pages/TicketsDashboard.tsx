import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

export default function TicketsDashboard() {
  const { data: tickets = [] } = useQuery<any[]>({ queryKey: ["/api/support/tickets"] });
  const open = tickets.filter((t: any) => t.status === "open").length;
  const resolved = tickets.filter((t: any) => t.status === "resolved").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><MessageCircle className="w-8 h-8" />Support Tickets</h1>
        <p className="text-muted-foreground">Manage customer support requests</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Tickets</p><p className="text-2xl font-bold">{tickets.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Open</p><p className="text-2xl font-bold text-red-600">{open}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Resolved</p><p className="text-2xl font-bold text-green-600">{resolved}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Recent Tickets</CardTitle></CardHeader><CardContent><div className="space-y-2">{tickets.map((t: any) => (<div key={t.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{t.title}</p><p className="text-sm text-muted-foreground">{t.customerName}</p></div><Badge variant={t.status === "open" ? "destructive" : "outline"}>{t.status}</Badge></div>))}</div></CardContent></Card>
    </div>
  );
}
