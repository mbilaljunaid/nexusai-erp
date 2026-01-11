import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertArInvoiceSchema, type InsertArInvoice } from "@shared/schema";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, MinusCircle, PlusCircle } from "lucide-react";

interface ArTransactionDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ArTransactionDialog({ isOpen, onClose }: ArTransactionDialogProps) {
    const { toast } = useToast();
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");

    const form = useForm<InsertArInvoice>({
        resolver: zodResolver(insertArInvoiceSchema),
        defaultValues: {
            transactionClass: "INV",
            currency: "USD",
            amount: "0",
            taxAmount: "0",
            totalAmount: "0",
            status: "Sent",
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    });

    const transactionClass = form.watch("transactionClass");

    // Queries
    const { data: customers } = useQuery({
        queryKey: ["/api/ar/customers"],
        queryFn: () => api.ar.customers.list()
    });

    const { data: accounts } = useQuery({
        queryKey: ["/api/ar/accounts", selectedCustomerId],
        queryFn: () => api.ar.accounts.list(selectedCustomerId),
        enabled: !!selectedCustomerId
    });

    const { data: sites } = useQuery({
        queryKey: ["/api/ar/sites", selectedAccountId],
        queryFn: () => api.ar.sites.list(selectedAccountId),
        enabled: !!selectedAccountId
    });

    // Mutations
    const mutation = useMutation({
        mutationFn: (data: InsertArInvoice) => {
            if (data.transactionClass === "CM") {
                // For simplicity in the generic dialog, if class is CM, we still use the standard create
                // but we could route to createCreditMemo if we had a source invoice
                return api.ar.invoices.create(data);
            }
            return api.ar.invoices.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
            toast({ title: "Transaction Created", description: "The AR transaction has been successfully recorded." });
            onClose();
            form.reset();
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const onSubmit = (data: InsertArInvoice) => {
        mutation.mutate(data);
    };

    // Auto-calculate total
    const amount = form.watch("amount");
    const tax = form.watch("taxAmount");

    useState(() => {
        const total = (Number(amount || 0) + Number(tax || 0)).toString();
        if (form.getValues("totalAmount") !== total) {
            form.setValue("totalAmount", total);
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl bg-background/95 backdrop-blur-xl border-emerald-500/20 shadow-2xl rounded-3xl">
                <DialogHeader>
                    <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
                        {transactionClass === "INV" ? <FileText className="h-6 w-6 text-emerald-600" /> :
                            transactionClass === "CM" ? <MinusCircle className="h-6 w-6 text-rose-600" /> :
                                <PlusCircle className="h-6 w-6 text-blue-600" />}
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight uppercase">New AR Transaction</DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground/80">
                        Record a new sales invoice, credit memo, or debit memo in the subledger.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="transactionClass"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Transaction Class</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl border-muted-foreground/20 bg-muted/5 font-bold uppercase text-xs">
                                                    <SelectValue placeholder="Select Class" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-muted-foreground/10 shadow-xl">
                                                <SelectItem value="INV">Invoice</SelectItem>
                                                <SelectItem value="CM">Credit Memo</SelectItem>
                                                <SelectItem value="DM">Debit Memo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="invoiceNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Transaction Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. INV-2024-001" {...field} className="rounded-xl border-muted-foreground/20 bg-muted/5 font-mono text-sm uppercase" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormItem>
                                <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Customer (Party)</FormLabel>
                                <Select onValueChange={(val) => {
                                    setSelectedCustomerId(val);
                                    form.setValue("customerId", val);
                                    setSelectedAccountId(""); // Reset
                                }}>
                                    <FormControl>
                                        <SelectTrigger className="rounded-xl border-muted-foreground/20 bg-muted/5 font-semibold text-xs transition-all hover:bg-muted/10">
                                            <SelectValue placeholder="Select Customer" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl border-muted-foreground/10 shadow-xl">
                                        {customers?.map((c: any) => (
                                            <SelectItem key={c.id} value={c.id} className="text-xs font-medium">{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>

                            <FormField
                                control={form.control}
                                name="accountId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Customer Account</FormLabel>
                                        <Select onValueChange={(val) => {
                                            field.onChange(val);
                                            setSelectedAccountId(val);
                                        }} disabled={!selectedCustomerId || !accounts}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl border-muted-foreground/20 bg-muted/5 font-semibold text-xs">
                                                    <SelectValue placeholder="Select Account" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-muted-foreground/10 shadow-xl">
                                                {accounts?.map((a: any) => (
                                                    <SelectItem key={a.id} value={a.id} className="text-xs font-medium">{a.accountNumber} - {a.accountName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} className="rounded-xl border-muted-foreground/20 bg-muted/5 font-bold text-center" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="taxAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Tax</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} className="rounded-xl border-muted-foreground/20 bg-muted/5 font-bold text-center" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="totalAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground text-emerald-600">Total</FormLabel>
                                        <FormControl>
                                            <Input readOnly value={(Number(amount || 0) + Number(tax || 0)).toFixed(2)} className="rounded-xl border-emerald-500/30 bg-emerald-500/5 font-black text-center text-emerald-700" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-6">
                            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold uppercase text-[10px] tracking-widest">Cancel</Button>
                            <Button type="submit" className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-emerald-500/20" disabled={mutation.isPending}>
                                {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                Complete Transaction
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
