import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Link2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GlIntercompanyRule, InsertGlIntercompanyRule } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGlIntercompanyRuleSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function IntercompanyManager() {
    const { toast } = useToast();
    const [isAddOpen, setIsAddOpen] = useState(false);

    const { data: rules = [], isLoading } = useQuery<GlIntercompanyRule[]>({
        queryKey: ["/api/gl/config/intercompany-rules"],
        queryFn: () => fetch("/api/gl/config/intercompany-rules").then(res => res.json())
    });

    const form = useForm<InsertGlIntercompanyRule>({
        resolver: zodResolver(insertGlIntercompanyRuleSchema),
        defaultValues: {
            fromCompany: "",
            toCompany: "",
            receivableAccountId: "",
            payableAccountId: "",
            enabled: true
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: InsertGlIntercompanyRule) => fetch("/api/gl/config/intercompany-rules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(res => res.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/config/intercompany-rules"] });
            setIsAddOpen(false);
            form.reset();
            toast({ title: "Intercompany rule created successfully" });
        },
        onError: (error: any) => {
            toast({
                title: "Error creating rule",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    return (
        <Card className="glass-morphism border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-white/10">
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            <Link2 className="h-6 w-6 text-blue-400" />
                            Intercompany Balancing Rules
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                            Define balancing accounts for cross-entity journal entries.
                        </CardDescription>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="premium-button shadow-lg shadow-blue-500/20">
                                <Plus className="w-4 h-4 mr-2" /> Define New Rule
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-morphism border-white/10 max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold mb-4">New Intercompany Rule</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <FormField control={form.control} name="fromCompany" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Source Company (LE)</FormLabel>
                                                <FormControl><Input placeholder="e.g. 01" {...field} className="bg-white/5 border-white/10" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="toCompany" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Target Company (LE)</FormLabel>
                                                <FormControl><Input placeholder="e.g. 02" {...field} className="bg-white/5 border-white/10" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <FormField control={form.control} name="receivableAccountId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-blue-400">Receivable Account (Due From)</FormLabel>
                                                <FormControl><Input placeholder="CCID or Account Code" {...field} className="bg-white/5 border-white/10" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="payableAccountId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-purple-400">Payable Account (Due To)</FormLabel>
                                                <FormControl><Input placeholder="CCID or Account Code" {...field} className="bg-white/5 border-white/10" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button type="button" variant="ghost" className="hover:bg-white/5" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                        <Button type="submit" className="premium-button" disabled={createMutation.isPending}>
                                            Save Rule
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Source LE</TableHead>
                                <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Target LE</TableHead>
                                <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-blue-400">Receivable (Due From)</TableHead>
                                <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-purple-400">Payable (Due To)</TableHead>
                                <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</TableHead>
                                <TableHead className="py-4 text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow className="hover:bg-transparent"><TableCell colSpan={6} className="h-40 text-center text-gray-500">Loading rules...</TableCell></TableRow>
                            ) : rules.length === 0 ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={6} className="h-60 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <AlertCircle className="h-10 w-10 text-gray-600" />
                                            <p className="text-gray-500">No intercompany balancing rules defined.</p>
                                            <Button variant="outline" onClick={() => setIsAddOpen(true)} className="text-blue-400 border-blue-400/20 hover:bg-blue-400/10">
                                                Define your first rule
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rules.map((rule) => (
                                    <TableRow key={rule.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                        <TableCell className="py-4 font-semibold text-white">{rule.fromCompany}</TableCell>
                                        <TableCell className="py-4 font-semibold text-white">{rule.toCompany}</TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-400 py-1">
                                                    {rule.receivableAccountId}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-400 py-1">
                                                    {rule.payableAccountId}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {rule.enabled ? (
                                                <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex w-fit items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="opacity-50">Disabled</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4 text-right">
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
