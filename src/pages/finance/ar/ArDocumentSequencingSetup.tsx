import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2, Plus, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";

const sequenceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    module: z.string().min(1, "Module is required"),
    type: z.enum(["GAPLESS", "AUTOMATIC", "MANUAL"]),
    initialValue: z.number().int().min(1),
    startDate: z.string().min(1, "Start Date is required"),
});

const assignmentSchema = z.object({
    sequenceId: z.string().min(1, "Sequence is required"),
    contextType: z.enum(["LEDGER", "LEGAL_ENTITY"]),
    contextValue: z.string().min(1, "Context Value is required"),
    documentCategory: z.string().min(1, "Document Category is required"),
    startDate: z.string().min(1, "Start Date is required"),
});

export default function ArDocumentSequencingSetup() {
    const queryClient = useQueryClient();
    const [openSeq, setOpenSeq] = useState(false);
    const [openAssgn, setOpenAssgn] = useState(false);

    const { data: sequences, isLoading: seqLoading } = useQuery<any[]>({
        queryKey: ['/api/ar/config/document-sequences'],
    });

    const { data: assignments, isLoading: assgnLoading } = useQuery<any[]>({
        queryKey: ['/api/ar/config/document-sequence-assignments'],
    });

    const { data: transactionTypes } = useQuery<any[]>({
        queryKey: ['/api/ar/config/transaction-types'],
    });

    const seqForm = useForm<z.infer<typeof sequenceSchema>>({
        resolver: zodResolver(sequenceSchema),
        defaultValues: {
            name: "",
            description: "",
            module: "AR",
            type: "GAPLESS",
            initialValue: 1,
            startDate: new Date().toISOString().split('T')[0],
        }
    });

    const assgnForm = useForm<z.infer<typeof assignmentSchema>>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            sequenceId: "",
            contextType: "LEDGER",
            contextValue: "PRIMARY",
            documentCategory: "",
            startDate: new Date().toISOString().split('T')[0],
        }
    });

    const seqMutation = useMutation({
        mutationFn: async (values: z.infer<typeof sequenceSchema>) => {
            const res = await fetch('/api/ar/config/document-sequences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
            if (!res.ok) throw new Error("Failed to create sequence");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/ar/config/document-sequences'] });
            setOpenSeq(false);
            seqForm.reset();
        }
    });

    const assgnMutation = useMutation({
        mutationFn: async (values: z.infer<typeof assignmentSchema>) => {
            const res = await fetch('/api/ar/config/document-sequence-assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
            if (!res.ok) throw new Error("Failed to create assignment");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/ar/config/document-sequence-assignments'] });
            setOpenAssgn(false);
            assgnForm.reset();
        }
    });

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto h-full overflow-y-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Document Sequencing</h1>
                <p className="text-muted-foreground mt-2">
                    Configure Gapless and Automatic document numbering sequences, and assign them by Ledger or Legal Entity.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sequences Card */}
                <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Sequences</CardTitle>
                            <CardDescription>Define numbering schemes</CardDescription>
                        </div>
                        <Dialog open={openSeq} onOpenChange={setOpenSeq}>
                            <DialogTrigger asChild>
                                <Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Sequence</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Document Sequence</DialogTitle>
                                </DialogHeader>
                                <Form {...seqForm}>
                                    <form onSubmit={seqForm.handleSubmit((v) => seqMutation.mutate(v))} className="space-y-4">
                                        <FormField control={seqForm.control} name="name" render={({ field }) => (
                                            <FormItem><FormLabel>Sequence Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                        )} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={seqForm.control} name="module" render={({ field }) => (
                                                <FormItem><FormLabel>Module</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="AR">Receivables</SelectItem><SelectItem value="AP">Payables</SelectItem><SelectItem value="GL">General Ledger</SelectItem></SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={seqForm.control} name="type" render={({ field }) => (
                                                <FormItem><FormLabel>Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="GAPLESS">Gapless</SelectItem><SelectItem value="AUTOMATIC">Automatic</SelectItem><SelectItem value="MANUAL">Manual</SelectItem></SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={seqForm.control} name="initialValue" render={({ field }) => (
                                                <FormItem><FormLabel>Initial Value</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={seqForm.control} name="startDate" render={({ field }) => (
                                                <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={seqMutation.isPending}>
                                                {seqMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Sequence
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {seqLoading ? (
                            <div className="h-32 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Initial</TableHead>
                                        <TableHead>Start Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sequences?.map(seq => (
                                        <TableRow key={seq.id}>
                                            <TableCell className="font-medium">{seq.name}</TableCell>
                                            <TableCell>{seq.type}</TableCell>
                                            <TableCell>{seq.initialValue}</TableCell>
                                            <TableCell>{seq.startDate ? format(new Date(seq.startDate), "PP") : "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                    {!sequences?.length && (
                                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No sequences defined.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Assignments Card */}
                <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Sequence Assignments</CardTitle>
                            <CardDescription>Bind sequences to document categories</CardDescription>
                        </div>
                        <Dialog open={openAssgn} onOpenChange={setOpenAssgn}>
                            <DialogTrigger asChild>
                                <Button size="sm"><LinkIcon className="mr-2 h-4 w-4" /> Assign</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Assign Document Sequence</DialogTitle>
                                </DialogHeader>
                                <Form {...assgnForm}>
                                    <form onSubmit={assgnForm.handleSubmit((v) => assgnMutation.mutate(v))} className="space-y-4">
                                        <FormField control={assgnForm.control} name="sequenceId" render={({ field }) => (
                                            <FormItem><FormLabel>Sequence</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select sequence..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {sequences?.map(s => (
                                                            <SelectItem key={s.id} value={s.id}>{s.name} ({s.type})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={assgnForm.control} name="contextType" render={({ field }) => (
                                                <FormItem><FormLabel>Context Level</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="LEDGER">Ledger</SelectItem><SelectItem value="LEGAL_ENTITY">Legal Entity</SelectItem></SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={assgnForm.control} name="contextValue" render={({ field }) => (
                                                <FormItem><FormLabel>Context ID / Name</FormLabel><FormControl><Input placeholder="e.g. PRIMARY" {...field} /></FormControl></FormItem>
                                            )} />
                                        </div>

                                        <FormField control={assgnForm.control} name="documentCategory" render={({ field }) => (
                                            <FormItem><FormLabel>Document Category / Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select transaction type..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {transactionTypes?.map(tx => (
                                                            <SelectItem key={tx.id} value={tx.id}>{tx.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />

                                        <FormField control={assgnForm.control} name="startDate" render={({ field }) => (
                                            <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                                        )} />
                                        <DialogFooter>
                                            <Button type="submit" disabled={assgnMutation.isPending}>
                                                {assgnMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Assignment
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {assgnLoading ? (
                            <div className="h-32 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sequence</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Category</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignments?.map(assgn => (
                                        <TableRow key={assgn.id}>
                                            <TableCell className="font-medium">
                                                {sequences?.find(s => s.id === assgn.sequenceId)?.name || 'Unknown'}
                                            </TableCell>
                                            <TableCell>{assgn.contextType}</TableCell>
                                            <TableCell>{assgn.contextValue}</TableCell>
                                            <TableCell>
                                                {transactionTypes?.find(tx => tx.id === assgn.documentCategory)?.name || assgn.documentCategory}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!assignments?.length && (
                                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No sequences assigned yet.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
