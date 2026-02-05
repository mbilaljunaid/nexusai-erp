import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Save, Settings, Layers, ShieldCheck, CreditCard, Receipt, Trash2 } from "lucide-react";

export default function ApSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch System Parameters
    const { data: params, isLoading: paramsLoading } = useQuery({
        queryKey: ['/api/ap/system-parameters'],
        queryFn: async () => (await apiRequest("GET", "/api/ap/system-parameters")).json()
    });

    // Fetch Distribution Sets
    const { data: distSets } = useQuery({
        queryKey: ['/api/ap/distribution-sets'],
        queryFn: async () => (await apiRequest("GET", "/api/ap/distribution-sets")).json()
    });

    // Form State
    const [formData, setFormData] = useState<any>({
        priceTolerancePercent: "0.05",
        qtyTolerancePercent: "0.05",
        taxTolerancePercent: "0.10",
        defaultPaymentTermsId: "Net 30",
        defaultCurrencyCode: "USD",
        defaultPayGroup: "STANDARD",
        defaultPaymentMethod: "CHECK",
        allowManualInvoiceNumber: true,
        invoiceCurrencyOverride: true,
        paymentCurrencyOverride: true,
        allowPaymentTermsOverride: true,
        accountOnValidation: true,
        accountOnPayment: true,
        allowDraftAccounting: true
    });

    // Dist Set Form State
    const [isDistDialogOpen, setIsDistDialogOpen] = useState(false);
    const [newSet, setNewSet] = useState({ name: "", description: "" });
    const [setLines, setSetLines] = useState([{ distCodeCombinationId: 1, distributionPercent: "100" }]);

    useEffect(() => {
        if (params) {
            setFormData({
                ...formData,
                ...params
            });
        }
    }, [params]);

    const updateParamsMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/ap/system-parameters", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Settings Saved", description: "Operational parameters updated successfully." });
            queryClient.invalidateQueries({ queryKey: ['/api/ap/system-parameters'] });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const createDistSetMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/ap/distribution-sets", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Set Created", description: "New distribution set template added." });
            queryClient.invalidateQueries({ queryKey: ['/api/ap/distribution-sets'] });
            setIsDistDialogOpen(false);
            setNewSet({ name: "", description: "" });
            setSetLines([{ distCodeCombinationId: 1, distributionPercent: "100" }]);
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleSave = () => {
        updateParamsMutation.mutate(formData);
    };

    const handleAddDistLine = () => {
        setSetLines([...setLines, { distCodeCombinationId: 1, distributionPercent: "0" }]);
    };

    const handleRemoveDistLine = (index: number) => {
        setSetLines(setLines.filter((_, i) => i !== index));
    };

    const handleCreateSet = () => {
        if (!newSet.name) return toast({ title: "Missing Name", description: "Please provide a name for the set.", variant: "destructive" });
        createDistSetMutation.mutate({
            header: newSet,
            lines: setLines
        });
    };

    if (paramsLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Payables Configuration</h1>
                        <p className="text-muted-foreground mt-1">Manage global business rules, tolerances, and accounting policies.</p>
                    </div>
                </div>
                <Button onClick={handleSave} className="shadow-lg shadow-primary/20" disabled={updateParamsMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save All Configurations
                </Button>
            </div>

            <Tabs defaultValue="options" className="w-full">
                <TabsList className="bg-background/95 backdrop-blur border p-1 rounded-xl shadow-sm mb-6 inline-flex w-auto">
                    <TabsTrigger value="options" className="rounded-lg px-6">Payables Options</TabsTrigger>
                    <TabsTrigger value="tolerances" className="rounded-lg px-6">Tolerances</TabsTrigger>
                    <TabsTrigger value="accounting" className="rounded-lg px-6">Accounting</TabsTrigger>
                    <TabsTrigger value="distribution" className="rounded-lg px-6">Distribution Sets</TabsTrigger>
                </TabsList>

                <TabsContent value="options" className="space-y-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Receipt className="h-4 w-4 text-primary" />
                                    Invoice Entry Defaults
                                </CardTitle>
                                <CardDescription>Default values for new invoice creation.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label>Default Currency</Label>
                                        <Select
                                            value={formData.defaultCurrencyCode}
                                            onValueChange={(v) => setFormData({ ...formData, defaultCurrencyCode: v })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Default Payment Terms</Label>
                                        <Select
                                            value={formData.defaultPaymentTermsId}
                                            onValueChange={(v) => setFormData({ ...formData, defaultPaymentTermsId: v })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Net 30">Net 30</SelectItem>
                                                <SelectItem value="Net 60">Net 60</SelectItem>
                                                <SelectItem value="Immediate">Immediate</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Manual Invoice Number Entry</Label>
                                            <p className="text-xs text-muted-foreground">Allow users to enter invoice numbers manually.</p>
                                        </div>
                                        <Switch
                                            checked={formData.allowManualInvoiceNumber}
                                            onCheckedChange={(c) => setFormData({ ...formData, allowManualInvoiceNumber: c })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Currency Override</Label>
                                            <p className="text-xs text-muted-foreground">Allow users to change currency on invoice header.</p>
                                        </div>
                                        <Switch
                                            checked={formData.invoiceCurrencyOverride}
                                            onCheckedChange={(c) => setFormData({ ...formData, invoiceCurrencyOverride: c })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Payment Terms Override</Label>
                                            <p className="text-xs text-muted-foreground">Allow overriding default terms at invoice level.</p>
                                        </div>
                                        <Switch
                                            checked={formData.allowPaymentTermsOverride}
                                            onCheckedChange={(c) => setFormData({ ...formData, allowPaymentTermsOverride: c })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    Payment Defaults
                                </CardTitle>
                                <CardDescription>Settings for automated payment processing.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label>Default Pay Group</Label>
                                        <Input
                                            value={formData.defaultPayGroup}
                                            onChange={(e) => setFormData({ ...formData, defaultPayGroup: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Default Payment Method</Label>
                                        <Select
                                            value={formData.defaultPaymentMethod}
                                            onValueChange={(v) => setFormData({ ...formData, defaultPaymentMethod: v })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CHECK">Check</SelectItem>
                                                <SelectItem value="EFT">Electronic Funds Transfer</SelectItem>
                                                <SelectItem value="WIRE">Wire Transfer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Payment Currency Override</Label>
                                            <p className="text-xs text-muted-foreground">Allow paying in a different currency than invoice.</p>
                                        </div>
                                        <Switch
                                            checked={formData.paymentCurrencyOverride}
                                            onCheckedChange={(c) => setFormData({ ...formData, paymentCurrencyOverride: c })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="tolerances" className="space-y-6 focus-visible:outline-none">
                    <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                Validation & Matching Tolerances
                            </CardTitle>
                            <CardDescription>Define system-wide limits for automated validation holds.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                    <Label className="text-sm font-semibold">Price Tolerance (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.priceTolerancePercent}
                                        onChange={(e) => setFormData({ ...formData, priceTolerancePercent: e.target.value })}
                                        className="bg-white"
                                    />
                                    <p className="text-xs text-muted-foreground font-medium">Allowable unit price difference from Purchase Order line.</p>
                                </div>
                                <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                    <Label className="text-sm font-semibold">Quantity Tolerance (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.qtyTolerancePercent}
                                        onChange={(e) => setFormData({ ...formData, qtyTolerancePercent: e.target.value })}
                                        className="bg-white"
                                    />
                                    <p className="text-xs text-muted-foreground font-medium">Allowable quantity exception before triggering QTY_VARIANCE stay.</p>
                                </div>
                                <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                    <Label className="text-sm font-semibold">Tax Tolerance (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.taxTolerancePercent}
                                        onChange={(e) => setFormData({ ...formData, taxTolerancePercent: e.target.value })}
                                        className="bg-white"
                                    />
                                    <p className="text-xs text-muted-foreground font-medium">Rounding tolerance for system-calculated tax lines.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="accounting" className="space-y-6 focus-visible:outline-none">
                    <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg">Subledger Accounting Policies</CardTitle>
                            <CardDescription>Control when and how subledger journals are generated for AP transactions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid gap-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-base">Account on Invoice Validation</Label>
                                        <p className="text-sm text-muted-foreground max-w-xl">
                                            Automatically trigger SLA engine when an invoice status changes to 'VALIDATED'.
                                            Creates DR Expense / CR Liability entries.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.accountOnValidation}
                                        onCheckedChange={(c) => setFormData({ ...formData, accountOnValidation: c })}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-base">Account on Payment Creation</Label>
                                        <p className="text-sm text-muted-foreground max-w-xl">
                                            Trigger SLA accounting when a payment is confirmed.
                                            Creates DR Liability / CR Cash entries.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.accountOnPayment}
                                        onCheckedChange={(c) => setFormData({ ...formData, accountOnPayment: c })}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-base">Allow Draft Accounting</Label>
                                        <p className="text-sm text-muted-foreground max-w-xl">
                                            Allow previewing accounting journals from the side sheet before they are final.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.allowDraftAccounting}
                                        onCheckedChange={(c) => setFormData({ ...formData, allowDraftAccounting: c })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="distribution" className="space-y-6 focus-visible:outline-none">
                    <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Distribution Sets</CardTitle>
                                <CardDescription>Expense allocation templates for rapid invoice entry.</CardDescription>
                            </div>
                            <Dialog open={isDistDialogOpen} onOpenChange={setIsDistDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-9">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create New Set
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Create Distribution Set</DialogTitle>
                                        <CardDescription>Define a template of GL accounts and percentage weights.</CardDescription>
                                    </DialogHeader>
                                    <div className="space-y-6 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Set Name</Label>
                                                <Input
                                                    placeholder="e.g. Utility Split"
                                                    value={newSet.name}
                                                    onChange={e => setNewSet({ ...newSet, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Input
                                                    placeholder="Marketing vs Operations"
                                                    value={newSet.description}
                                                    onChange={e => setNewSet({ ...newSet, description: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="font-semibold">Distribution Lines</Label>
                                                <Button type="button" variant="outline" size="sm" onClick={handleAddDistLine}>
                                                    <Plus className="h-3 w-3 mr-1" /> Add Line
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                {setLines.map((line, idx) => (
                                                    <div key={idx} className="flex gap-4 items-end bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                        <div className="flex-1 space-y-1.5">
                                                            <Label className="text-xs">GL Account Combination ID</Label>
                                                            <Input
                                                                type="number"
                                                                value={line.distCodeCombinationId}
                                                                onChange={e => {
                                                                    const newLines = [...setLines];
                                                                    newLines[idx].distCodeCombinationId = parseInt(e.target.value);
                                                                    setSetLines(newLines);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="w-32 space-y-1.5">
                                                            <Label className="text-xs">Percent (%)</Label>
                                                            <Input
                                                                type="number"
                                                                value={line.distributionPercent}
                                                                onChange={e => {
                                                                    const newLines = [...setLines];
                                                                    newLines[idx].distributionPercent = e.target.value;
                                                                    setSetLines(newLines);
                                                                }}
                                                            />
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="text-destructive h-10 w-10" onClick={() => handleRemoveDistLine(idx)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsDistDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={handleCreateSet} disabled={createDistSetMutation.isPending}>
                                            {createDistSetMutation.isPending ? "Creating..." : "Create Template"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {Array.isArray(distSets) && distSets.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <Layers className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                                    <p className="font-medium">No distribution sets defined.</p>
                                    <p className="text-sm">Sets allow you to split invoice lines automatically across multiple GL accounts.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array.isArray(distSets) && distSets.map((set: any) => (
                                        <div key={set.id} className="group relative flex items-center justify-between p-4 border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white border shadow-sm text-primary rounded-lg group-hover:scale-110 transition-transform">
                                                    <Layers className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{set.name}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{set.description || "System generated template"}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
