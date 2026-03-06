import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Building2, ShieldCheck, CreditCard } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const legalEntitySchema = z.object({
    name: z.string().min(1, "Entity Name is required"),
    taxId: z.string().optional(),
    ledgerId: z.string().min(1, "Primary Ledger is required"),
    countryCode: z.string().min(2, "Country Code required").max(2),
    addressLine1: z.string().optional()
});

function EntityForm({ onSubmit, ledgers, isLoading }: { onSubmit: (data: any) => void, ledgers: any[], isLoading: boolean }) {
    const form = useForm<z.infer<typeof legalEntitySchema>>({
        resolver: zodResolver(legalEntitySchema),
        defaultValues: {
            name: "",
            taxId: "",
            ledgerId: "",
            countryCode: "US", // Default
            addressLine1: ""
        }
    });

    const handleSubmit = (values: z.infer<typeof legalEntitySchema>) => {
        onSubmit(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Entity Name *</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Nexus Corp - USA" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="taxId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tax / VAT ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="XX-XXXXXXX" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jurisdiction</FormLabel>
                                <FormControl>
                                    <Input maxLength={2} placeholder="US" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Registered Address</FormLabel>
                            <FormControl>
                                <Input placeholder="123 Corporate Blvd" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="ledgerId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Primary Ledger *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Ledger" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {ledgers.map(l => (
                                        <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                The primary ledger dictates the chart of accounts and currency.
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Register Entity
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

export default function LegalEntitySetup() {
    const { toast } = useToast();
    const [isCreating, setIsCreating] = useState(false);

    const { data: entities, isLoading: isLoadingEntities } = useQuery<any[]>({
        queryKey: ["/api/finance/gl/legal-entities"],
    });

    const { data: ledgers, isLoading: isLoadingLedgers } = useQuery<any[]>({
        queryKey: ["/api/finance/gl/ledgers"],
    });

    const createEntityMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/finance/gl/legal-entities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create legal entity");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/legal-entities"] });
            setIsCreating(false);
            toast({ title: "Legal Entity Created", description: "Successfully registered and mapped to ledger." });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    if (isLoadingEntities || isLoadingLedgers) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <StandardPage
            title="Legal Entities"
            description="Enterprise Structure: Organizational Units & Tax Registrations"
            actions={
                <Button onClick={() => setIsCreating(true)} className="gap-2 bg-[#0f172a]">
                    <Plus className="h-4 w-4" /> Register Entity
                </Button>
            }
        >
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Register New Legal Entity</DialogTitle>
                        <CardDescription>Define a legal organization unit and map it to a primary ledger.</CardDescription>
                    </DialogHeader>
                    <EntityForm
                        onSubmit={(data) => createEntityMutation.mutate(data)}
                        ledgers={ledgers || []}
                        isLoading={createEntityMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mapped Entities</CardTitle>
                        <Building2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{entities?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-blue-500">Actively assigned to ledgers</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tax Compliance</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{entities?.filter(e => e.taxId).length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-green-500">Verified VAT/Tax IDs</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Legal Entities</CardTitle>
                    <CardDescription>Management of corporate entities and their financial ledger associations</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Entity Name</TableHead>
                                <TableHead>Tax/VAT ID</TableHead>
                                <TableHead>Associated Ledger</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entities?.map((entity) => (
                                <TableRow key={entity.id}>
                                    <TableCell className="font-semibold">{entity.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-3 w-3 text-muted-foreground" />
                                            <span className="font-mono text-xs">{entity.taxId || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-medium text-primary border-primary/20 bg-primary/5">
                                            {ledgers?.find(l => l.id === entity.ledgerId)?.name || entity.ledgerId}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={entity.isActive ? 'Active' : 'Inactive'} />
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground text-sm">
                                        {formatDate(entity.createdAt)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {entities?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                                        No legal entities registered yet. Click 'Register Entity' to start.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
