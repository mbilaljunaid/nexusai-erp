import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, ArrowLeft, Loader2, User } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema, type InsertContact, type Contact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function ContactEntryForm() {
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
        <Card>
            <CardHeader>
                <CardTitle>Add New Contact</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Core Info */}
                        <div className="space-y-2">
                            <Label htmlFor="salutation">Salutation</Label>
                            <Input id="salutation" {...form.register("salutation")} placeholder="Mr./Ms." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accountId">Account ID</Label>
                            <Input id="accountId" {...form.register("accountId")} placeholder="Linked Account ID" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" {...form.register("firstName")} placeholder="John" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input id="lastName" {...form.register("lastName")} placeholder="Doe" />
                            {form.formState.errors.lastName && <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" {...form.register("title")} placeholder="Manager" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" {...form.register("department")} placeholder="Sales" />
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" {...form.register("email")} placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" {...form.register("phone")} placeholder="+1 555..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mobilePhone">Mobile</Label>
                            <Input id="mobilePhone" {...form.register("mobilePhone")} placeholder="+1 555..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="homePhone">Home Phone</Label>
                            <Input id="homePhone" {...form.register("homePhone")} placeholder="+1 555..." />
                        </div>

                        {/* Mailing Address */}
                        <div className="space-y-2 md:col-span-2">
                            <Label>Mailing Address</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input {...form.register("mailingStreet")} placeholder="Street" className="col-span-2" />
                                <Input {...form.register("mailingCity")} placeholder="City" />
                                <Input {...form.register("mailingState")} placeholder="State" />
                                <Input {...form.register("mailingPostalCode")} placeholder="Zip" />
                                <Input {...form.register("mailingCountry")} placeholder="Country" />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...form.register("description")} placeholder="Contact details..." />
                        </div>
                    </div>

                    <Button type="submit" disabled={createMutation.isPending} className="w-full">
                        {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Contact
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function ContactsDetail() {
    const [searchQuery, setSearchQuery] = useState("");
    const { data: contacts = [], isLoading } = useQuery<Contact[]>({
        queryKey: ["/api/crm/contacts"],
        select: (data) => Array.isArray(data) ? data : []
    });

    const filteredContacts = contacts.filter(c =>
        (c.firstName && c.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Link href="/crm">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-semibold">Contacts</h1>
                    <p className="text-muted-foreground text-sm">Manage business contacts</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading contacts...</div>
                    ) : filteredContacts.length > 0 ? (
                        filteredContacts.map((c) => (
                            <Card key={c.id} className="hover-elevate cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{c.salutation} {c.firstName} {c.lastName}</p>
                                                <div className="flex gap-2 text-sm text-muted-foreground">
                                                    {c.title && <span>{c.title}</span>}
                                                    {c.email && <span>• {c.email}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">No contacts found. Create one below.</div>
                    )}
                </div>

                <div className="mt-8 border-t pt-8">
                    <ContactEntryForm />
                </div>
            </div>
        </div>
    );
}
