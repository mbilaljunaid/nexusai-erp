import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";



const clientSchema = z.object({
    clientId: z.string().min(1, "Client Name / ID is required"),
    region: z.string().min(1, "Region is required"),
    status: z.enum(["active", "inactive"])
});

interface Client {
    id: string;
    clientId: string;
    region: string;
    status: "active" | "inactive";
}

export default function ClientManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);

    const form = useForm<z.infer<typeof clientSchema>>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            clientId: "",
            region: "",
            status: "active"
        }
    });

    // Reset form when editing changes
    React.useEffect(() => {
        if (editingClient) {
            form.reset({
                clientId: editingClient.clientId || "",
                region: editingClient.region || "",
                status: editingClient.status || "active"
            });
        } else {
            form.reset({ clientId: "", region: "", status: "active" });
        }
    }, [editingClient, form]);

    const onSubmit = (values: z.infer<typeof clientSchema>) => {
        mutation.mutate(values);
    };


    const { data: clients = [], isLoading } = useQuery<Client[]>({
        queryKey: ["/api/logistics-clients"],
        queryFn: () => fetch("/api/logistics-clients").then(r => r.json()).catch(() => []),
    });

    const mutation = useMutation({
        mutationFn: async (data: Partial<Client>) => {
            // Mock API endpoint
            const res = await fetch("/api/logistics-clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/logistics-clients"] });
            setIsSheetOpen(false);
            setEditingClient(null);
            toast({ title: "Success", description: "Client saved successfully" });
        },
        onError: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/logistics-clients"] });
            setIsSheetOpen(false);
            toast({ title: "Success (Mock)", description: "Client saved (Mock)" });
        }
    });

    const columns = [
        { id: "clientId", header: "Client ID", width: "200px", cell: (row: Client) => <div className="px-2 h-full flex items-center font-semibold">{row.clientId}</div> },
        { id: "region", header: "Region", width: "200px", cell: (row: Client) => <div className="px-2 h-full flex items-center">{row.region}</div> },
        { id: "status", header: "Status", width: "150px", cell: (row: Client) => <div className="px-2 h-full flex items-center"><Badge variant={row.status === "active" ? "default" : "secondary"}>{row.status}</Badge></div> },
        {
            id: "actions",
            header: "Actions",
            width: "150px",
            cell: (row: Client) => (
                <div className="px-2 h-full flex items-center">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingClient(row); setIsSheetOpen(true); }}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title="Client Management"
            description="Manage clients, contracts, and SLAs"
            breadcrumbs={[{ label: "CRM", href: "/crm" }, { label: "Clients" }]}
            actions={
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button onClick={() => setEditingClient(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Client
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>{editingClient ? 'Edit' : 'Add'} Client</SheetTitle>
                        </SheetHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                                <FormField control={form.control} name="clientId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client Name / ID</FormLabel>
                                        <FormControl><Input {...field} required /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="region" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Region</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                    {mutation.isPending ? "Saving..." : "Save Client"}
                                </Button>
                            </form>
                        </Form>
                    </SheetContent>
                </Sheet>
            }
        >
            <div className="bg-card w-full rounded-md border shadow-sm">
                <InteractiveSpreadsheet
                    data={clients}
                    columns={columns}
                    onChange={() => { }}
                    virtualized={true}
                    containerHeight="500px"
                />
            </div>
        </StandardPage>
    );
}
