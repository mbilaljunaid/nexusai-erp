import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";

export default function ContactManagement() {
  const contacts = [
    { id: "co1", name: "Alice Johnson", company: "Acme Corp", title: "CTO", email: "alice@acme.com", phone: "+1-555-0101", status: "active" },
    { id: "co2", name: "Bob Smith", company: "Global Industries", title: "Procurement Manager", email: "bob@global.com", phone: "+1-555-0102", status: "active" },
    { id: "co3", name: "Carol Davis", company: "StartUp Labs", title: "CEO", email: "carol@startup.com", phone: "+1-555-0103", status: "active" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Contact Management
        </h1>
        <p className="text-muted-foreground mt-2">Manage customer contacts and relationships</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-add-contact">
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Contacts</p><p className="text-2xl font-bold">{contacts.length}</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{contacts.filter(c => c.status === "active").length}</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Companies</p><p className="text-2xl font-bold">3</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Contact List</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="p-3 border rounded-lg hover-elevate" data-testid={`contact-${contact.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{contact.name}</h3>
                <Badge variant="default">{contact.title}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Company: {contact.company} • Email: {contact.email} • Phone: {contact.phone}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
