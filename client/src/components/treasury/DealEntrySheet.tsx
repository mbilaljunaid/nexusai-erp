
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTreasuryDealSchema, TreasuryCounterparty } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface DealEntrySheetProps {
    open: boolean;
    onClose: () => void;
}

export function DealEntrySheet({ open, onClose }: DealEntrySheetProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: counterparties = [] } = useQuery<TreasuryCounterparty[]>({
        queryKey: ["/api/treasury/counterparties"],
    });

    const form = useForm({
        resolver: zodResolver(insertTreasuryDealSchema),
        defaultValues: {
            dealNumber: `DL-${Date.now().toString().slice(-6)}`,
            type: "DEBT",
            subType: "TERM_LOAN",
            currency: "USD",
            principalAmount: "100000",
            interestRate: "5.0",
            interestType: "FIXED",
            startDate: new Date().toISOString(),
            status: "DRAFT",
            termMonths: 12
        }
    });

    const mutation = useMutation({
        mutationFn: async (values: any) => {
            const res = await apiRequest("POST", "/api/treasury/deals", values);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Deal Created", description: "Treasury instrument saved successfully." });
            queryClient.invalidateQueries({ queryKey: ["/api/treasury/deals"] });
            onClose();
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>New Treasury Instrument</SheetTitle>
                    <SheetDescription>
                        Capture internal or external financing, investment, or FX positions.
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6 py-6 border-t border-b mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dealNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Deal Reference #</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instrument Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="DEBT">Debt / Financing</SelectItem>
                                                <SelectItem value="INVESTMENT">Investment Portfolio</SelectItem>
                                                <SelectItem value="FX_FORWARD">FX Forward Hub</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="counterpartyId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Institution / Counterparty</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Institution" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {counterparties.map(cp => (
                                                <SelectItem key={cp.id} value={cp.id}>{cp.name} ({cp.type})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="principalAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Principal Amount</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="interestRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Yearly Rate (%)</FormLabel>
                                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="termMonths"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Term (Months)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <SheetFooter className="mt-8">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Draft Deal"}
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
