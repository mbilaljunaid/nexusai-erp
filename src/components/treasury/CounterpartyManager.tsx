
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Plus, Landmark, Search, ShieldCheck, Mail, Phone, Globe, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { TreasuryCounterparty, insertTreasuryCounterpartySchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CounterpartyManager() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: counterparties = [], isLoading } = useQuery<TreasuryCounterparty[]>({
        queryKey: ["/api/treasury/counterparties"],
    });

    const form = useForm({
        resolver: zodResolver(insertTreasuryCounterpartySchema),
        defaultValues: {
            name: "",
            type: "BANK",
            shortName: "",
            taxId: "",
            swiftCode: "",
            active: true
        }
    });

    const mutation = useMutation({
        mutationFn: async (values: any) => {
            const res = await apiRequest("POST", "/api/treasury/counterparties", values);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Institution Added", description: "Counterparty has been registered." });
            queryClient.invalidateQueries({ queryKey: ["/api/treasury/counterparties"] });
            setIsAddOpen(false);
            form.reset();
        }
    });

    const columns: Column<TreasuryCounterparty>[] = [
        {
            header: "Name",
            width: "30%",
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <Landmark className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{item.shortName || 'N/A'}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Type",
            accessorKey: "type",
            width: "15%"
        },
        {
            header: "SWIFT / BIC",
            accessorKey: "swiftCode",
            width: "15%",
            cell: (item) => <code className="text-xs bg-muted px-1 rounded">{item.swiftCode || 'NONE'}</code>
        },
        {
            header: "Tax ID",
            accessorKey: "taxId",
            width: "15%"
        },
        {
            header: "Verification",
            width: "15%",
            cell: () => (
                <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase">
                    <ShieldCheck className="w-3 h-3" /> KYB Clear
                </div>
            )
        },
        {
            header: "",
            width: "10%",
            className: "text-right",
            cell: () => <Button variant="ghost" size="sm">Manage</Button>
        }
    ];

    return (
        <Card className="border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search institutions..." className="pl-8 w-[300px]" />
                    </div>
                </div>
                <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
                    <Plus className="w-4 h-4" /> Add Counterparty
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <StandardTable
                    data={counterparties}
                    columns={columns}
                    isLoading={isLoading}
                    className="border-0 shadow-none"
                    pageSize={10}
                />
            </CardContent>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Counterparty</DialogTitle>
                        <DialogDescription>
                            Register a bank, broker, or financial issuer for treasury deals.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Legal Entity Name</FormLabel>
                                        <FormControl><Input placeholder="e.g. JPMorgan Chase" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Organization Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="BANK">Commercial Bank</SelectItem>
                                                    <SelectItem value="BROKER">Brokerage</SelectItem>
                                                    <SelectItem value="ISSUER">Investment Issuer</SelectItem>
                                                    <SelectItem value="GOVERNMENT">Government Body</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="shortName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Common/Trading Name</FormLabel>
                                            <FormControl><Input placeholder="e.g. JPMC" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="swiftCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SWIFT / BIC</FormLabel>
                                            <FormControl><Input placeholder="8 or 11 chars" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="taxId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tax Identification #</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Register Entity"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
