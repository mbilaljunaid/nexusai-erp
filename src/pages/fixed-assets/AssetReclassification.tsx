import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

interface AssetReclassification {
    id: string;
    requestNumber: string;
    assetNumber: string;
    assetDescription: string;
    fromCategory: string;
    toCategory: string;
    fromDepreciationMethod: string;
    toDepreciationMethod: string;
    fromLife: string;
    toLife: string;
    netBookValue: number;
    currency: string;
    effectivePeriod: string;
    reason: string;
    status: "Draft" | "Pending GL" | "Posted" | "Rejected";
    submittedBy: string;
    submittedDate: string;
}

const MOCK_RECLASSIFICATIONS: AssetReclassification[] = [
    {
        id: "RC-001", requestNumber: "RECLASSIFY-2026-001", assetNumber: "FA-2204", assetDescription: "Dell PowerEdge Server R750",
        fromCategory: "IT Equipment", toCategory: "Computer Equipment (5-yr)", fromDepreciationMethod: "Straight Line", toDepreciationMethod: "200DB MACRS",
        fromLife: "4 Years", toLife: "5 Years", netBookValue: 18400, currency: "USD", effectivePeriod: "Mar-26",
        reason: "Reclassify to align with MACRS 5-year class for tax book reporting", status: "Pending GL",
        submittedBy: "Alex Turner", submittedDate: "2026-03-25",
    },
    {
        id: "RC-002", requestNumber: "RECLASSIFY-2026-002", assetNumber: "FA-1890", assetDescription: "Modular Office Partition System",
        fromCategory: "Leasehold Improvements (39-yr)", toCategory: "Furniture & Fixtures (7-yr)", fromDepreciationMethod: "Straight Line", toDepreciationMethod: "200DB MACRS",
        fromLife: "39 Years", toLife: "7 Years", netBookValue: 34200, currency: "USD", effectivePeriod: "Feb-26",
        reason: "Reclassify standalone partitions from leasehold improvements — movable, not permanent fixture", status: "Posted",
        submittedBy: "Sara Ahmad", submittedDate: "2026-02-10",
    },
    {
        id: "RC-003", requestNumber: "RECLASSIFY-2026-003", assetNumber: "FA-2401", assetDescription: "Custom CRM Software License — Perpetual",
        fromCategory: "Other Intangibles", toCategory: "Computer Software (3-yr)", fromDepreciationMethod: "Straight Line", toDepreciationMethod: "SL MACRS",
        fromLife: "5 Years", toLife: "3 Years", netBookValue: 62000, currency: "USD", effectivePeriod: "Mar-26",
        reason: "Identified as off-the-shelf software — reclassify to MACRS 3-yr per IRS Rev. Proc. 2000-50", status: "Draft",
        submittedBy: "Michael Chen", submittedDate: "2026-03-28",
    },
];

const ASSET_CATEGORIES = [
    "Computer Equipment (5-yr)", "Computer Software (3-yr)", "Furniture & Fixtures (7-yr)",
    "Machinery & Equipment (7-yr)", "Vehicles (5-yr)", "Leasehold Improvements (39-yr)",
    "IT Equipment", "Other Intangibles", "Land Improvements (15-yr)",
];
const DEPR_METHODS = ["Straight Line", "200DB MACRS", "150DB MACRS", "SL MACRS", "ADS SL", "Units of Production"];
const LIVES = ["3 Years", "5 Years", "7 Years", "10 Years", "15 Years", "20 Years", "27.5 Years", "39 Years"];

const statusColors: Record<AssetReclassification["status"], string> = {
    Draft: "secondary",
    "Pending GL": "outline",
    Posted: "default",
    Rejected: "destructive",
};

const formSchema = z.object({
    assetNumber: z.string().min(1, "Asset number required"),
    assetDescription: z.string().min(1),
    fromCategory: z.string().min(1),
    toCategory: z.string().min(1),
    fromDepreciationMethod: z.string().min(1),
    toDepreciationMethod: z.string().min(1),
    fromLife: z.string().min(1),
    toLife: z.string().min(1),
    netBookValue: z.string().min(1),
    currency: z.string().min(1),
    effectivePeriod: z.string().min(1),
    reason: z.string().min(10, "Reason must be at least 10 characters"),
});

export default function AssetReclassification() {
    const { toast } = useToast();
    const [reclassifications, setReclassifications] = useState<AssetReclassification[]>(MOCK_RECLASSIFICATIONS);
    const [createOpen, setCreateOpen] = useState(false);
    const [postConfirm, setPostConfirm] = useState<AssetReclassification | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            assetNumber: "", assetDescription: "", fromCategory: "", toCategory: "",
            fromDepreciationMethod: "Straight Line", toDepreciationMethod: "200DB MACRS",
            fromLife: "5 Years", toLife: "5 Years", netBookValue: "", currency: "USD",
            effectivePeriod: "Mar-26", reason: "",
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const req: AssetReclassification = {
            id: `RC-${String(reclassifications.length + 1).padStart(3, "0")}`,
            requestNumber: `RECLASSIFY-2026-${String(reclassifications.length + 1).padStart(3, "0")}`,
            assetNumber: values.assetNumber,
            assetDescription: values.assetDescription,
            fromCategory: values.fromCategory,
            toCategory: values.toCategory,
            fromDepreciationMethod: values.fromDepreciationMethod,
            toDepreciationMethod: values.toDepreciationMethod,
            fromLife: values.fromLife,
            toLife: values.toLife,
            netBookValue: parseFloat(values.netBookValue),
            currency: values.currency,
            effectivePeriod: values.effectivePeriod,
            reason: values.reason,
            status: "Pending GL",
            submittedBy: "Current User",
            submittedDate: new Date().toISOString().slice(0, 10),
        };
        setReclassifications(prev => [req, ...prev]);
        form.reset();
        setCreateOpen(false);
        toast({ title: "Reclassification Submitted", description: `${req.requestNumber} — pending GL accounting entries.` });
    };

    const handlePost = () => {
        if (!postConfirm) return;
        setReclassifications(prev => prev.map(r => r.id === postConfirm.id ? { ...r, status: "Posted" } : r));
        toast({
            title: "Reclassification Posted",
            description: `${postConfirm.requestNumber}: GL journal created. Asset ${postConfirm.assetNumber} reclassified from "${postConfirm.fromCategory}" to "${postConfirm.toCategory}". Depreciation will restart using the new method.`,
        });
        setPostConfirm(null);
    };

    const columns: SpreadsheetColumn<AssetReclassification>[] = useMemo(() => [
        { id: "requestNumber", header: "Request #", width: "160px", cellClassName: "font-mono text-sm font-medium", cell: r => r.requestNumber },
        { id: "assetNumber", header: "Asset #", width: "100px", cellClassName: "font-mono text-sm font-bold", cell: r => r.assetNumber },
        { id: "assetDescription", header: "Asset Description", width: "220px", cellClassName: "text-sm font-medium", cell: r => r.assetDescription },
        {
            id: "reclassification", header: "From Category → To Category", width: "300px",
            cell: r => (
                <div className="text-xs flex items-center gap-1">
                    <span className="text-muted-foreground max-w-24 truncate">{r.fromCategory}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-primary" />
                    <span className="font-medium max-w-28 truncate">{r.toCategory}</span>
                </div>
            ),
        },
        { id: "netBookValue", header: "NBV", width: "120px", cellClassName: "text-right font-mono font-medium", cell: r => `${r.currency} ${formatNumber(r.netBookValue)}` },
        { id: "effectivePeriod", header: "Period", width: "85px", cellClassName: "font-mono text-sm", cell: r => r.effectivePeriod },
        { id: "status", header: "Status", width: "110px", cell: r => <Badge variant={statusColors[r.status] as any}>{r.status}</Badge> },
        {
            id: "actions", header: "Actions", width: "120px",
            cell: r => r.status === "Pending GL" ? (
                <Button size="sm" className="h-7 px-2 text-xs" onClick={() => setPostConfirm(r)}>Post to GL</Button>
            ) : null,
        },
    ], []);

    return (
        <StandardPage
            title="Asset Category Reclassification"
            description="Reclassify fixed assets from one category to another, updating depreciation method, life, and GL accounts. Generates accounting entries for historical depreciation catch-up or write-back."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Fixed Assets", href: "/finance/fixed-assets" },
                { label: "Reclassification" },
            ]}
            actions={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Reclassification
                </Button>
            }
        >
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span><strong>Oracle FA Parity:</strong> Reclassification does not create a new asset — it changes the category, method, and life of the existing asset. The GL creates a debit to the new accumulated depreciation account and a credit to the old account for the historical difference.</span>
            </div>

            <InteractiveSpreadsheet<AssetReclassification>
                data={reclassifications}
                columns={columns}
                onChange={() => { }}
                containerHeight="380px"
            />

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><ArrowRight className="h-5 w-5 text-primary" /> New Asset Reclassification</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2">
                            <div className="grid grid-cols-3 gap-3">
                                <FormField control={form.control} name="assetNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asset # *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono" placeholder="FA-XXXX" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="assetDescription" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Asset Description *</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            {/* From / To Category */}
                            <div className="border rounded-lg p-3 bg-muted/30">
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Reclassification (From → To)</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {(["fromCategory", "toCategory"] as const).map((fieldName, i) => (
                                        <FormField key={fieldName} control={form.control} name={fieldName} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{i === 0 ? "From Category" : "To Category"} *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {ASSET_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    ))}
                                    {(["fromDepreciationMethod", "toDepreciationMethod"] as const).map((fieldName, i) => (
                                        <FormField key={fieldName} control={form.control} name={fieldName} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{i === 0 ? "From Method" : "To Method"} *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {DEPR_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                    ))}
                                    {(["fromLife", "toLife"] as const).map((fieldName, i) => (
                                        <FormField key={fieldName} control={form.control} name={fieldName} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{i === 0 ? "From Life" : "To Life"} *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {LIVES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <FormField control={form.control} name="netBookValue" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current NBV *</FormLabel>
                                        <FormControl><Input {...field} type="number" step="0.01" className="font-mono" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="currency" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["USD", "EUR", "GBP", "AED"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="effectivePeriod" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Effective Period *</FormLabel>
                                        <FormControl><Input {...field} className="font-mono" placeholder="Mar-26" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="reason" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reclassification Reason *</FormLabel>
                                    <FormControl><Textarea {...field} rows={2} placeholder="Business justification for asset category change..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="submit">Submit Reclassification</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Post Confirm */}
            <AlertDialog open={!!postConfirm} onOpenChange={() => setPostConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Post Reclassification to GL</AlertDialogTitle>
                        <AlertDialogDescription>
                            Asset <strong>{postConfirm?.assetNumber}</strong> will be reclassified from <strong>"{postConfirm?.fromCategory}"</strong> → <strong>"{postConfirm?.toCategory}"</strong>. The system will generate GL accounting entries for historical depreciation adjustments. Depreciation will resume using <strong>{postConfirm?.toDepreciationMethod}</strong> over <strong>{postConfirm?.toLife}</strong>. This cannot be reversed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePost}>Post to GL</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
