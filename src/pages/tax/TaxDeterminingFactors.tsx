import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, GripVertical, Trash2, Info } from "lucide-react";

const DEMO_RULES: any[] = [
    { id: "dr-1", priority: 10, shipFromRegion: "United Kingdom", shipToRegion: "United Kingdom", itemCategory: "Any", transactionType: "Any", resultRegime: "UK VAT", resultTax: "UK Standard VAT", status: "Active" },
    { id: "dr-2", priority: 20, shipFromRegion: "EU Member State", shipToRegion: "EU Member State", itemCategory: "Goods", transactionType: "Any", resultRegime: "EU VAT", resultTax: "Standard Rate VAT", status: "Active" },
    { id: "dr-3", priority: 30, shipFromRegion: "EU Member State", shipToRegion: "EU Member State", itemCategory: "Services", transactionType: "B2B", resultRegime: "EU VAT", resultTax: "Reverse Charge", status: "Active" },
    { id: "dr-4", priority: 40, shipFromRegion: "Any", shipToRegion: "UAE", itemCategory: "Any", transactionType: "Any", resultRegime: "UAE VAT", resultTax: "UAE VAT", status: "Active" },
    { id: "dr-5", priority: 50, shipFromRegion: "Any", shipToRegion: "Australia", itemCategory: "Any", transactionType: "Any", resultRegime: "GST – Australia", resultTax: "Australian GST", status: "Active" },
    { id: "dr-6", priority: 99, shipFromRegion: "Any", shipToRegion: "Any", itemCategory: "Any", transactionType: "Any", resultRegime: "None", resultTax: "No Tax", status: "Active" },
];

const CONDITION_OPTIONS = {
    shipRegion: ["Any", "United Kingdom", "EU Member State", "United States", "UAE", "Australia", "Canada", "Singapore"],
    itemCategory: ["Any", "Goods", "Services", "Digital Products", "Financial Services", "Healthcare", "Education", "Food & Beverage"],
    transactionType: ["Any", "B2B", "B2C", "Import", "Export", "Intra-EU"],
};

export default function TaxDeterminingFactors() {
    const { toast } = useToast();
    const [ruleDialog, setRuleDialog] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [newRule, setNewRule] = useState({
        priority: "60",
        shipFromRegion: "Any",
        shipToRegion: "Any",
        itemCategory: "Any",
        transactionType: "Any",
        resultRegime: "",
        resultTax: "",
    });

    const columns = useMemo((): SpreadsheetColumn<any>[] => [
        { id: "priority", header: "Priority", width: "90px", cell: (r) => <span className="font-mono font-semibold text-center w-full block">{r.priority}</span> },
        { id: "shipFromRegion", header: "Ship-From Region", width: "180px" },
        { id: "shipToRegion", header: "Ship-To Region", width: "180px" },
        { id: "itemCategory", header: "Item Category", width: "160px", cell: (r) => <Badge variant="outline" className="text-xs">{r.itemCategory}</Badge> },
        { id: "transactionType", header: "Transaction Type", width: "160px", cell: (r) => <Badge variant="secondary" className="text-xs">{r.transactionType}</Badge> },
        { id: "resultRegime", header: "→ Result Regime", width: "170px", cell: (r) => <span className="font-medium text-primary">{r.resultRegime}</span> },
        { id: "resultTax", header: "→ Result Tax", width: "180px", cell: (r) => <span className="text-sm">{r.resultTax}</span> },
        {
            id: "status", header: "Status", width: "110px", cell: (r) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-muted text-muted-foreground'}`}>
                    {r.status}
                </span>
            )
        },
        {
            id: "actions", header: "", width: "60px", cell: (r) => (
                <Button variant="ghost" size="icon" aria-label="Delete rule" onClick={() => setDeleteTargetId(r.id)} className="h-7 w-7">
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
            )
        },
    ], []);

    const handleAddRule = () => {
        if (!newRule.resultRegime || !newRule.resultTax) {
            toast({ title: "Result Regime and Tax are required", variant: "destructive" });
            return;
        }
        toast({ title: "Tax determining rule created", description: `Priority ${newRule.priority}: ${newRule.shipToRegion} → ${newRule.resultRegime}` });
        setRuleDialog(false);
    };

    return (
        <StandardPage
            title="Tax Determining Factor Rules"
            description="Define condition-based rules that automatically determine which Tax Regime and Tax applies to a transaction based on geography, item class, and transaction type."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Tax Management", href: "/tax" },
                { label: "Determining Factor Rules" },
            ]}
            actions={
                <Button onClick={() => setRuleDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Rule
                </Button>
            }
        >
            <Card className="mb-4 border-blue-200 bg-blue-50/30 dark:bg-blue-900/10">
                <CardContent className="p-4 flex items-start gap-3">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        Rules are evaluated in ascending <strong>Priority</strong> order. The first rule whose conditions match the transaction wins. Always define a catch-all rule at the lowest priority (e.g., Priority 99: Any → Any → No Tax) to handle unmatched transactions.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Condition-Based Determination Rules</CardTitle>
                    <CardDescription>
                        Evaluated top-to-bottom at transaction time. Lower priority number = evaluated first.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 h-[480px]">
                    <InteractiveSpreadsheet data={DEMO_RULES} columns={columns} onChange={() => { }} containerHeight="480px" />
                </CardContent>
            </Card>

            {/* Add Rule Dialog */}
            <Dialog open={ruleDialog} onOpenChange={setRuleDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add Tax Determining Rule</DialogTitle>
                        <DialogDescription>Define conditions and the resulting tax regime. Rules are matched top-to-bottom by priority.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Priority * <span className="text-xs text-muted-foreground">(lower = evaluated first)</span></Label>
                            <Input type="number" value={newRule.priority} onChange={e => setNewRule({ ...newRule, priority: e.target.value })} className="font-mono w-24" />
                        </div>
                        <Separator />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Conditions (all must match)</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ship-From Region</Label>
                                <Select value={newRule.shipFromRegion} onValueChange={v => setNewRule({ ...newRule, shipFromRegion: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{CONDITION_OPTIONS.shipRegion.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Ship-To Region</Label>
                                <Select value={newRule.shipToRegion} onValueChange={v => setNewRule({ ...newRule, shipToRegion: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{CONDITION_OPTIONS.shipRegion.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Item Category</Label>
                                <Select value={newRule.itemCategory} onValueChange={v => setNewRule({ ...newRule, itemCategory: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{CONDITION_OPTIONS.itemCategory.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Transaction Type</Label>
                                <Select value={newRule.transactionType} onValueChange={v => setNewRule({ ...newRule, transactionType: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{CONDITION_OPTIONS.transactionType.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Separator />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Result</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Resulting Tax Regime *</Label>
                                <Input value={newRule.resultRegime} onChange={e => setNewRule({ ...newRule, resultRegime: e.target.value })} placeholder="e.g. EU VAT" />
                            </div>
                            <div className="space-y-2">
                                <Label>Resulting Tax *</Label>
                                <Input value={newRule.resultTax} onChange={e => setNewRule({ ...newRule, resultTax: e.target.value })} placeholder="e.g. Standard Rate VAT" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRuleDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddRule}>Add Rule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteTargetId} onOpenChange={open => !open && setDeleteTargetId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete This Rule?</AlertDialogTitle>
                        <AlertDialogDescription>This tax determining rule will be permanently removed. Any transactions currently relying on this rule may become untaxed.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => {
                            toast({ title: "Rule deleted" });
                            setDeleteTargetId(null);
                        }}>Delete Rule</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
