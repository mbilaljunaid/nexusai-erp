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
import { StandardPage } from '@/components/layout/StandardPage';

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

                </Dialog >
            </div >

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
        </StandardPage >
    );
}
