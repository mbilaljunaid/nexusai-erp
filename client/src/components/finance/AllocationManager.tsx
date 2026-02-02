import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Layers, Play, Plus, History, Calculator, Settings2, ArrowRight } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GlAllocation, InsertGlAllocation } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGlAllocationSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

export function AllocationManager() {
    const { toast } = useToast();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedLedger, setSelectedLedger] = useState("PRIMARY");

    const { data: allocations = [], isLoading } = useQuery<GlAllocation[]>({
        queryKey: ["/api/gl/allocations", selectedLedger],
        queryFn: () => fetch(`/api/gl/allocations?ledgerId=${selectedLedger}`).then(res => res.json())
    });

    const form = useForm<InsertGlAllocation>({
        resolver: zodResolver(insertGlAllocationSchema),
        defaultValues: {
            name: "",
            description: "",
            ledgerId: selectedLedger,
            poolAccountFilter: "",
            basisAccountFilter: "",
            offsetAccount: "",
            targetAccountPattern: "",
            enabled: true
        }
    });

    const runMutation = useMutation({
        mutationFn: ({ id, period }: { id: string, period: string }) =>
            fetch("/api/gl/allocations/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ allocationId: id, periodName: period })
            }).then(res => res.json()),
        onSuccess: (data) => {
            toast({
                title: "Allocation Successful",
                description: `Created Journal ID: ${data.journalId}. Total Allocated: ${data.totalAllocated}`
            });
        }
    });

    return (
        <Card className="glass-morphism border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600/10 to-teal-600/10 border-b border-white/10">
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-teal-400">
                            <Layers className="h-6 w-6 text-indigo-400" />
                            Mass Allocations Manager
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                            Distribute costs or revenues across cost centers using complex basis rules.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-white/10 bg-white/5">
                            <History className="w-4 h-4 mr-2" /> History
                        </Button>
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="premium-button bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20">
                                    <Plus className="w-4 h-4 mr-2" /> New Allocation Rule
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="glass-morphism border-white/10 max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold mb-4">Define Allocation Rule</DialogTitle>
                                </DialogHeader>
                                <Form {...form}>
                                    <form className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <FormField control={form.control} name="name" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Rule Name</FormLabel>
                                                    <FormControl><Input placeholder="e.g. IT Overheads Dist" {...field} className="bg-white/5 border-white/10" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="ledgerId" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ledger</FormLabel>
                                                    <FormControl><Input {...field} disabled className="bg-white/5 border-white/10 opacity-50" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="space-y-4 border-t border-white/5 pt-4">
                                            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">A: Pool Definition (Source)</h3>
                                            <FormField control={form.control} name="poolAccountFilter" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Pool Filter</FormLabel>
                                                    <FormControl><Input placeholder="Segment3=5000:5999" {...field} className="bg-white/5 border-white/10" /></FormControl>
                                                    <FormDescription>Identify accounts to be cleared/distributed.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="space-y-4 border-t border-white/5 pt-4">
                                            <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-widest">B: Basis Definition (Driver)</h3>
                                            <FormField control={form.control} name="basisAccountFilter" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Basis Filter</FormLabel>
                                                    <FormControl><Input placeholder="Segment3=STAT-1001" {...field} className="bg-white/5 border-white/10" /></FormControl>
                                                    <FormDescription>Statistical or monetary accounts used as allocation ratio.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="space-y-4 border-t border-white/5 pt-4">
                                            <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-widest">C: Targets & Offsets</h3>
                                            <div className="grid grid-cols-2 gap-6">
                                                <FormField control={form.control} name="targetAccountPattern" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Target Account Pattern</FormLabel>
                                                        <FormControl><Input placeholder="Segment3=7100, Segment2={driver}" {...field} className="bg-white/5 border-white/10" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="offsetAccount" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Offset Account (Contra)</FormLabel>
                                                        <FormControl><Input placeholder="01-000-5999-0000" {...field} className="bg-white/5 border-white/10" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4">
                                            <Button type="button" variant="ghost" className="hover:bg-white/5" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                            <Button type="button" className="premium-button bg-indigo-600" onClick={() => toast({ title: "Rule saved (Demo)" })}>
                                                Create Rule
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Rule Name</TableHead>
                            <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-indigo-400">Pool (A)</TableHead>
                            <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-teal-400">Basis (B)</TableHead>
                            <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-orange-400">Target Type</TableHead>
                            <TableHead className="py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Last Run</TableHead>
                            <TableHead className="py-4 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow className="hover:bg-transparent"><TableCell colSpan={6} className="h-40 text-center text-gray-500">Loading rules...</TableCell></TableRow>
                        ) : (
                            allocations.map((rule) => (
                                <TableRow key={rule.id} className="border-white/5 hover:bg-white/5 group transition-all">
                                    <TableCell className="py-4 font-semibold text-white">
                                        <div className="flex flex-col">
                                            <span>{rule.name}</span>
                                            <span className="text-xs text-gray-500 font-normal">{rule.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <code className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded">{rule.poolAccountFilter}</code>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <code className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-1 rounded">{rule.basisAccountFilter}</code>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Calculator className="h-3 w-3" /> Step-Down
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-gray-400 text-xs italic">Never</TableCell>
                                    <TableCell className="py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border-0 h-8 font-bold"
                                                onClick={() => runMutation.mutate({ id: rule.id, period: "Jan-2026" })}
                                                disabled={runMutation.isPending}
                                            >
                                                <Play className="h-3 w-3 mr-1 fill-emerald-400" /> Run
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
                                                <Settings2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
