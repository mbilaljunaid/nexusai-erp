
import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, Map, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

interface Territory {
    id: string;
    name: string;
    description: string;
    ownerId: string;
}

interface Rule {
    id: string;
    field: string;
    operator: string;
    value: string;
    priority: number;
}

const territorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
});

const ruleSchema = z.object({
    field: z.string().min(1, "Field is required"),
    operator: z.string().min(1, "Operator is required"),
    value: z.string().min(1, "Value is required"),
});

export default function TerritoryManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const form = useForm<z.infer<typeof territorySchema>>({
        resolver: zodResolver(territorySchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    // Fetch Territories
    const { data: territories, isLoading } = useQuery<Territory[]>({
        queryKey: ["/api/crm/territories"],
    });

    // Create Territory Mutation
    const createTerritory = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/crm/territories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create territory");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/territories"] });
            setIsCreateOpen(false);
            form.reset();
            toast({ title: "Territory Created" });
        },
    });

    const onSubmit = (values: z.infer<typeof territorySchema>) => {
        createTerritory.mutate(values);
    };

    return (
        <StandardPage
            title="Territory Management"
            description="Define territories and assignment rules for your sales team."
            actions={
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> New Territory</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Territory</DialogTitle>
                            <DialogDescription>Define a new sales territory region.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="space-y-4 py-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. East Coast" {...field} />
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
                                                    <Input placeholder="Optional description" {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={createTerritory.isPending}>Create</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            }
        >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* List of Territories */}
                <div className="md:col-span-1 space-y-4">
                    {isLoading && <TableSkeleton rows={4} />}
                    {territories?.map((t) => (
                        <Card
                            key={t.id}
                            className={`cursor-pointer transition-colors hover:bg-accent/50 ${selectedTerritory?.id === t.id ? 'border-primary bg-accent' : ''}`}
                            onClick={() => setSelectedTerritory(t)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                        >
                            <CardHeader className="p-4">
                                <CardTitle className="text-lg flex justify-between">
                                    {t.name}
                                    {selectedTerritory?.id === t.id && <Map className="h-4 w-4 text-primary" />}
                                </CardTitle>
                                <CardDescription>{t.description || "No description"}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                    {!isLoading && territories?.length === 0 && (
                        <div className="text-muted-foreground italic p-4 border rounded-lg border-dashed text-center">
                            No territories defined. Create one to get started.
                        </div>
                    )}
                </div>

                {/* Detail / Rules View */}
                <div className="md:col-span-2">
                    {selectedTerritory ? (
                        <TerritoryRulesEditor territory={selectedTerritory} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
                            <Shield className="h-12 w-12 mb-4 opacity-20" />
                            <p>Select a territory to manage its rules.</p>
                        </div>
                    )}
                </div>
            </div>
        </StandardPage>
    );
}

function TerritoryRulesEditor({ territory }: { territory: Territory }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof ruleSchema>>({
        resolver: zodResolver(ruleSchema),
        defaultValues: {
            field: "billingState",
            operator: "equals",
            value: "",
        },
    });

    // Fetch Rules
    const { data: rules } = useQuery<Rule[]>({
        queryKey: ["/api/crm/territories", territory.id, "rules"],
        queryFn: async () => {
            const res = await fetch(`/api/crm/territories/${territory.id}/rules`);
            return res.json();
        }
    });

    const addRule = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/crm/territories/${territory.id}/rules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to add rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/territories", territory.id, "rules"] });
            form.reset();
            toast({ title: "Rule Added" });
        }
    });

    const onSubmit = (values: z.infer<typeof ruleSchema>) => {
        addRule.mutate({
            ...values,
            priority: 1
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assignment Rules: {territory.name}</CardTitle>
                <CardDescription>Accounts matching ANY of these rules will be assigned to this territory.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Rule List */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Field</TableHead>
                            <TableHead>Operator</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rules?.map((rule) => (
                            <TableRow key={rule.id}>
                                <TableCell className="font-medium">{rule.field}</TableCell>
                                <TableCell><Badge variant="outline">{rule.operator}</Badge></TableCell>
                                <TableCell>{rule.value}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" disabled><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {rules?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                    No rules defined yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Add Rule Form */}
                <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                    <h4 className="text-sm font-semibold">Add New Rule</h4>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 items-end">
                            <FormField
                                control={form.control}
                                name="field"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Field</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="billingState">Billing State</SelectItem>
                                                <SelectItem value="industry">Industry</SelectItem>
                                                <SelectItem value="annualRevenue">Annual Revenue</SelectItem>
                                                <SelectItem value="numberOfEmployees">Employees</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="operator"
                                render={({ field }) => (
                                    <FormItem className="w-[150px]">
                                        <FormLabel>Operator</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="equals">Equals</SelectItem>
                                                <SelectItem value="contains">Contains</SelectItem>
                                                <SelectItem value="gt">Greater Than</SelectItem>
                                                <SelectItem value="lt">Less Than</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Value</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Value to match..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={addRule.isPending}>Add Rule</Button>
                        </form>
                    </Form>
                </div>
            </CardContent>
        </Card>
    );
}
