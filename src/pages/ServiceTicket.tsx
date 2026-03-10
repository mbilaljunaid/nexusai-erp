import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Plus, Search } from "lucide-react";
import { ContextualSearch } from "@/components/ContextualSearch";

export default function ServiceTicket() {
  const { data: tickets = [] } = useQuery<any[]>({ queryKey: ["/api/service-tickets"] });

  return (
    <StandardPage
      title="Service Tickets"
      description="Manage customer support requests"
    >
      <div className="flex justify-end mb-4">
        <Button data-testid="button-new-ticket"><Plus className="h-4 w-4 mr-2" />New Ticket</Button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <ContextualSearch
            placeholder="Search tickets..."
            fields={[{ key: "query", label: "Search", type: "text" }]}
            onSearch={() => { }}
          />
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
                  <StatusBadge status={ticket.priority} />
                  <StatusBadge status={ticket.status} className="ml-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
