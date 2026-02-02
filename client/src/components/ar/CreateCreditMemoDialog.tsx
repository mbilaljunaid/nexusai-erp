import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Undo2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { api } from "@/lib/api";

const creditMemoSchema = z.object({
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    reason: z.string().min(3, "Reason is required"),
});

type CreditMemoFormValues = z.infer<typeof creditMemoSchema>;

interface CreateCreditMemoDialogProps {
    invoiceId: number;
    invoiceNumber: string;
    maxAmount?: number;
}

export function CreateCreditMemoDialog({ invoiceId, invoiceNumber, maxAmount }: CreateCreditMemoDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<CreditMemoFormValues>({
        resolver: zodResolver(creditMemoSchema),
        defaultValues: {
            amount: 0,
            reason: "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: CreditMemoFormValues) => {
            return api.ar.invoices.createCreditMemo({
                sourceInvoiceId: invoiceId,
                amount: data.amount,
                reason: data.reason
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
            setOpen(false);
            toast({
                title: "Credit Memo Created",
                description: `Credit Memo for invoice ${invoiceNumber} created successfully.`,
            });
            form.reset();
        },
        onError: (error) => {
            toast({
                title: "Creation Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    function onSubmit(data: CreditMemoFormValues) {
        if (maxAmount && data.amount > maxAmount) {
            form.setError("amount", { message: `Amount cannot exceed invoice balance of ${maxAmount}` });
            return;
        }
        mutation.mutate(data);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full h-7 px-3 text-xs">
                    <Undo2 className="mr-1 h-3 w-3" />
                    Credit Memo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Issue Credit Memo</DialogTitle>
                    <DialogDescription>
                        Create a credit memo against Invoice {invoiceNumber}.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Credit Amount</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                            <Input type="number" step="0.01" className="pl-7" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    {maxAmount !== undefined && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Max available: ${maxAmount.toFixed(2)}
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Return of goods, Pricing error" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Issue Credit
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
