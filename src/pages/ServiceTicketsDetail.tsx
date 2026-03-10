import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { ServiceTicketForm } from "@/components/forms/ServiceTicketForm";
import { ContextualSearch } from "@/components/ContextualSearch";

export default function ServiceTicketsDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: tickets = [] } = useQuery<any[]>({ queryKey: ["/api/service-tickets"], retry: false });

  return (
    <StandardPage
      title="Service Tickets"
      description="Search, view, and create support tickets"
      breadcrumbs={[
        { label: 'Service Dashboard', href: '/service' },
        { label: 'Service Tickets' }
      ]}
    >
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <ContextualSearch
              placeholder="Search tickets..."
              fields={[{ key: "title", label: "Ticket Title", type: "text" }]}
              onSearch={(filters) => setSearchQuery(filters.title || "")}
            />
          </div>
          <Button>+ New Ticket</Button>
        </div>

        <div className="space-y-2">
          {((tickets || []) as any).filter((t: any) => (t.title || "").toLowerCase().includes(searchQuery.toLowerCase())).map((t: any, idx: number) => (
            <Card key={idx} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">{t.title}</p><p className="text-sm text-muted-foreground">{t.description}</p></div><Badge>{t.status}</Badge></div></CardContent></Card>
          ))}
        </div>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">+ Add New Ticket</h2>
          <ServiceTicketForm />
        </div>
      </div>
    </StandardPage>
  );
}
