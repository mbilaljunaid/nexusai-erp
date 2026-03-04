
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import ModuleLayout from "@/components/layouts/ModuleLayout";
import { FinanceSidebar } from "@/components/nav/FinanceSidebar";
import { StandardPage } from "@/components/layout/StandardPage";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const ruleSchema = z.object({
    name: z.string().min(1, "Rule Name is required"),
    description: z.string().optional(),
    ledgerSetId: z.string().min(1, "Ledger Set ID is required"),
    eliminationLedgerId: z.string().min(1, "Elimination Ledger is required"),
    matchRule: z.string().min(1, "Match Rule is required"),
    thresholdAmount: z.coerce.number().min(0, "Threshold must be >= 0"),
    enabled: z.boolean().default(true)
});

export default function EliminationRules() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<any>(null);
    const queryClient = useQueryClient();

    // Fetch Rules
    const { data: rules = [], isLoading } = useQuery({
        queryKey: ["elimination-rules"],
        queryFn: async () => {
            const res = await fetch("/api/gl/elimination-rules");
            if (!res.ok) throw new Error("Failed to fetch rules");
            return res.json();
        }
    });

    // Create/Update Mutation
    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const url = selectedRule
                ? `/api/gl/elimination-rules/${selectedRule.id}`
                : "/api/gl/elimination-rules";
            const method = selectedRule ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to save rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["elimination-rules"] });
            setIsDialogOpen(false);
            setSelectedRule(null);
            toast({ title: "Success", description: "Rule saved successfully" });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to save rule", variant: "destructive" });
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/gl/elimination-rules/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete rule");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["elimination-rules"] });
            toast({ title: "Success", description: "Rule deleted" });
        }
    });

    const form = useForm<z.infer<typeof ruleSchema>>({
        resolver: zodResolver(ruleSchema),
        defaultValues: {
            name: "",
            description: "",
            ledgerSetId: "GLOBAL_GRP",
            eliminationLedgerId: "ELIM_LEDGER",
            matchRule: "Standard",
            thresholdAmount: 0.00,
            enabled: true
        }
    });

    const handleEdit = (rule: any) => {
        setSelectedRule(rule);
        form.reset({
            name: rule.name,
            description: rule.description || "",
            ledgerSetId: rule.ledgerSetId,
            eliminationLedgerId: rule.eliminationLedgerId,
            matchRule: rule.matchRule,
            thresholdAmount: Number(rule.thresholdAmount),
            enabled: rule.enabled
        });
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedRule(null);
        form.reset({
            name: "",
            description: "",
            ledgerSetId: "GLOBAL_GRP",
            eliminationLedgerId: "ELIM_LEDGER",
            matchRule: "Standard",
            thresholdAmount: 0.00,
            enabled: true
        });
        setIsDialogOpen(true);
    };

    const onSubmit = (values: z.infer<typeof ruleSchema>) => {
        mutation.mutate(values);
    };

    const filteredRules = rules.filter((r: any) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ModuleLayout sidebar={<FinanceSidebar />}>
            <StandardPage
                title="Elimination Rules"
                description="Define logic for intercompany eliminations."
                actions={
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> New Rule
                    </Button>
                }
            >

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Rules List</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search rules..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rule Name</TableHead>
                                    <TableHead>Ledger Set</TableHead>
                                    <TableHead>Match Rule</TableHead>
                                    <TableHead>Threshold</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRules.map((rule: any) => (
                                    <TableRow key={rule.id}>
                                        <TableCell className="font-medium">{rule.name}</TableCell>
                                        <TableCell>{rule.ledgerSetId}</TableCell>
                                        <TableCell>{rule.matchRule}</TableCell>
                                        <TableCell>${rule.thresholdAmount}</TableCell>
                                        <TableCell>
                                            <Badge variant={rule.enabled ? "default" : "secondary"}>
                                                {rule.enabled ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(rule.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{selectedRule ? "Edit Rule" : "Create Rule"}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rule Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                                <Input {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="ledgerSetId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ledger Set ID</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="eliminationLedgerId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Elimination Ledger</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="matchRule"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Match Rule</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Standard">Standard (1:1)</SelectItem>
                                                        <SelectItem value="Custom">Custom</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="thresholdAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Threshold ($)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="enabled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
                                            <div className="space-y-0.5">
                                                <FormLabel>Active</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit">Save Rule</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </StandardPage>
        </ModuleLayout>
    );
}
