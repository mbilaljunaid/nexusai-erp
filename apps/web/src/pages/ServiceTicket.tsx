import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";

export default function ServiceTicket() {
  const { data: tickets = [] } = useQuery({ queryKey: ["/api/service-tickets"] });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Service Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage customer support requests</p>
        </div>
        <Button data-testid="button-new-ticket"><Plus className="h-4 w-4 mr-2" />New Ticket</Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tickets..." className="pl-10" data-testid="input-search" />
        </div>
      </div>

      <div className="grid gap-4">
        {[
          { id: "TK-001", title: "Login issue", customer: "Acme Corp", status: "Open", priority: "High" },
          { id: "TK-002", title: "Report generation", customer: "Global Inc", status: "In Progress", priority: "Medium" },
          { id: "TK-003", title: "Feature request", customer: "TechStart", status: "Resolved", priority: "Low" },
        ].map((ticket) => (
          <Card key={ticket.id} className="hover:bg-muted/50 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{ticket.id}: {ticket.title}</p>
                  <p className="text-sm text-muted-foreground">{ticket.customer}</p>
                </div>
                <div className="text-right">
                  <Badge className={ticket.priority === "High" ? "bg-red-100 text-red-800" : ticket.priority === "Medium" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}>{ticket.priority}</Badge>
                  <Badge className="ml-2 bg-green-100 text-green-800">{ticket.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
