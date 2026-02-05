
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formSchema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    amount: z.string().min(1, "Amount is required"), // Keeping as string for decimal precision
    description: z.string().min(1, "Description is required"),
    eventDate: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateBillingEventSheet() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    // Fetch Customers
    const { data: customers = [] } = useQuery({
        queryKey: ["/api/customers"],
        queryFn: () => fetch("/api/billing/profiles").then(r => r.json())
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customerId: "",
            amount: "",
            description: "",
            eventDate: new Date().toISOString().split('T')[0],
        },
    });

    const createMutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const res = await fetch("/api/billing/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    sourceSystem: "Manual",
                    sourceTransactionId: `MAN-${Date.now()}`,
                    currency: "USD",
                    status: "Pending"
                })
            });
            if (!res.ok) throw new Error("Failed to create event");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/billing/events/pending"] });
            queryClient.invalidateQueries({ queryKey: ["billing-metrics"] });
            toast({ title: "Event Created", description: "Manual billing event has been added." });
            setOpen(false);
            form.reset();
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    function onSubmit(values: FormValues) {
        createMutation.mutate(values);
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Manual Event
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Create Manual Billing Event</SheetTitle>
                    <SheetDescription>
                        Manually add a billable item for a customer.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="customerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a customer" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers.map((c: any) => (
                                                    <SelectItem key={c.customerId} value={c.customerId}>
                                                        {c.customerName || "Unknown"}
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
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="eventDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Ad-hoc Service Fee" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <SheetFooter className="mt-6">
                                <SheetClose asChild>
                                    <Button variant="outline" type="button">Cancel</Button>
                                </SheetClose>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Creating..." : "Create Event"}
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
