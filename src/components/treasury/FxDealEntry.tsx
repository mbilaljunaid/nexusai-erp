
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTreasuryFxDealSchema, type InsertTreasuryFxDeal } from "@shared/schema";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { useState } from "react";

export function FxDealEntry() {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Counterparties
    const { data: counterparties = [] } = useQuery<any[]>({
        queryKey: ['/api/treasury/counterparties']
    });

    const form = useForm<InsertTreasuryFxDeal>({
        resolver: zodResolver(insertTreasuryFxDealSchema),
        defaultValues: {
            dealNumber: `FX-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
            status: "DRAFT",
            dealType: "SPOT",
            buyCurrency: "EUR",
            sellCurrency: "USD",
            exchangeRate: "1.00",
            tradeDate: new Date(),
            valueDate: new Date(),
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: InsertTreasuryFxDeal) => {
            const res = await apiRequest("POST", "/api/treasury/fx-deals", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/treasury/fx-deals"] });
            toast({ title: "Deal Created", description: "FX Deal successfully booked." });
            setOpen(false);
            form.reset();
        },
        onError: (error: Error) => {
            toast({
                title: "Deal Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    function onSubmit(data: InsertTreasuryFxDeal) {
        // Ensure numbers are strings for checks if needed, but schema handles coercion usually
        mutation.mutate(data);
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New FX Deal
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[500px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Book FX Deal</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dealNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Deal #</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dealType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="SPOT">Spot</SelectItem>
                                                    <SelectItem value="FORWARD">Forward</SelectItem>
                                                    <SelectItem value="SWAP">Swap</SelectItem>
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
                                        <FormLabel>Counterparty</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select counterparty" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {counterparties.map((cp) => (
                                                    <SelectItem key={cp.id} value={cp.id}>
                                                        {cp.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-md">
                                {/* Buy Leg */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-primary">Buy Leg</h4>
                                    <FormField
                                        control={form.control}
                                        name="buyCurrency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Currency</FormLabel>
                                                <FormControl><Input {...field} maxLength={3} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="buyAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Sell Leg */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-destructive">Sell Leg</h4>
                                    <FormField
                                        control={form.control}
                                        name="sellCurrency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Currency</FormLabel>
                                                <FormControl><Input {...field} maxLength={3} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="sellAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="exchangeRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Exchange Rate</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.000001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="tradeDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Trade Date</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="valueDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Value Date</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? "Booking..." : "Book Deal"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
