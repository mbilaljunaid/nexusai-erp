import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ContactManagement() {
  const { toast } = useToast();
  const [newContact, setNewContact] = useState({ name: "", company: "", title: "", email: "", phone: "" });

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["/api/crm/contacts"],
    queryFn: () => fetch("/api/crm/contacts").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/crm/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/contacts"] });
      setNewContact({ name: "", company: "", title: "", email: "", phone: "" });
      toast({ title: "Contact added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/crm/contacts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/contacts"] });
      toast({ title: "Contact deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Contact Management
        </h1>
        <p className="text-muted-foreground mt-2">Manage customer contacts and relationships</p>
      </div>

      <Card data-testid="card-new-contact">
        <CardHeader><CardTitle className="text-base">Add Contact</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <Input placeholder="Name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} data-testid="input-name" />
            <Input placeholder="Company" value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} data-testid="input-company" />
            <Input placeholder="Title" value={newContact.title} onChange={(e) => setNewContact({ ...newContact, title: e.target.value })} data-testid="input-title" />
            <Input placeholder="Email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} data-testid="input-email" />
            <Input placeholder="Phone" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} data-testid="input-phone" />
          </div>
          <Button onClick={() => createMutation.mutate(newContact)} disabled={createMutation.isPending || !newContact.name} className="w-full" data-testid="button-add-contact">
            <Plus className="h-4 w-4 mr-2" /> Add Contact
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Contacts</p><p className="text-2xl font-bold">{contacts.length}</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{contacts.filter((c: any) => c.status === "active").length}</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Companies</p><p className="text-2xl font-bold">3</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Contact List</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : contacts.length === 0 ? <p className="text-muted-foreground text-center py-4">No contacts</p> : contacts.map((contact: any) => (
            <div key={contact.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`contact-${contact.id}`}>
              <div className="flex-1">
                <h3 className="font-semibold">{contact.name}</h3>
                <p className="text-sm text-muted-foreground">Company: {contact.company} • Email: {contact.email} • Phone: {contact.phone}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="default">{contact.title}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(contact.id)} data-testid={`button-delete-${contact.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
