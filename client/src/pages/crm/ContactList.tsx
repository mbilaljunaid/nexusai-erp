import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface Contact {
    id: string;
    name: string;
    company: string;
    title: string;
    email: string;
    phone: string;
    status?: string;
}

export default function ContactList() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [newContact, setNewContact] = useState<Partial<Contact>>({ name: "", company: "", title: "", email: "", phone: "" });
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const { data: contacts = [], isLoading } = useQuery<Contact[]>({
        queryKey: ["/api/crm/contacts"],
        queryFn: () => fetch("/api/crm/contacts").then(r => r.json()).catch(() => []),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/crm/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/contacts"] });
            setNewContact({ name: "", company: "", title: "", email: "", phone: "" });
            setIsSheetOpen(false);
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

    const columns: Column<Contact>[] = [
        { header: "Name", accessorKey: "name", cell: (row) => <div className="font-semibold">{row.name}<div className="text-xs text-muted-foreground">{row.title}</div></div> },
        { header: "Company", accessorKey: "company" },
        {
            header: "Contact", id: "contact", cell: (row) => (
                <div className="flex flex-col text-xs">
                    {row.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {row.email}</div>}
                    {row.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {row.phone}</div>}
                </div>
            )
        },
        {
            header: "Actions", id: "actions", cell: (row) => (
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(row.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            )
        }
    ];

    return (
        <StandardPage
            title="Contact Management"
            description="Manage B2B contacts and key stakeholders."
            breadcrumbs={[{ label: "CRM", href: "/crm" }, { label: "Contacts" }]}
            actions={
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Contact</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader><SheetTitle>Add Contact</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2"><Label>Name</Label><Input value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Company</Label><Input value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Title</Label><Input value={newContact.title} onChange={(e) => setNewContact({ ...newContact, title: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Email</Label><Input value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Phone</Label><Input value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} /></div>
                            <Button onClick={() => createMutation.mutate(newContact)} className="w-full">Save Contact</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            }
        >
            <StandardTable
                data={contacts}
                columns={columns}
                isLoading={isLoading}
                keyExtractor={(item) => item.id || Math.random().toString()}
                filterColumn="name"
                filterPlaceholder="Search contacts..."
            />
        </StandardPage>
    );
}
