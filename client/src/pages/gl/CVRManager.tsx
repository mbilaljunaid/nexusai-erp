import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGlCrossValidationRuleSchema, type GlCrossValidationRule } from "@shared/schema";
import { ShieldCheck, Plus, Trash2, Edit2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CVRManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<GlCrossValidationRule | null>(null);

    const ledgerId = "primary-ledger-001"; // In real app, get from context

    const { data: rules, isLoading } = useQuery<GlCrossValidationRule[]>({
        queryKey: ["/api/gl/cross-validation-rules", { ledgerId }],
    });

    const createRuleMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/gl/cross-validation-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, ledgerId }),
            });
            if (!res.ok) throw new Error("Failed to create rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/cross-validation-rules"] });
            setIsCreateDialogOpen(false);
            toast({ title: "Success", description: "Cross validation rule created" });
        },
    });

    const updateRuleMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const res = await fetch(`/api/gl/cross-validation-rules/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/cross-validation-rules"] });
            setEditingRule(null);
            toast({ title: "Success", description: "Rule updated" });
        },
    });

    const deleteRuleMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/gl/cross-validation-rules/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete rule");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/cross-validation-rules"] });
            toast({ title: "Deleted", description: "Rule removed successfully" });
        },
    });

    const form = useForm({
        resolver: zodResolver(insertGlCrossValidationRuleSchema),
        defaultValues: {
            ruleName: "",
            description: "",
            errorMessage: "",
            includeFilter: "",
            excludeFilter: "",
            enabled: true,
        },
    });

    const onSubmit = (data: any) => {
        if (editingRule) {
            updateRuleMutation.mutate({ id: editingRule.id, data });
        } else {
            createRuleMutation.mutate(data);
        }
    };

    const startEdit = (rule: GlCrossValidationRule) => {
        setEditingRule(rule);
        form.reset({
            ruleName: rule.ruleName,
            description: rule.description || "",
            errorMessage: rule.errorMessage || "",
            includeFilter: rule.includeFilter || "",
            excludeFilter: rule.excludeFilter || "",
            enabled: rule.enabled ?? true,
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cross Validation Rules</h1>
                    <p className="text-muted-foreground">Manage account combination restrictions for Ledger: {ledgerId}</p>
                </div>
                <Dialog open={isCreateDialogOpen || !!editingRule} onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateDialogOpen(false);
                        setEditingRule(null);
                        form.reset();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Create Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingRule ? "Edit Rule" : "Create New Cross Validation Rule"}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="ruleName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Rule Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Block Expenses for Admin" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="enabled"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-8">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Enabled</FormLabel>
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
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Short explanation of this rule" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="includeFilter"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Include Filter</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Segment1=01" {...field} />
                                                </FormControl>
                                                <FormDescription>Combinations matching this will be evaluated</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="excludeFilter"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Exclude Filter</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Segment3=5000" {...field} />
                                                </FormControl>
                                                <FormDescription>Evaluated combinations matching this are BLOCKED</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="errorMessage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Error Message</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Message shown when validation fails" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="submit" disabled={createRuleMutation.isPending || updateRuleMutation.isPending}>
                                        {editingRule ? "Update Rule" : "Create Rule"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Active Rules
                    </CardTitle>
                    <CardDescription>Rules are evaluated during journal entry and posting to prevent invalid combinations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border text-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[200px]">Rule Name</TableHead>
                                    <TableHead>Include / Exclude</TableHead>
                                    <TableHead>Error Message</TableHead>
                                    <TableHead className="w-[100px]">Status</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">Loading rules...</TableCell>
                                    </TableRow>
                                ) : rules?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                                            No cross validation rules defined for this ledger.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rules?.map((rule) => (
                                        <TableRow key={rule.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{rule.ruleName}</span>
                                                    <span className="text-xs text-muted-foreground">{rule.description}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1">
                                                        <Badge variant="outline" className="text-[10px] h-4">INC</Badge>
                                                        <span className="font-mono text-xs text-blue-600">{rule.includeFilter || "ALL"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Badge variant="secondary" className="text-[10px] h-4">EXC</Badge>
                                                        <span className="font-mono text-xs text-red-600 font-bold">{rule.excludeFilter}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground italic truncate max-w-[250px]">
                                                {rule.errorMessage || "Account combination failure"}
                                            </TableCell>
                                            <TableCell>
                                                {rule.enabled ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1 w-fit">
                                                        <CheckCircle2 className="h-3 w-3" /> Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                                        <AlertCircle className="h-3 w-3" /> Disabled
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => startEdit(rule)}
                                                        className="h-8 w-8"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            if (confirm("Delete this rule?")) {
                                                                deleteRuleMutation.mutate(rule.id);
                                                            }
                                                        }}
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-blue-50/30 border-blue-100 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-blue-500" />
                            How CVR Evaluation Works
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2 text-blue-700">
                        <p>1. The engine checks if the account combination matches the <strong>Include Filter</strong>.</p>
                        <p>2. If it matches, the engine then checks the <strong>Exclude Filter</strong>.</p>
                        <p>3. If it matches the Exclude Filter, the transaction is <strong>REJECTED</strong> with your error message.</p>
                        <p className="font-semibold italic">Example: Include (Company 01) AND Exclude (Expense Accounts) results in "Expenses cannot be booked to Corporate HQ".</p>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50/30 border-amber-100 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            Rule Optimization
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2 text-amber-700">
                        <p>• Avoid overly broad Include filters to maintain system performance.</p>
                        <p>• Use strict exclusion filters for high-risk combinations (e.g. prohibiting Intercompany segments in Cash accounts).</p>
                        <p>• Rules are evaluated in parallel. The first rule to fail will trigger the error.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
