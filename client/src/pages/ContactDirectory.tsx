import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone } from "lucide-react";

export default function ContactDirectory() {
  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground mt-1">Manage all contacts and relationships</p>
        </div>
        <Button data-testid="button-new-contact"><Plus className="h-4 w-4 mr-2" />New Contact</Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." className="pl-10" data-testid="input-search" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "John Smith", account: "Acme Corp", role: "VP Sales", email: "john@acme.com", phone: "(555) 123-4567" },
          { name: "Sarah Johnson", account: "Global Inc", role: "CTO", email: "sarah@global.com", phone: "(555) 234-5678" },
          { name: "Mike Chen", account: "TechStart", role: "CEO", email: "mike@techstart.com", phone: "(555) 345-6789" },
          { name: "Lisa Park", account: "Acme Corp", role: "Procurement", email: "lisa@acme.com", phone: "(555) 456-7890" },
        ].map((contact) => (
          <Card key={contact.name} className="hover:shadow-lg transition">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg">{contact.name}</h3>
              <p className="text-sm text-muted-foreground">{contact.role} at {contact.account}</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />{contact.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />{contact.phone}
                </div>
              </div>
              <Badge className="mt-3">Active</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
