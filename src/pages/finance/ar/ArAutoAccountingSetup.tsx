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
import { Loader2, Plus } from "lucide-react";

// Matches API response structure
interface AutoAccountingRule {
    id: string;
    ruleName: string;
    accountClass: string;
    segment1Source: string;
    segment2Source: string;
    segment3Source: string;
    segment4Source: string;
    segment5Source: string;
    enabledFlag: boolean;
    ledgerId: string;
}

const ruleSchema = z.object({
    ruleName: z.string().min(1, "Rule Name is required"),
    accountClass: z.string().min(1, "Account Class is required"),
    ledgerId: z.string().min(1, "Ledger ID is required"),
    segment1Source: z.string().optional(),
    segment2Source: z.string().optional(),
    segment3Source: z.string().optional(),
    segment4Source: z.string().optional(),
    segment5Source: z.string().optional(),
});

export default function ArAutoAccountingSetup() {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const { data: rules, isLoading } = useQuery<AutoAccountingRule[]>({
        queryKey: ['/api/ar/config/autoaccounting-rules'],
    });

    const form = useForm<z.infer<typeof ruleSchema>>({
        resolver: zodResolver(ruleSchema),
        defaultValues: {
            ruleName: "",
            accountClass: "Revenue",
            ledgerId: "PRIMARY",
            segment1Source: "Constant",
            segment2Source: "Salesrep",
            segment3Source: "Memo Line",
            segment4Source: "Customer Site",
            segment5Source: "Constant",
        }
    });

    const sourceOptions = [
        "Constant",
        "Customer Site",
        "Salesrep",
        "Memo Line",
        "Transaction Type"
    ];

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof ruleSchema>) => {
            const res = await fetch('/api/ar/config/autoaccounting-rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    enabledFlag: true
                })
            });
            if (!res.ok) throw new Error("Failed to create rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/ar/config/autoaccounting-rules'] });
            setOpen(false);
            form.reset();
        }
    });

    function onSubmit(values: z.infer<typeof ruleSchema>) {
        mutation.mutate(values);
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto h-full overflow-y-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AutoAccounting Setup</h1>
                    <p className="text-muted-foreground mt-2">
                        Configure dynamic GL segment derivation rules for AR transactions. Map each segment to its specific source (e.g. Cost Center to Memo Line).
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Derivation Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create AutoAccounting Rule</DialogTitle>
                            <DialogDescription>Define how CCID segments should be derived for a target account class.</DialogDescription>
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
                                                    <Input placeholder="e.g. Standard Revenue Mapping" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="accountClass"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Account Class Target</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select class" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Revenue">Revenue</SelectItem>
                                                        <SelectItem value="Receivable">Receivable</SelectItem>
                                                        <SelectItem value="Tax">Tax</SelectItem>
                                                        <SelectItem value="Freight">Freight</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="ledgerId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ledger ID</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. PRIMARY" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="mt-6 border rounded-md p-4 bg-muted/20">
                                    <h4 className="font-medium mb-4">Segment Source Mappings</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <FormField
                                                key={num}
                                                control={form.control}
                                                name={`segment${num}Source` as any}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Segment {num} Source</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Source" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {sourceOptions.map(opt => (
                                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="submit" disabled={mutation.isPending}>
                                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Rule
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Derivation Matrix</CardTitle>
                    <CardDescription>Rules currently evaluating during line generation.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="h-24 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rule Name</TableHead>
                                    <TableHead>Target Class</TableHead>
                                    <TableHead>Segment 1</TableHead>
                                    <TableHead>Segment 2</TableHead>
                                    <TableHead>Segment 3</TableHead>
                                    <TableHead>Segment 4</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules?.map((rule) => (
                                    <TableRow key={rule.id}>
                                        <TableCell className="font-medium">{rule.ruleName}</TableCell>
                                        <TableCell>{rule.accountClass}</TableCell>
                                        <TableCell>{rule.segment1Source}</TableCell>
                                        <TableCell>{rule.segment2Source}</TableCell>
                                        <TableCell>{rule.segment3Source}</TableCell>
                                        <TableCell>{rule.segment4Source}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rule.enabledFlag ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {rule.enabledFlag ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!rules?.length && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                            No AutoAccounting rules defined. Create one to begin generating dynamic CCIDs.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
