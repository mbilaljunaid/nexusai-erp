import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription
} from "@/components/ui/form";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, CalendarDays } from "lucide-react";
import { useTenantLocale } from "@/hooks/use-tenant-locale";

interface ProrateConvention {
    id: string;
    name: string;
    type: "Full Month" | "Half Year" | "Mid-Month" | "Actual Days" | "Next Month";
    description: string;
    effectiveDate: string;
    isActive: boolean;
}

const MOCK_CONVENTIONS: ProrateConvention[] = [
    { id: "PC-001", name: "Full Month", type: "Full Month", description: "Full month credit in the period of acquisition", effectiveDate: "2020-01-01", isActive: true },
    { id: "PC-002", name: "Half Year Convention", type: "Half Year", description: "6 months depreciation in first and last year (IRS default)", effectiveDate: "2020-01-01", isActive: true },
    { id: "PC-003", name: "Mid-Month", type: "Mid-Month", description: "Mid-month credit regardless of acquisition day", effectiveDate: "2020-01-01", isActive: true },
    { id: "PC-004", name: "Actual Days Convention", type: "Actual Days", description: "Precise daily proration from date placed in service", effectiveDate: "2022-01-01", isActive: true },
    { id: "PC-005", name: "Next Month", type: "Next Month", description: "Start depreciation in the month following placement in service", effectiveDate: "2020-01-01", isActive: false },
];

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["Full Month", "Half Year", "Mid-Month", "Actual Days", "Next Month"]),
    description: z.string().optional(),
    effectiveDate: z.string().min(1, "Effective date is required"),
    isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

export default function ProrateConventionSetup() {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [conventions, setConventions] = useState<ProrateConvention[]>(MOCK_CONVENTIONS);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", type: "Full Month", description: "", effectiveDate: new Date().toISOString().split("T")[0], isActive: true },
    });

    const onSubmit = (values: FormValues) => {
        const newConvention: ProrateConvention = {
            id: `PC-${String(conventions.length + 1).padStart(3, "0")}`,
            name: values.name,
            type: values.type,
            description: values.description || "",
            effectiveDate: values.effectiveDate,
            isActive: values.isActive,
        };
        setConventions(prev => [...prev, newConvention]);
        form.reset();
        setOpen(false);
        toast({ title: "Prorate Convention Created", description: `"${values.name}" has been added.` });
    };

    const typeColors: Record<string, string> = {
        "Full Month": "default",
        "Half Year": "secondary",
        "Mid-Month": "outline",
        "Actual Days": "outline",
        "Next Month": "secondary",
    };

    const columns: SpreadsheetColumn<ProrateConvention>[] = useMemo(() => [
        {
            id: "id", header: "Convention ID", width: "120px",
            cellClassName: "font-mono text-xs text-muted-foreground",
            cell: (r) => r.id,
        },
        {
            id: "name", header: "Convention Name", width: "200px",
            cellClassName: "font-medium",
            cell: (r) => r.name,
        },
        {
            id: "type", header: "Type", width: "160px",
            cell: (r) => <Badge variant={(typeColors[r.type] || "outline") as any}>{r.type}</Badge>,
        },
        {
            id: "description", header: "Description", width: "300px",
            cellClassName: "text-muted-foreground text-sm",
            cell: (r) => r.description,
        },
        {
            id: "effectiveDate", header: "Effective From", width: "130px",
            cellClassName: "font-mono text-sm",
            cell: (r) => r.effectiveDate,
        },
        {
            id: "isActive", header: "Status", width: "100px",
            cell: (r) => (
                <Badge variant={r.isActive ? "default" : "secondary"}>
                    {r.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
    ], []);

    return (
        <StandardPage
            title="Prorate Convention Setup"
            description="Configure Oracle FA prorate conventions that determine how much depreciation to take in the period an asset is placed in service or retired. Used by Corporate and Tax depreciation books."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Fixed Assets", href: "/finance/fixed-assets" },
                { label: "Prorate Conventions" },
            ]}
            actions={
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" /> New Convention
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-primary" />
                                Create Prorate Convention
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Convention Name *</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g. Half Year Convention" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="type" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Convention Type *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Full Month">Full Month</SelectItem>
                                                <SelectItem value="Half Year">Half Year</SelectItem>
                                                <SelectItem value="Mid-Month">Mid-Month</SelectItem>
                                                <SelectItem value="Actual Days">Actual Days</SelectItem>
                                                <SelectItem value="Next Month">Next Month</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription className="text-xs">
                                            Determines the depreciation proration in the acquisition and retirement period.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl><Input {...field} placeholder="Brief description of this convention..." /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="effectiveDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Effective Date *</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <DialogFooter>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>Save Convention</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            }
        >
            <div className="mb-4 p-4 bg-card border rounded-lg flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Total Conventions:</span>
                    <Badge variant="outline">{conventions.length}</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Active:</span>
                    <Badge variant="default">{conventions.filter(c => c.isActive).length}</Badge>
                </div>
            </div>

            <InteractiveSpreadsheet<ProrateConvention>
                data={conventions}
                columns={columns}
                onChange={setConventions}
                containerHeight="500px"
            />

            <div className="mt-4 text-xs text-muted-foreground">
                <strong>Oracle Parity:</strong> Prorate conventions are assigned per depreciation book and determine how much depreciation to
                take in the first and last period of an asset's life. The <em>Half Year Convention</em> is required for MACRS compliance under US tax law.
            </div>
        </StandardPage>
    );
}
