import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { FormDialog } from "@/components/FormDialog";

export default function ContactDirectory() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const { data: contacts = [] } = useQuery<any[]>({ queryKey: ["/api/contacts"] });
  const formMetadata = getFormMetadata("contact");

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground mt-1">Manage all contacts and relationships</p>
        </div>
        <SmartAddButton formMetadata={formMetadata} onClick={() => setShowForm(true)} />
      </div>

      <FormSearchWithMetadata
        formMetadata={formMetadata}
        value={searchQuery}
        onChange={setSearchQuery}
        data={contacts}
        onFilter={setFilteredContacts}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContacts.length > 0 ? filteredContacts.map((contact: any) => (
          <Card key={contact.id} className="hover:shadow-lg transition">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg">{contact.name}</h3>
              <p className="text-sm text-muted-foreground">{contact.company || "—"}</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4" />{contact.email}</div>
                <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4" />{contact.phone || "—"}</div>
              </div>
              <Badge className="mt-3">Active</Badge>
            </CardContent>
          </Card>
        )) : <Card><CardContent className="p-4"><p className="text-muted-foreground">No contacts found</p></CardContent></Card>}
      </div>

      <FormDialog isOpen={showForm} onOpenChange={setShowForm} formId="contact" formTitle="Add Contact" formDescription="Create a new contact" />
    </div>
  );
}
