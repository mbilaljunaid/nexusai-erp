
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCaseSchema, type InsertCase, type Case } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CaseFormProps {
    onSuccess?: (caseItem: Case) => void;
    defaultValues?: Partial<InsertCase>;
    caseId?: string; // If provided, we're editing
}

export function CaseForm({ onSuccess, defaultValues, caseId }: CaseFormProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch accounts and contacts for relation fields
    const { data: accounts = [] } = useQuery<any[]>({
        queryKey: ['/api/crm/accounts'],
    });
    const { data: contacts = [] } = useQuery<any[]>({
        queryKey: ['/api/crm/contacts'],
    });

    const form = useForm<InsertCase>({
        resolver: zodResolver(insertCaseSchema),
        defaultValues: defaultValues || {
            subject: "",
            description: "",
            status: "New",
            priority: "Medium",
            origin: "Web",
            accountId: null, // Allow null
            contactId: null  // Allow null
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: InsertCase) => {
            if (caseId) {
                const res = await apiRequest("PATCH", `/cases/${caseId}`, data);
                return await res.json();
            } else {
                const res = await apiRequest("POST", "/cases", data);
                return await res.json();
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/cases"] });
            if (caseId) {
                queryClient.invalidateQueries({ queryKey: [`/cases/${caseId}`] });
            }
            toast({
                title: caseId ? "Case updated" : "Case created",
                description: `Case "${data.subject}" has been successfully saved.`,
            });
            if (onSuccess) onSuccess(data);
            if (!caseId) form.reset();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: InsertCase) => {
        mutation.mutate(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                                <Input placeholder="Issue summary" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value || "New"}
                                    value={field.value || "New"}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="Working">Working</SelectItem>
                                        <SelectItem value="Escalated">Escalated</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value || "Medium"}
                                    value={field.value || "Medium"}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="accountId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Account" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {accounts.map((acc: any) => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                {acc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contactId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Contact" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {contacts.map((contact: any) => (
                                            <SelectItem key={contact.id} value={contact.id}>
                                                {contact.firstName} {contact.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Detailed description of the issue..."
                                    className="min-h-[100px]"
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving..." : (caseId ? "Update Case" : "Create Case")}
                </Button>
            </form>
        </Form>
    );
}
