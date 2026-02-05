import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Search,
    ArrowLeft,
    Loader2,
    User,
    Plus,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Contact2,
    Users,
    Clock,
    MapPin,
    MoreVertical
} from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema, type InsertContact, type Contact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function ContactEntryForm({ onSuccess }: { onSuccess?: () => void }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const form = useForm<InsertContact>({
        resolver: zodResolver(insertContactSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            accountId: "", // Ideally a select
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: InsertContact) => {
            const res = await apiRequest("POST", "/api/crm/contacts", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Contact created successfully" });
            form.reset();
            queryClient.invalidateQueries({ queryKey: ["/api/crm/contacts"] });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const onSubmit = (data: InsertContact) => {
        createMutation.mutate(data);
    };

    return (
        <div className="space-y-6 pt-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" {...form.register("firstName")} placeholder="John" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input id="lastName" {...form.register("lastName")} placeholder="Doe" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" {...form.register("email")} placeholder="john@example.com" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" {...form.register("phone")} placeholder="+1 555..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" {...form.register("title")} placeholder="Manager" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Notes</Label>
                        <Textarea id="description" {...form.register("description")} placeholder="Additional notes..." />
                    </div>
                </div>

                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Contact
                </Button>
            </form>
        </div>
    );
}

function ContactDetailSheet({ contact, open, onOpenChange }: { contact: Contact | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    if (!contact) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl w-[90vw] overflow-y-auto">
                <SheetHeader className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                            <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                                {contact.firstName?.charAt(0)}{contact.lastName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <SheetTitle className="text-2xl font-bold">{contact.salutation} {contact.firstName} {contact.lastName}</SheetTitle>
                            <SheetDescription className="text-base">
                                {contact.title || "No Title"} {contact.department ? `• ${contact.department}` : ""}
                            </SheetDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="px-3 py-1 font-medium bg-muted/30 border-none">
                            <Mail className="h-3 w-3 mr-1" />
                            {contact.email || "No Email"}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1 font-medium bg-muted/30 border-none">
                            <Phone className="h-3 w-3 mr-1" />
                            {contact.phone || "No Phone"}
                        </Badge>
                    </div>
                </SheetHeader>

                <div className="space-y-8">
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Professional Info</h3>
                        <div className="grid grid-cols-2 gap-6 bg-muted/20 p-6 rounded-2xl border border-muted/50">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Account ID</p>
                                <p className="font-medium text-sm truncate">{contact.accountId || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Department</p>
                                <p className="font-medium">{contact.department || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Mobile</p>
                                <p className="font-medium">{contact.mobilePhone || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Home Phone</p>
                                <p className="font-medium">{contact.homePhone || "—"}</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Mailing Address</h3>
                        <div className="p-6 bg-muted/20 rounded-2xl border border-muted/50 flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                            <p className="text-sm leading-relaxed">
                                {contact.mailingStreet || "—"}<br />
                                {contact.mailingCity} {contact.mailingState} {contact.mailingPostalCode}<br />
                                {contact.mailingCountry}
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notes</h3>
                        <div className="p-6 bg-muted/20 rounded-2xl border border-muted/50">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.description || "No notes available."}</p>
                        </div>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default function ContactsDetail() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const { data: contacts = [], isLoading } = useQuery<Contact[]>({
        queryKey: ["/api/crm/contacts"],
        select: (data) => Array.isArray(data) ? data : []
    });

    const filteredContacts = contacts.filter(c =>
        (c.firstName && c.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const metrics = [
        { label: "Total Contacts", value: contacts.length, icon: Users, color: "text-blue-600" },
        { label: "New This Month", value: contacts.length > 0 ? 1 : 0, icon: Clock, color: "text-purple-600" },
        { label: "Active Deals", value: contacts.length > 0 ? 1 : 0, icon: Briefcase, color: "text-green-600" },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/crm">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
                        <p className="text-muted-foreground">Manage your business relationships and network.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="shadcn-button-premium">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Contact
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-md">
                            <SheetHeader>
                                <SheetTitle>Create New Contact</SheetTitle>
                                <SheetDescription>
                                    Add a new person to your contact database.
                                </SheetDescription>
                            </SheetHeader>
                            <ContactEntryForm />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.map((m, i) => (
                    <Card key={i} className="hover-elevate shadow-sm overflow-hidden group">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">{m.label}</p>
                                    <p className="text-3xl font-bold">{m.value}</p>
                                </div>
                                <div className={`p-2 rounded-xl bg-muted/50 group-hover:scale-110 transition-transform ${m.color}`}>
                                    <m.icon className="h-4 w-4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content area: Filters and Grid */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="relative flex-1 group max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search contacts by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-muted/30 border-none shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <Card key={i} className="h-48 animate-pulse bg-muted/20" />
                        ))}
                    </div>
                ) : filteredContacts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredContacts.map((c) => (
                            <Card
                                key={c.id}
                                className="hover-elevate group cursor-pointer border-muted/50 overflow-hidden"
                                onClick={() => setSelectedContact(c)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                            <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                                {c.firstName?.charAt(0)}{c.lastName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <MoreVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                                            {c.salutation} {c.firstName} {c.lastName}
                                        </h3>
                                        <p className="text-sm text-muted-foreground italic line-clamp-1">{c.title || "Contact"}</p>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-muted/50 flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground truncate font-medium">
                                            <Mail className="h-3 w-3" />
                                            <span>{c.email || "No email"}</span>
                                        </div>
                                        {c.phone && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Phone className="h-3 w-3" />
                                                <span>{c.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted/50">
                        <Contact2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <p className="text-lg font-medium text-muted-foreground">No contacts found</p>
                        <p className="text-sm text-muted-foreground mt-1">Add your first business contact to get started.</p>
                    </div>
                )}
            </div>

            <ContactDetailSheet
                contact={selectedContact}
                open={!!selectedContact}
                onOpenChange={(open) => !open && setSelectedContact(null)}
            />
        </div>
    );
}
