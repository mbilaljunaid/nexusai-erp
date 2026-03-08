import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Lock, Unlock } from "lucide-react";

type HoldCategory = "Matching" | "Manual" | "Tax" | "Distribution" | "Currency" | "Amount";
type AutoReleaseRule = "System" | "Manual Only" | "Approval Required";

interface HoldType {
    id: string;
    holdCode: string;
    description: string;
    category: HoldCategory;
    autoReleaseRule: AutoReleaseRule;
    isActive: boolean;
    canBeAppliedManually: boolean;
    requiresJustification: boolean;
}

const MOCK_HOLD_TYPES: HoldType[] = [
    { id: "1", holdCode: "QTY ORDERED", description: "Quantity Ordered Variance Hold", category: "Matching", autoReleaseRule: "System", isActive: true, canBeAppliedManually: false, requiresJustification: false },
    { id: "2", holdCode: "QTY REC", description: "Quantity Received Variance Hold", category: "Matching", autoReleaseRule: "System", isActive: true, canBeAppliedManually: false, requiresJustification: false },
    { id: "3", holdCode: "PRICE", description: "Price Tolerance Hold", category: "Matching", autoReleaseRule: "System", isActive: true, canBeAppliedManually: false, requiresJustification: false },
    { id: "4", holdCode: "INSP REQUIRED", description: "Inspection Required (4-Way Match)", category: "Matching", autoReleaseRule: "Approval Required", isActive: true, canBeAppliedManually: false, requiresJustification: false },
    { id: "5", holdCode: "MANUAL HOLD", description: "Manual Hold — Generic", category: "Manual", autoReleaseRule: "Manual Only", isActive: true, canBeAppliedManually: true, requiresJustification: true },
    { id: "6", holdCode: "TAX VARIANCE", description: "Calculated Tax Does Not Match Invoice Tax", category: "Tax", autoReleaseRule: "Approval Required", isActive: true, canBeAppliedManually: false, requiresJustification: false },
    { id: "7", holdCode: "DIST ERROR", description: "Distribution Account Invalid or Missing", category: "Distribution", autoReleaseRule: "System", isActive: true, canBeAppliedManually: false, requiresJustification: false },
    { id: "8", holdCode: "CURRENCY", description: "Currency Conversion Rate Not Found", category: "Currency", autoReleaseRule: "System", isActive: true, canBeAppliedManually: false, requiresJustification: false },
    { id: "9", holdCode: "AMOUNT LIMIT", description: "Invoice Amount Exceeds Approval Threshold", category: "Amount", autoReleaseRule: "Approval Required", isActive: true, canBeAppliedManually: false, requiresJustification: false },
];

const categoryColors: Record<HoldCategory, string> = {
    Matching: "default",
    Manual: "secondary",
    Tax: "outline",
    Distribution: "outline",
    Currency: "outline",
    Amount: "destructive",
};

const formSchema = z.object({
    holdCode: z.string().min(1, "Hold code required").max(25, "Max 25 chars").toUpperCase(),
    description: z.string().min(1, "Description required"),
    category: z.enum(["Matching", "Manual", "Tax", "Distribution", "Currency", "Amount"]),
    autoReleaseRule: z.enum(["System", "Manual Only", "Approval Required"]),
    canBeAppliedManually: z.boolean().default(false),
    requiresJustification: z.boolean().default(false),
});

export default function InvoiceHoldTypesConfig() {
    const { toast } = useToast();
    const [holdTypes, setHoldTypes] = useState<HoldType[]>(MOCK_HOLD_TYPES);
    const [createOpen, setCreateOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            holdCode: "", description: "", category: "Manual",
            autoReleaseRule: "Manual Only", canBeAppliedManually: true, requiresJustification: true,
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const newHold: HoldType = {
            id: String(holdTypes.length + 1),
            holdCode: values.holdCode.toUpperCase(),
            description: values.description,
            category: values.category,
            autoReleaseRule: values.autoReleaseRule,
            canBeAppliedManually: values.canBeAppliedManually,
            requiresJustification: values.requiresJustification,
            isActive: true,
        };
        setHoldTypes(prev => [...prev, newHold]);
        form.reset();
        setCreateOpen(false);
        toast({ title: "Hold Type Created", description: `Hold code "${values.holdCode}" created successfully.` });
    };

    const toggleActive = (id: string) => {
        setHoldTypes(prev => prev.map(h => h.id === id ? { ...h, isActive: !h.isActive } : h));
        const hold = holdTypes.find(h => h.id === id);
        if (hold) toast({ title: hold.isActive ? "Hold Type Deactivated" : "Hold Type Activated", description: hold.holdCode });
    };

    const columns: SpreadsheetColumn<HoldType>[] = useMemo(() => [
        { id: "holdCode", header: "Hold Code", width: "160px", cellClassName: "font-mono text-sm font-bold", cell: (r) => r.holdCode },
        { id: "description", header: "Description", width: "280px", cellClassName: "text-sm", cell: (r) => r.description },
        { id: "category", header: "Category", width: "120px", cell: (r) => <Badge variant={categoryColors[r.category] as any}>{r.category}</Badge> },
        { id: "autoReleaseRule", header: "Release Rule", width: "170px", cellClassName: "text-xs text-muted-foreground", cell: (r) => r.autoReleaseRule },
        { id: "canBeAppliedManually", header: "Manual Apply", width: "110px", cellClassName: "text-center", cell: (r) => r.canBeAppliedManually ? "✅" : "—" },
        { id: "requiresJustification", header: "Justification", width: "110px", cellClassName: "text-center", cell: (r) => r.requiresJustification ? "✅" : "—" },
        {
            id: "isActive", header: "Active", width: "90px",
            cell: (r) => (
                <Badge
                    variant={r.isActive ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleActive(r.id)}
                >
                    {r.isActive ? <Unlock className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
                    {r.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
    ], [holdTypes]);

    const byCategory = (cat: HoldCategory) => holdTypes.filter(h => h.category === cat);

    return (
        <StandardPage
            title="Invoice Hold Types Configuration"
            description="Define hold codes that control when AP invoices are held from payment. System holds are applied automatically by matching engines; manual holds can be applied by AP users."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Payable", href: "/finance/ap" },
                { label: "Setup", href: "/finance/ap/config" },
                { label: "Hold Types" },
            ]}
            actions={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Hold Type
                </Button>
            }
        >
            {/* Category summary */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                {(["Matching", "Manual", "Tax", "Distribution", "Currency", "Amount"] as HoldCategory[]).map(cat => (
                    <Card key={cat} className="border-l-4 border-l-muted">
                        <CardContent className="p-3">
                            <p className="text-xs text-muted-foreground">{cat}</p>
                            <p className="text-2xl font-bold font-mono">{byCategory(cat).length}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <InteractiveSpreadsheet<HoldType>
                data={holdTypes}
                columns={columns}
                onChange={() => { }}
                containerHeight="460px"
            />

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> New Hold Type</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="holdCode" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hold Code * (max 25)</FormLabel>
                                        <FormControl><Input {...field} className="font-mono uppercase" placeholder="MY HOLD CODE" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["Matching", "Manual", "Tax", "Distribution", "Currency", "Amount"].map(c => (
                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="autoReleaseRule" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Auto-Release Rule *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="System">System (auto-released when condition resolves)</SelectItem>
                                                <SelectItem value="Manual Only">Manual Only (AP user releases)</SelectItem>
                                                <SelectItem value="Approval Required">Approval Required (supervisor approves)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {(["canBeAppliedManually", "requiresJustification"] as const).map(fieldName => (
                                    <FormField key={fieldName} control={form.control} name={fieldName} render={({ field }) => (
                                        <FormItem className="flex items-center gap-3 rounded-lg border p-3">
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel className="cursor-pointer !mt-0 text-sm">
                                                {fieldName === "canBeAppliedManually" ? "Can Be Applied Manually" : "Requires Justification Text"}
                                            </FormLabel>
                                        </FormItem>
                                    )} />
                                ))}
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Hold Type</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
