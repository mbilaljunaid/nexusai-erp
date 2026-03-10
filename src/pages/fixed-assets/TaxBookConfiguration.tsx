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
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen } from "lucide-react";

type DepreciationMethod = "200DB MACRS" | "150DB MACRS" | "SL MACRS" | "ADS SL" | "Bonus" | "Section 179";
type Convention = "Half-Year" | "Mid-Quarter" | "Mid-Month" | "Full-Month" | "Next Month";

interface TaxBook {
    id: string;
    bookName: string;
    bookCode: string;
    taxAuthority: string;
    sourceBook: string;
    defaultDepreciationMethod: DepreciationMethod;
    defaultConvention: Convention;
    bonusPercentage?: number;
    allowBonus: boolean;
    allowSection179: boolean;
    isActive: boolean;
}

const MOCK_TAX_BOOKS: TaxBook[] = [
    { id: "1", bookName: "Federal Tax — MACRS", bookCode: "US-FED-MACRS", taxAuthority: "IRS (Federal)", sourceBook: "Corporate", defaultDepreciationMethod: "200DB MACRS", defaultConvention: "Half-Year", allowBonus: true, bonusPercentage: 60, allowSection179: true, isActive: true },
    { id: "2", bookName: "Federal Tax — ADS", bookCode: "US-FED-ADS", taxAuthority: "IRS (Federal)", sourceBook: "Corporate", defaultDepreciationMethod: "ADS SL", defaultConvention: "Half-Year", allowBonus: false, allowSection179: false, isActive: true },
    { id: "3", bookName: "State Tax — California", bookCode: "US-CA-STATE", taxAuthority: "California FTB", sourceBook: "Corporate", defaultDepreciationMethod: "SL MACRS", defaultConvention: "Half-Year", allowBonus: false, allowSection179: true, isActive: true },
];

const formSchema = z.object({
    bookName: z.string().min(1, "Book name required"),
    bookCode: z.string().min(1, "Book code required").max(10, "Max 10 chars").toUpperCase(),
    taxAuthority: z.string().min(1, "Tax authority required"),
    sourceBook: z.string().min(1, "Source book required"),
    defaultDepreciationMethod: z.enum(["200DB MACRS", "150DB MACRS", "SL MACRS", "ADS SL", "Bonus", "Section 179"]),
    defaultConvention: z.enum(["Half-Year", "Mid-Quarter", "Mid-Month", "Full-Month", "Next Month"]),
    allowBonus: z.boolean().default(false),
    bonusPercentage: z.string().optional(),
    allowSection179: z.boolean().default(false),
});

export default function TaxBookConfiguration() {
    const { toast } = useToast();
    const [books, setBooks] = useState<TaxBook[]>(MOCK_TAX_BOOKS);
    const [createOpen, setCreateOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bookName: "", bookCode: "", taxAuthority: "IRS (Federal)", sourceBook: "Corporate",
            defaultDepreciationMethod: "200DB MACRS", defaultConvention: "Half-Year",
            allowBonus: false, bonusPercentage: "", allowSection179: false,
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const newBook: TaxBook = {
            id: String(books.length + 1),
            bookName: values.bookName,
            bookCode: values.bookCode.toUpperCase(),
            taxAuthority: values.taxAuthority,
            sourceBook: values.sourceBook,
            defaultDepreciationMethod: values.defaultDepreciationMethod,
            defaultConvention: values.defaultConvention,
            allowBonus: values.allowBonus,
            allowSection179: values.allowSection179,
            bonusPercentage: values.bonusPercentage ? parseFloat(values.bonusPercentage) : undefined,
            isActive: true,
        };
        setBooks(prev => [...prev, newBook]);
        form.reset();
        setCreateOpen(false);
        toast({ title: "Tax Book Created", description: `${values.bookName} created and linked to ${values.sourceBook} book.` });
    };

    const columns: SpreadsheetColumn<TaxBook>[] = useMemo(() => [
        { id: "bookCode", header: "Book Code", width: "130px", cellClassName: "font-mono text-sm font-bold", cell: (r) => r.bookCode },
        { id: "bookName", header: "Book Name", width: "210px", cellClassName: "font-medium", cell: (r) => r.bookName },
        { id: "taxAuthority", header: "Tax Authority", width: "160px", cellClassName: "text-sm", cell: (r) => r.taxAuthority },
        { id: "sourceBook", header: "Source Book", width: "120px", cell: (r) => <Badge variant="outline">{r.sourceBook}</Badge> },
        { id: "method", header: "Default Method", width: "160px", cellClassName: "text-sm font-mono", cell: (r) => r.defaultDepreciationMethod },
        { id: "convention", header: "Convention", width: "130px", cellClassName: "text-sm", cell: (r) => r.defaultConvention },
        {
            id: "bonus", header: "Bonus %", width: "90px",
            cellClassName: "text-center font-mono",
            cell: (r) => r.allowBonus ? <span className="text-green-600 font-bold">{r.bonusPercentage}%</span> : <span className="text-muted-foreground">—</span>,
        },
        {
            id: "s179", header: "§ 179", width: "70px",
            cellClassName: "text-center",
            cell: (r) => r.allowSection179 ? "✅" : "—",
        },
        { id: "isActive", header: "Status", width: "90px", cell: (r) => <Badge variant={r.isActive ? "default" : "secondary"}>{r.isActive ? "Active" : "Inactive"}</Badge> },
    ], []);

    return (
        <StandardPage
            title="Tax Book Configuration"
            description="Define separate depreciation books for tax purposes. Tax books (MACRS, ADS, Bonus, Section 179) are in addition to the Corporate book and use different depreciation rules for tax reporting."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Fixed Assets", href: "/finance/fixed-assets" },
                { label: "Tax Book Configuration" },
            ]}
            actions={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Tax Book
                </Button>
            }
        >
            {/* Info banner */}
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary">
                <strong>Oracle FA Parity:</strong> Tax books shadow the Corporate book. Assets are added to the Corporate book first, then automatically added to all linked Tax books. Each Tax book can have different depreciation methods, lives, and conventions.
            </div>

            <InteractiveSpreadsheet<TaxBook>
                data={books}
                columns={columns}
                onChange={() => { }}
                containerHeight="340px"
            />

            {/* MACRS Reference Card */}
            <div className="mt-4 grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">MACRS Property Classes (IRS GDS)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-1">
                        {[
                            ["3-Year", "Racehorses, small tools — 200DB HY"],
                            ["5-Year", "Computers, autos, R&D equipment — 200DB HY"],
                            ["7-Year", "Office furniture, most manufacturing — 200DB HY"],
                            ["15-Year", "Land improvements, paving — 150DB HY"],
                            ["27.5-Year", "Residential rental property — SL MM"],
                            ["39-Year", "Non-residential real property — SL MM"],
                        ].map(([cls, desc]) => (
                            <div key={cls} className="flex gap-2">
                                <span className="font-mono font-semibold w-16 shrink-0">{cls}</span>
                                <span>{desc}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Bonus Depreciation Rules (TCJA 2017)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-1">
                        {[
                            ["2022", "100% bonus — full first-year expensing"],
                            ["2023", "80% bonus depreciation"],
                            ["2024", "60% bonus depreciation"],
                            ["2025", "40% bonus depreciation"],
                            ["2026", "20% bonus depreciation"],
                            ["2027+", "0% (unless Congress extends)"],
                        ].map(([yr, pct]) => (
                            <div key={yr} className="flex gap-2">
                                <span className="font-mono font-semibold w-12 shrink-0">{yr}</span>
                                <span>{pct}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> New Tax Book</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="bookName" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Book Name *</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g. Federal Tax — MACRS" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="bookCode" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Book Code * (max 10)</FormLabel>
                                        <FormControl><Input {...field} className="font-mono uppercase" placeholder="US-FED" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="taxAuthority" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tax Authority</FormLabel>
                                        <FormControl><Input {...field} placeholder="IRS (Federal)" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="sourceBook" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source (Corporate) Book *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Corporate">Corporate</SelectItem>
                                                <SelectItem value="IFRS16">IFRS 16</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="defaultDepreciationMethod" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Method *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["200DB MACRS", "150DB MACRS", "SL MACRS", "ADS SL", "Bonus", "Section 179"].map(m => (
                                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="defaultConvention" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Convention *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["Half-Year", "Mid-Quarter", "Mid-Month", "Full-Month", "Next Month"].map(c => (
                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="allowBonus" render={({ field }) => (
                                    <FormItem className="flex items-center gap-3 rounded-lg border p-3">
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <FormLabel className="!mt-0">Allow Bonus Depreciation</FormLabel>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="bonusPercentage" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bonus %</FormLabel>
                                        <FormControl><Input {...field} type="number" min="0" max="100" step="1" className="font-mono" placeholder="e.g. 60" disabled={!form.watch("allowBonus")} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="allowSection179" render={({ field }) => (
                                    <FormItem className="flex items-center gap-3 rounded-lg border p-3 col-span-2">
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <FormLabel className="!mt-0">Allow Section 179 Immediate Expensing</FormLabel>
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Tax Book</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
